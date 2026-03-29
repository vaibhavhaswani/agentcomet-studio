# AgentComet Studio

Local Agent Management Dashboard for building, testing, versioning, reusing, and publishing AgentComet agents before they go to the main hub.

## What It Is

AgentComet Studio is a self-hosted local control plane for AgentComet agents. It gives developers a localhost dashboard for:

- creating a local account and API keys
- pushing agents from the SDK
- uploading `.uaf` packages manually
- tracking agent versions and artifacts
- editing README content in markdown
- pulling agents back locally by slug and version
- publishing selected agents to the main AgentComet Hub

It is designed for a create-once, reuse-everywhere workflow. A developer can define and register an agent once in AgentComet Studio, keep its versions organized locally, and then use that same agent across multiple projects without rebuilding the packaging flow each time.

## Core Capabilities

- SQLite-backed local metadata store for users, sessions, API keys, agents, and versions
- local artifact storage under `data/agents/<agent_id>/versions/<version_id>/`
- dashboard listing agent name, description, latest version, timestamps, and local status
- agent detail pages with markdown README rendering, version history, inspect, and download
- SDK setup page with local connection examples
- local pull endpoint for latest or specific agent versions
- manual README editing inside the UI
- reusable local agent registry so the same agent can be pulled into multiple apps and codebases

## Stack

- Next.js App Router
- React
- SQLite via `node:sqlite`
- local filesystem artifact storage
- Tailwind-based UI styled to match the AgentComet website direction

## Quick Start

1. Install dependencies.
2. Copy `.env.example` to `.env.local` if needed.
3. Start the app:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3451
```

## Default Configuration

```bash
AGENTCOMET_PORT=3451
NEXT_PUBLIC_APP_PORT=3451
NEXT_PUBLIC_APP_URL=http://localhost:3451
```

`AGENTCOMET_PORT` controls the actual server port. If it is unset, the app falls back to `PORT`, then `3451`.

## SDK Flow

The local SDK flow is documented in the in-app `SDK Setup` page. The expected local configuration pattern is:

```python
from agentcomet import Settings, Agent

Settings.init(
    AGENTCOMET_LOCAL_URL="http://localhost:3451",
    AGENTCOMET_LOCAL_KEY="your-local-key"
)
```

Typical workflow:

- push an agent locally with automatic versioning
- pull the latest uploaded agent by slug
- pull a specific version when exact reproducibility is required
- reuse the same registered agent in different local projects after it has been created once

## Why Studio Helps

AgentComet Studio is useful when you want agents to behave like reusable local building blocks instead of one-off project files.

- create an agent once and keep it in a local registry
- manage its README, metadata, and version history in one place
- pull that agent into different projects as needed
- test changes locally before publishing anything upstream
- keep team or personal workflows consistent across experiments and products

## Local Data Layout

```text
data/
  agentcomet.db
  agents/
    <agent_id>/
      versions/
        <version_id>/
          <artifact>.uaf
          manifest.json
```

## Features in the UI

- minimal landing page for local setup
- signup-first onboarding
- generated local API keys with management UI
- dashboard search and full-card navigation
- manual agent registration via `.uaf`
- manual version uploads for existing agents
- markdown README editor and renderer
- publish-to-hub action with visibility selection at publish time

## Optional Hub Publishing

```bash
AGENTCOMET_HUB_URL=https://your-hub-endpoint.example/api/publish
AGENTCOMET_HUB_TOKEN=optional-bearer-token
```

## Project Notes

- this project is designed for developer-first local workflows
- agent visibility is intentionally local-only until publish time
- local database files and uploaded artifacts are ignored from git
