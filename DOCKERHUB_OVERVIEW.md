# AgentComet Local Studio

Local registry and version control for stateful AI agents.

<img src="https://raw.githubusercontent.com/vaibhavhaswani/agentcomet-studio/966d4b65daba21997e2a56869620dfc74b4d65e2/samples/main_screen.png" alt="AgentComet Local Studio Main Screen" width="100%" />

## Overview

AgentComet Local Studio is a self-hosted local dashboard for managing AgentComet agents on your own machine. It gives developers a local registry for creating agents once, storing them safely, versioning them over time, and reusing them across multiple projects before publishing to a central hub.

The studio runs on `localhost`, stores metadata in SQLite, keeps agent artifacts on disk, and provides a clean UI for local agent management.

## What It Does

- Creates local accounts and API keys
- Stores agent metadata and versions in SQLite
- Stores uploaded `.uaf` artifacts on local disk
- Supports SDK-based local push flows
- Supports manual `.uaf` uploads for new agents and new versions
- Tracks version history for every registered agent
- Renders and edits README content in markdown
- Lets users inspect and download stored versions
- Supports publish-to-hub workflows when an agent is ready

## Agent Dashboard Example

This view shows how uploaded agents are listed inside the local dashboard after SDK pushes or manual `.uaf` registration.

<img src="https://raw.githubusercontent.com/vaibhavhaswani/agentcomet-studio/966d4b65daba21997e2a56869620dfc74b4d65e2/samples/agentdashboard_sample.png" alt="AgentComet Local Studio Dashboard" width="100%" />

## Why Use It

AgentComet Local Studio is useful when you want a local control plane for agent development instead of treating agents as one-off artifacts inside individual projects.

Typical workflow:

1. Create or register an agent once
2. Push new versions locally during development
3. Reuse that same agent in multiple projects
4. Review versions, README, and metadata in one place
5. Publish to the hub only when ready

## Runtime

- Next.js
- React
- SQLite
- Local filesystem storage
- Docker / Docker Compose ready

## Default Port

`3451`

## Data Storage

- SQLite database: `data/agentcomet.db`
- Agent artifacts: `data/agents/<agent_id>/versions/<version_id>/`

## Pull the Image

```bash
docker pull vaibhavhaswani/agentcomet-studio:latest
```

Versioned tag example:

```bash
docker pull vaibhavhaswani/agentcomet-studio:0.1.0
```

## Run the Container

```bash
docker run -p 3451:3451 \
  -v $(pwd)/data:/app/data \
  vaibhavhaswani/agentcomet-studio:latest
```

## Run with Docker Compose

```bash
docker compose up -d
```

## SDK Setup Example

```python
from agentcomet import Settings, Agent

Settings.init(
    AGENTCOMET_LOCAL_URL="http://localhost:3451",
    AGENTCOMET_LOCAL_KEY="your-local-key"
)
```

## Push Example

```python
push_result = agent.push_local(version="auto")
print(push_result)
```

## Intended Use

This image is intended for developers who want a local AgentComet environment for:

- local agent management
- agent version control
- SDK integration testing
- reusable agent workflows across projects
- pre-publish validation
