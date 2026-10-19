import { createRemoteJWKSet, jwtVerify } from "jose";
const keys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);
export async function assessmentUser(
  token: string,
  project: string,
  resolver: Parameters<typeof jwtVerify>[1] = keys,
) {
  const { payload } = await jwtVerify(token, resolver, {
    issuer: `https://securetoken.google.com/${project}`,
    audience: project,
    algorithms: ["RS256"],
    requiredClaims: ["sub", "iat", "exp", "auth_time"],
  });
  if (
    !payload.sub ||
    payload.sub.length > 128 ||
    !Number.isFinite(Number(payload.auth_time)) ||
    Number(payload.iat) > Date.now() / 1000 ||
    Number(payload.auth_time) > Date.now() / 1000
  )
    throw Error("Invalid identity");
  return payload.sub;
}
