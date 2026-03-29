import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  createApiKey,
  createSession,
  createUser,
  deleteApiKeyForUser,
  deleteSessionByTokenHash,
  getApiKeyByHash,
  getSessionByTokenHash,
  getUserByEmail,
  getUserById,
  listApiKeysForUser,
  revokeApiKeysForUser
} from "@/lib/db";

export const SESSION_COOKIE = "agentcomet_session";

type VisibleApiKey = {
  id: string;
  name: string;
  prefix: string;
  value: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

function getEncryptionKey() {
  return createHash("sha256")
    .update(process.env.AGENTCOMET_ENCRYPTION_KEY ?? "agentcomet-local-dev-encryption-key")
    .digest();
}

function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptSecret(payload: string | null) {
  if (!payload) {
    return null;
  }
  const [ivRaw, tagRaw, encryptedRaw] = payload.split(":");
  if (!ivRaw || !tagRaw || !encryptedRaw) {
    return null;
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivRaw, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), derived);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  createSession(userId, tokenHash, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (raw) {
    deleteSessionByTokenHash(hashToken(raw));
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  const session = getSessionByTokenHash(hashToken(raw));
  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    deleteSessionByTokenHash(hashToken(raw));
    return null;
  }

  return {
    id: session.user_id,
    email: session.email,
    name: session.name
  };
}

export function issueApiKey(userId: string, name = "Local SDK key") {
  const secret = randomBytes(24).toString("hex");
  const key = `ac_local_${secret}`;
  createApiKey({
    userId,
    name,
    prefix: key.slice(0, 16),
    keyHash: hashToken(key),
    encryptedKey: encryptSecret(key)
  });
  return key;
}

export async function authenticateApiKey(rawApiKey: string) {
  const record = getApiKeyByHash(hashToken(rawApiKey));
  if (!record || record.revoked_at) {
    return null;
  }
  return {
    apiKeyId: record.id,
    userId: record.user_id,
    email: record.email,
    name: record.name
  };
}

export async function registerLocalUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = getUserByEmail(input.email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user = createUser({
    email: input.email,
    name: input.name,
    passwordHash: hashPassword(input.password)
  });
  revokeApiKeysForUser(user.id);
  const apiKey = issueApiKey(user.id);
  await createUserSession(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    apiKey
  };
}

export async function loginLocalUser(input: { email: string; password: string }) {
  const user = getUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.password_hash)) {
    throw new Error("Invalid email or password.");
  }
  await createUserSession(user.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export function getUserApiKeys(userId: string): VisibleApiKey[] {
  return listApiKeysForUser(userId).map((key) => ({
    ...key,
    value: decryptSecret(key.encrypted_key)
  }));
}

export function createAdditionalApiKey(userId: string, name: string) {
  return issueApiKey(userId, name || "Local SDK key");
}

export function removeUserApiKey(userId: string, apiKeyId: string) {
  deleteApiKeyForUser(apiKeyId, userId);
}

export function regenerateUserApiKey(userId: string) {
  revokeApiKeysForUser(userId);
  return issueApiKey(userId, "Regenerated local SDK key");
}

export function getUserProfile(userId: string) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}
