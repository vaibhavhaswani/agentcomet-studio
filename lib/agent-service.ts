import {
  createAgentVersion,
  getAgentById,
  getAgentForUser,
  listAgentsForUser,
  listVersionsForAgent,
  markAgentPublished,
  touchApiKey,
  updateAgentForUser,
  updateAgentReadmeForUser,
  upsertAgent
} from "@/lib/db";
import { writeAgentArtifact } from "@/lib/storage";
import { slugify } from "@/lib/utils";

type SaveAgentInput = {
  userId: string;
  name: string;
  description: string;
  version: string;
  visibility: "private" | "public";
  readme: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  artifactFileName: string;
  artifactBuffer: Buffer;
  existingAgentId?: string | null;
};

async function persistAgentVersion(input: SaveAgentInput & { apiKeyId?: string }) {
  const slug = slugify(input.name);
  let agent;

  if (input.existingAgentId) {
    const existingAgent = getAgentForUser(input.existingAgentId, input.userId);
    if (!existingAgent) {
      throw new Error("Agent not found.");
    }
    agent = updateAgentForUser({
      agentId: input.existingAgentId,
      userId: input.userId,
      slug,
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      readme: input.readme
    });
  } else {
    agent = upsertAgent({
      userId: input.userId,
      slug,
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      readme: input.readme
    });
  }

  if (!agent) {
    throw new Error("Failed to save agent.");
  }

  const versionId = `version_${Date.now()}`;
  const storedArtifact = writeAgentArtifact({
    agentId: agent.id,
    versionId,
    fileName: input.artifactFileName,
    buffer: input.artifactBuffer,
    metadata: {
      name: agent.name,
      description: agent.description,
      version: input.version,
      visibility: agent.visibility,
      savedAt: new Date().toISOString(),
      metadata: input.metadata ?? {}
    }
  });

  const createdVersion = createAgentVersion({
    agentId: agent.id,
    version: input.version,
    notes: input.notes,
    metadataJson: input.metadata ? JSON.stringify(input.metadata, null, 2) : null,
    artifactPath: storedArtifact.artifactPath,
    artifactFileName: input.artifactFileName,
    artifactSha256: storedArtifact.artifactSha256,
    artifactSize: storedArtifact.artifactSize
  });

  if (input.apiKeyId) {
    touchApiKey(input.apiKeyId);
  }

  return {
    agent: getAgentById(agent.id),
    version: createdVersion
  };
}

export async function savePushedAgent(input: SaveAgentInput & { apiKeyId: string }) {
  return persistAgentVersion(input);
}

export async function saveManualAgent(input: SaveAgentInput) {
  return persistAgentVersion(input);
}

export function saveAgentReadme(userId: string, agentId: string, readme: string | null) {
  return updateAgentReadmeForUser(agentId, userId, readme);
}

export function getDashboardAgents(userId: string) {
  return listAgentsForUser(userId);
}

export function getOwnedAgent(agentId: string, userId: string) {
  return getAgentForUser(agentId, userId);
}

export function getAgentVersions(agentId: string) {
  return listVersionsForAgent(agentId);
}

export async function publishAgentToHub(input: {
  agentId: string;
  hubUrl: string;
  hubToken?: string;
  payload: Record<string, unknown>;
}) {
  const response = await fetch(input.hubUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(input.hubToken ? { Authorization: `Bearer ${input.hubToken}` } : {})
    },
    body: JSON.stringify(input.payload)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Hub publish failed.");
  }
  markAgentPublished(input.agentId);
  return response;
}
