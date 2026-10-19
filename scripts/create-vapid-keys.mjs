import fs from "node:fs";
import path from "node:path";
import { generateKeyPairSync } from "node:crypto";
const target = process.argv[2];
if (!target)
  throw Error(
    "Provide an empty directory outside the repository for the key files",
  );
const directory = path.resolve(target),
  relative = path.relative(process.cwd(), directory);
if (!relative.startsWith("..") && !path.isAbsolute(relative))
  throw Error("Store key files outside the repository");
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
if (fs.readdirSync(directory).length) throw Error("Use an empty key directory");
const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" }),
  jwk = privateKey.export({ format: "jwk" });
const publicKey = Buffer.concat([
  Buffer.from([4]),
  Buffer.from(jwk.x, "base64url"),
  Buffer.from(jwk.y, "base64url"),
]).toString("base64url");
fs.writeFileSync(path.join(directory, "vapid-private.txt"), jwk.d, {
  mode: 0o600,
  flag: "wx",
});
fs.writeFileSync(path.join(directory, "vapid-public.txt"), publicKey, {
  mode: 0o600,
  flag: "wx",
});
console.log(
  `Created protected key files in ${directory}. Configure the private key as a server secret; never paste it into chat or commit it.`,
);
