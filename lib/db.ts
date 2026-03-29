import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = join(process.cwd(), "data", "agentcomet.db");
mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);

function ignoreLocked(error: unknown) {
  if (error instanceof Error && error.message.includes("database is locked")) {
    return;
  }
  throw error;
}

try {
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA journal_mode = WAL;");
} catch (error) {
  ignoreLocked(error);
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      encrypted_key TEXT,
      last_used_at TEXT,
      revoked_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      visibility TEXT NOT NULL,
      readme TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_published_at TEXT,
      UNIQUE (user_id, slug),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS agent_versions (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      version TEXT NOT NULL,
      notes TEXT,
      metadata_json TEXT,
      artifact_path TEXT NOT NULL,
      artifact_file_name TEXT NOT NULL,
      artifact_sha256 TEXT NOT NULL,
      artifact_size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (agent_id, version),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );
  `);

  try {
    db.exec("ALTER TABLE api_keys ADD COLUMN encrypted_key TEXT;");
  } catch {
    // Column already exists.
  }
} catch (error) {
  ignoreLocked(error);
}

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

export type DashboardAgentRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: string;
  readme: string | null;
  created_at: string;
  updated_at: string;
  last_published_at: string | null;
  latest_version: string | null;
  latest_version_created_at: string | null;
  version_count: number;
};

export type AgentDetailRecord = DashboardAgentRecord;

export type AgentVersionRecord = {
  id: string;
  version: string;
  notes: string | null;
  metadata_json: string | null;
  artifact_path: string;
  artifact_file_name: string;
  artifact_sha256: string;
  artifact_size: number;
  created_at: string;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  encrypted_key: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function hasAnyUsers() {
  const row = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  return row.count > 0;
}

export function createUser(input: { email: string; name: string; passwordHash: string }) {
  const record = {
    id: createId("usr"),
    email: input.email,
    name: input.name,
    password_hash: input.passwordHash,
    created_at: nowIso()
  };
  db.prepare(
    "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(record.id, record.email, record.name, record.password_hash, record.created_at);
  return record;
}

export function getUserByEmail(email: string) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRecord | undefined;
}

export function getUserById(id: string) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRecord | undefined;
}

export function createSession(userId: string, tokenHash: string, expiresAt: string) {
  const record = {
    id: createId("sess"),
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_at: nowIso()
  };
  db.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(record.id, record.user_id, record.token_hash, record.expires_at, record.created_at);
  return record;
}

export function getSessionByTokenHash(tokenHash: string) {
  return db
    .prepare(
      `SELECT sessions.id, sessions.user_id, sessions.expires_at, users.email, users.name
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?`
    )
    .get(tokenHash) as
    | {
        id: string;
        user_id: string;
        expires_at: string;
        email: string;
        name: string;
      }
    | undefined;
}

export function deleteSessionByTokenHash(tokenHash: string) {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export function createApiKey(input: {
  userId: string;
  name: string;
  prefix: string;
  keyHash: string;
  encryptedKey: string | null;
}) {
  const record = {
    id: createId("key"),
    user_id: input.userId,
    name: input.name,
    prefix: input.prefix,
    key_hash: input.keyHash,
    encrypted_key: input.encryptedKey,
    last_used_at: null,
    revoked_at: null,
    created_at: nowIso()
  };
  db.prepare(
    `INSERT INTO api_keys (id, user_id, name, prefix, key_hash, encrypted_key, last_used_at, revoked_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    record.id,
    record.user_id,
    record.name,
    record.prefix,
    record.key_hash,
    record.encrypted_key,
    record.last_used_at,
    record.revoked_at,
    record.created_at
  );
  return record;
}

export function listApiKeysForUser(userId: string) {
  return db
    .prepare(
      `SELECT id, name, prefix, encrypted_key, last_used_at, revoked_at, created_at
       FROM api_keys
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
    .all(userId) as ApiKeyRecord[];
}

export function revokeApiKeysForUser(userId: string) {
  db.prepare("UPDATE api_keys SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL").run(
    nowIso(),
    userId
  );
}

export function getApiKeyByHash(keyHash: string) {
  return db
    .prepare(
      `SELECT api_keys.id, api_keys.user_id, api_keys.revoked_at, users.email, users.name
       FROM api_keys
       JOIN users ON users.id = api_keys.user_id
       WHERE api_keys.key_hash = ?`
    )
    .get(keyHash) as
    | {
        id: string;
        user_id: string;
        revoked_at: string | null;
        email: string;
        name: string;
      }
    | undefined;
}

export function touchApiKey(apiKeyId: string) {
  db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(nowIso(), apiKeyId);
}

export function deleteApiKeyForUser(apiKeyId: string, userId: string) {
  db.prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?").run(apiKeyId, userId);
}

export function upsertAgent(input: {
  userId: string;
  slug: string;
  name: string;
  description: string;
  visibility: string;
  readme: string | null;
}) {
  const existing = db
    .prepare("SELECT id, readme FROM agents WHERE user_id = ? AND slug = ?")
    .get(input.userId, input.slug) as { id: string; readme: string | null } | undefined;
  const timestamp = nowIso();

  if (existing) {
    db.prepare(
      `UPDATE agents
       SET readme = ?, updated_at = ?
       WHERE id = ?`
    ).run(input.readme ?? existing.readme, timestamp, existing.id);
    return getAgentById(existing.id);
  }

  const id = createId("agt");
  db.prepare(
    `INSERT INTO agents (id, user_id, slug, name, description, visibility, readme, created_at, updated_at, last_published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.userId,
    input.slug,
    input.name,
    input.description,
    input.visibility,
    input.readme,
    timestamp,
    timestamp,
    null
  );
  return getAgentById(id);
}

export function updateAgentForUser(input: {
  agentId: string;
  userId: string;
  slug: string;
  name: string;
  description: string;
  visibility: string;
  readme: string | null;
}) {
  const existing = getAgentForUser(input.agentId, input.userId);
  if (!existing) {
    return null;
  }

  const timestamp = nowIso();
  const nextReadme = input.readme ?? existing.readme;
  const result = db.prepare(
    `UPDATE agents
     SET readme = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`
  ).run(nextReadme, timestamp, input.agentId, input.userId) as { changes?: number };

  if (!result?.changes) {
    return null;
  }

  return getAgentById(input.agentId);
}

export function updateAgentReadmeForUser(agentId: string, userId: string, readme: string | null) {
  const timestamp = nowIso();
  const result = db.prepare(
    `UPDATE agents
     SET readme = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`
  ).run(readme, timestamp, agentId, userId) as { changes?: number };

  if (!result?.changes) {
    return null;
  }

  return getAgentById(agentId);
}

export function createAgentVersion(input: {
  agentId: string;
  version: string;
  notes: string | null;
  metadataJson: string | null;
  artifactPath: string;
  artifactFileName: string;
  artifactSha256: string;
  artifactSize: number;
}) {
  const record = {
    id: createId("ver"),
    agent_id: input.agentId,
    version: input.version,
    notes: input.notes,
    metadata_json: input.metadataJson,
    artifact_path: input.artifactPath,
    artifact_file_name: input.artifactFileName,
    artifact_sha256: input.artifactSha256,
    artifact_size: input.artifactSize,
    created_at: nowIso()
  };
  db.prepare(
    `INSERT INTO agent_versions
      (id, agent_id, version, notes, metadata_json, artifact_path, artifact_file_name, artifact_sha256, artifact_size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    record.id,
    record.agent_id,
    record.version,
    record.notes,
    record.metadata_json,
    record.artifact_path,
    record.artifact_file_name,
    record.artifact_sha256,
    record.artifact_size,
    record.created_at
  );
  db.prepare("UPDATE agents SET updated_at = ? WHERE id = ?").run(record.created_at, input.agentId);
  return record;
}

export function listAgentsForUser(userId: string) {
  return db
    .prepare(
      `SELECT
         agents.id,
         agents.name,
         agents.slug,
         agents.description,
         agents.visibility,
         agents.readme,
         agents.created_at,
         agents.updated_at,
         agents.last_published_at,
         latest.version AS latest_version,
         latest.created_at AS latest_version_created_at,
         COALESCE(version_counts.count, 0) AS version_count
       FROM agents
       LEFT JOIN (
         SELECT v1.agent_id, v1.version, v1.created_at
         FROM agent_versions v1
         INNER JOIN (
           SELECT agent_id, MAX(created_at) AS created_at
           FROM agent_versions
           GROUP BY agent_id
         ) latest ON latest.agent_id = v1.agent_id AND latest.created_at = v1.created_at
       ) latest ON latest.agent_id = agents.id
       LEFT JOIN (
         SELECT agent_id, COUNT(*) AS count
         FROM agent_versions
         GROUP BY agent_id
       ) version_counts ON version_counts.agent_id = agents.id
       WHERE agents.user_id = ?
       ORDER BY agents.updated_at DESC`
    )
    .all(userId) as DashboardAgentRecord[];
}

export function getAgentById(agentId: string) {
  return db
    .prepare(
      `SELECT
         agents.id,
         agents.name,
         agents.slug,
         agents.description,
         agents.visibility,
         agents.readme,
         agents.created_at,
         agents.updated_at,
         agents.last_published_at,
         latest.version AS latest_version,
         latest.created_at AS latest_version_created_at,
         COALESCE(version_counts.count, 0) AS version_count
       FROM agents
       LEFT JOIN (
         SELECT v1.agent_id, v1.version, v1.created_at
         FROM agent_versions v1
         INNER JOIN (
           SELECT agent_id, MAX(created_at) AS created_at
           FROM agent_versions
           GROUP BY agent_id
         ) latest ON latest.agent_id = v1.agent_id AND latest.created_at = v1.created_at
       ) latest ON latest.agent_id = agents.id
       LEFT JOIN (
         SELECT agent_id, COUNT(*) AS count
         FROM agent_versions
         GROUP BY agent_id
       ) version_counts ON version_counts.agent_id = agents.id
       WHERE agents.id = ?`
    )
    .get(agentId) as AgentDetailRecord | undefined;
}

export function getAgentForUser(agentId: string, userId: string) {
  return db
    .prepare("SELECT * FROM agents WHERE id = ? AND user_id = ?")
    .get(agentId, userId) as
    | {
        id: string;
        user_id: string;
        name: string;
        slug: string;
        description: string;
        visibility: string;
        readme: string | null;
      }
    | undefined;
}

export function listVersionsForAgent(agentId: string) {
  return db
    .prepare(
      `SELECT id, version, notes, metadata_json, artifact_path, artifact_file_name, artifact_sha256, artifact_size, created_at
       FROM agent_versions
       WHERE agent_id = ?
       ORDER BY created_at DESC`
    )
    .all(agentId) as AgentVersionRecord[];
}

export function getVersionForAgent(agentId: string, versionId: string) {
  return db
    .prepare(
      `SELECT id, version, notes, metadata_json, artifact_path, artifact_file_name, artifact_sha256, artifact_size, created_at
       FROM agent_versions
       WHERE agent_id = ? AND id = ?`
    )
    .get(agentId, versionId) as AgentVersionRecord | undefined;
}

export function getAgentBySlugForUser(slug: string, userId: string) {
  return db
    .prepare("SELECT * FROM agents WHERE slug = ? AND user_id = ?")
    .get(slug, userId) as
    | {
        id: string;
        user_id: string;
        name: string;
        slug: string;
        description: string;
        visibility: string;
        readme: string | null;
      }
    | undefined;
}

export function getLatestVersionForAgent(agentId: string) {
  return db
    .prepare(
      `SELECT id, version, notes, metadata_json, artifact_path, artifact_file_name, artifact_sha256, artifact_size, created_at
       FROM agent_versions
       WHERE agent_id = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(agentId) as AgentVersionRecord | undefined;
}

export function getVersionByLabelForAgent(agentId: string, version: string) {
  return db
    .prepare(
      `SELECT id, version, notes, metadata_json, artifact_path, artifact_file_name, artifact_sha256, artifact_size, created_at
       FROM agent_versions
       WHERE agent_id = ? AND version = ?`
    )
    .get(agentId, version) as AgentVersionRecord | undefined;
}

export function markAgentPublished(agentId: string) {
  const timestamp = nowIso();
  db.prepare("UPDATE agents SET last_published_at = ?, updated_at = ? WHERE id = ?").run(
    timestamp,
    timestamp,
    agentId
  );
}

