/** Convert provider SSE into our small public protocol with bounded memory and cancellation. */
export function normalizeStream(
  provider: ReadableStream<Uint8Array>,
  timeoutMs = 45000,
) {
  const encoder = new TextEncoder(),
    reader = provider.getReader();
  let cancelled = false,
    timedOut = false;
  let timer: ReturnType<typeof setTimeout>;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "",
        total = 0;
      const decoder = new TextDecoder();
      timer = setTimeout(() => {
        timedOut = true;
        void reader.cancel().catch(() => {});
      }, timeoutMs);
      function line(value: string) {
        const cleaned = value.trim();
        if (!cleaned.startsWith("data: ") || cleaned === "data: [DONE]") return;
        const data = JSON.parse(cleaned.slice(6)) as {
          response?: string;
          error?: unknown;
        };
        if (data.error) throw Error();
        if (typeof data.response === "string") {
          total += data.response.length;
          if (total > 20000) throw Error();
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: data.response })}\n\n`,
            ),
          );
        }
      }
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          if (buffer.length > 100000) throw Error();
          let end;
          while ((end = buffer.indexOf("\n")) >= 0) {
            line(buffer.slice(0, end));
            buffer = buffer.slice(end + 1);
          }
        }
        if (buffer.trim()) line(buffer);
        if (timedOut && !cancelled)
          controller.enqueue(
            encoder.encode(
              'data: {"error":"Tutor timed out. Please try later."}\n\n',
            ),
          );
      } catch {
        if (!cancelled)
          controller.enqueue(
            encoder.encode(
              'data: {"error":"Tutor resting. Please try later."}\n\n',
            ),
          );
      } finally {
        clearTimeout(timer);
        await reader.cancel().catch(() => {});
        reader.releaseLock();
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
      clearTimeout(timer);
      return reader.cancel().catch(() => {});
    },
  });
}
export async function providerDeadline<T>(
  operation: Promise<T>,
  milliseconds = 15000,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let expired = false;
  try {
    return await Promise.race([
      operation.then((value) => {
        if (expired && value instanceof ReadableStream)
          void value.cancel().catch(() => {});
        return value;
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          expired = true;
          reject(Error("Provider deadline exceeded"));
        }, milliseconds);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
