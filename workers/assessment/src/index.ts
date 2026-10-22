import { firebaseUser } from "../../shared/auth";
import {
  assessmentItems,
  gradeItem,
  VERSION,
  supported,
  type Item,
} from "./bank";
interface Env {
  SITE_ORIGIN: string;
  FIREBASE_PROJECT_ID: string;
  ENABLE_ASSESSMENTS: string;
  ASSESSMENTS: DurableObjectNamespace;
}
interface Receipt {
  id: string;
  lessonId: string;
  version: string;
  score: number;
  passed: boolean;
  gradedAt: number;
  correct: number;
  total: number;
}
interface Session {
  id: string;
  version: string;
  lessonId: string;
  createdAt: number;
  items: Item[];
  answers?: Record<string, string>;
  receipt?: Receipt;
}
interface Ledger {
  day: string;
  count: number;
  requests: Record<string, { attemptId: string; lessonId: string }>;
  sessions: Record<string, Session>;
  receipts: Receipt[];
}
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export class AssessmentLedger {
  constructor(private state: DurableObjectState) {}
  async fetch(request: Request) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/history")
      return json(
        (await this.state.storage.get<Ledger>("ledger"))?.receipts || [],
      );
    if (request.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    const raw = await request.text();
    if (raw.length > 16384) return json({ error: "Request too large" }, 413);
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(raw);
      if (!input || Array.isArray(input) || typeof input !== "object")
        throw Error();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    return this.state.storage.transaction(async (tx) => {
      const now = Date.now(),
        day = new Date(now).toISOString().slice(0, 10);
      const ledger = (await tx.get<Ledger>("ledger")) || {
        day,
        count: 0,
        requests: {},
        sessions: {},
        receipts: [],
      };
      if (ledger.day !== day) {
        ledger.day = day;
        ledger.count = 0;
        ledger.requests = {};
      }
      for (const [id, s] of Object.entries(ledger.sessions))
        if (now - s.createdAt > 86400000) delete ledger.sessions[id];
      if (path === "/start") {
        if (
          Object.keys(input).some(
            (k) => !["lessonId", "requestId"].includes(k),
          ) ||
          typeof input.lessonId !== "string" ||
          !supported.includes(input.lessonId) ||
          typeof input.requestId !== "string" ||
          !/^[a-zA-Z0-9-]{16,80}$/.test(input.requestId)
        )
          return json(
            { error: "Choose a supported lesson and request ID" },
            400,
          );
        const previous = ledger.requests[input.requestId];
        if (previous && previous.lessonId !== input.lessonId)
          return json(
            { error: "Request ID already used for another lesson" },
            409,
          );
        let session = previous
          ? ledger.sessions[previous.attemptId]
          : undefined;
        if (!session) {
          if (ledger.count >= 20)
            return json({ error: "Daily assessment limit reached" }, 429);
          ledger.count++;
          session = {
            id: crypto.randomUUID(),
            version: VERSION,
            lessonId: input.lessonId,
            createdAt: now,
            items: assessmentItems(input.lessonId),
          };
          ledger.sessions[session.id] = session;
          ledger.requests[input.requestId] = {
            attemptId: session.id,
            lessonId: input.lessonId,
          };
        }
        await tx.put("ledger", ledger);
        return json({
          attemptId: session.id,
          version: session.version,
          expiresAt: session.createdAt + 1200000,
          questions: session.items.map(
            ({ answer, exact, ...publicItem }) => publicItem,
          ),
        });
      }
      if (path !== "/submit") return json({ error: "Not found" }, 404);
      if (
        Object.keys(input).some((k) => !["attemptId", "answers"].includes(k)) ||
        typeof input.attemptId !== "string" ||
        !input.answers ||
        Array.isArray(input.answers) ||
        typeof input.answers !== "object"
      )
        return json({ error: "Invalid submission" }, 400);
      const session = ledger.sessions[input.attemptId];
      if (!session)
        return json({ error: "Attempt not found for this account" }, 404);
      const answers = input.answers as Record<string, string>;
      if (
        Object.keys(answers).length !== session.items.length ||
        session.items.some(
          (q) =>
            typeof answers[q.id] !== "string" ||
            !answers[q.id].trim() ||
            answers[q.id].length > 100,
        )
      )
        return json({ error: "Answer each issued question exactly once" }, 400);
      const canonical = Object.fromEntries(
        session.items.map((q) => [q.id, answers[q.id].trim()]),
      );
      if (session.receipt) {
        if (JSON.stringify(canonical) !== JSON.stringify(session.answers))
          return json({ error: "This attempt was already graded" }, 409);
        return json(session.receipt);
      }
      if (now - session.createdAt > 1200000)
        return json(
          { error: "Attempt expired; start another assessment" },
          410,
        );
      const correct = session.items.filter((q) =>
        gradeItem(canonical[q.id], q),
      ).length;
      const receipt: Receipt = {
        id: session.id,
        lessonId: session.lessonId,
        version: session.version,
        correct,
        total: session.items.length,
        score: correct / session.items.length,
        passed: correct / session.items.length >= 0.8,
        gradedAt: now,
      };
      session.answers = canonical;
      session.receipt = receipt;
      ledger.receipts = [receipt, ...ledger.receipts].slice(0, 100);
      await tx.put("ledger", ledger);
      return json(receipt);
    });
  }
}
export default {
  async fetch(request: Request, env: Env) {
    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    if (request.headers.get("Origin") !== env.SITE_ORIGIN)
      return Response.json(
        { error: "Origin not allowed" },
        { status: 403, headers },
      );
    Object.assign(headers, {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN,
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    const token = request.headers.get("Authorization");
    if (!token?.startsWith("Bearer "))
      return Response.json(
        { error: "Sign in required" },
        { status: 401, headers },
      );
    let uid: string;
    try {
      uid = await firebaseUser(token.slice(7), env.FIREBASE_PROJECT_ID);
    } catch {
      return Response.json(
        { error: "Invalid session" },
        { status: 401, headers },
      );
    }
    if (env.ENABLE_ASSESSMENTS !== "true")
      return Response.json(
        { error: "Server assessments are not activated" },
        { status: 503, headers },
      );
    const path = new URL(request.url).pathname;
    if (!["/start", "/submit", "/history"].includes(path))
      return Response.json({ error: "Not found" }, { status: 404, headers });
    try {
      const ledger = env.ASSESSMENTS.get(env.ASSESSMENTS.idFromName(uid));
      const response = await ledger.fetch(
        new Request(`https://ledger.internal${path}`, request),
      );
      return new Response(response.body, {
        status: response.status,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    } catch {
      return Response.json(
        {
          error: "Assessment service unavailable; no local score is certified",
        },
        { status: 503, headers },
      );
    }
  },
};
