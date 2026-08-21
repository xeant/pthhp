import { createHash } from "crypto";

const hashRefreshToken = (token: string) => createHash("sha256").update(token).digest("hex");

export { hashRefreshToken };
