# ServerPulse Frontend

A professional, responsive server-monitoring dashboard built with React, Vite, and Recharts.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Production Build](#production-build)
- [Environment Configuration](#environment-configuration)
- [Authentication](#authentication)
- [Backend API Endpoints](#backend-api-endpoints)
- [Known Backend Limitations](#known-backend-limitations)
- [Troubleshooting](#troubleshooting)

---

## Overview

ServerPulse is a Linux server health and log monitoring platform. This frontend communicates
with a Spring Boot + PostgreSQL backend to display registered servers and their real-time
metric data: CPU usage, memory usage, disk usage, load average, and log error counts.

**Pages:**
| Page | Route | Description |
|------|-------|-------------|
| Overview | `/overview` | Summary cards + server inventory table |
| Servers | `/servers` | Full server list with latest metric snapshot panel |
| Server Detail | `/servers/:name` | Individual server with charts |
| Metrics | `/metrics` | Chart exploration with server selector |
| Alerts | `/alerts` | Client-side threshold warnings (see limitations) |
| Settings | `/settings` | Display preferences (stored locally) |

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- The **ServerPulse backend** running on `localhost:8080` (Spring Boot)
- PostgreSQL with a registered server and active monitoring agent (to see real data)

---

## Installation

```bash
cd frontend
npm install
```

---

## Development

```bash
npm run dev
```

The app starts at **http://localhost:5173**.

The Vite dev server proxies all `/api/*` and `/actuator/*` requests to `http://localhost:8080`,
so the backend must be running locally. No CORS configuration is needed.

---

## Production Build

```bash
npm run build
```

Output goes to `frontend/dist/`. Serve it from any static file host or behind a reverse proxy.

Preview the production build locally:

```bash
npm run preview
```

---

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=      # Leave empty to use the Vite proxy (development)
                        # Set to your API base URL for production, e.g. https://api.example.com
VITE_REFRESH_INTERVAL=30000  # Auto-refresh interval in ms (30 seconds default)
```

**Do not place credentials or API keys in any `.env` file.**

---

## Authentication

The backend uses **HTTP Basic authentication**. Admin credentials are configured via environment
variables when the backend starts:

```
SERVERPULSE_ADMIN_USERNAME=<your_username>
SERVERPULSE_ADMIN_PASSWORD=<your_password>
```

The frontend prompts for credentials on the login page and verifies them with a real API call.
Credentials are stored **in memory only** — they are never written to `localStorage`, cookies,
or any other persistent storage. Credentials are cleared when the page reloads.

During development, the Vite proxy forwards requests to `localhost:8080`. Credentials travel
only between the browser and your local machine.

---

## Backend API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/servers` | ADMIN | List all registered servers |
| `GET` | `/api/servers/{name}/metrics` | ADMIN | Up to 100 recent metrics (newest-first) |
| `GET` | `/api/servers/{name}/latest` | ADMIN | Latest metric for a server |
| `GET` | `/actuator/health` | Public | Backend health check |
| `POST` | `/api/agent/metrics` | Agent API key | **Not used by the frontend** |
| `POST` | `/api/admin/servers` | ADMIN | Register a server (admin only, not in dashboard) |

**ServerMetric response fields:**
```json
{
  "id": 1,
  "serverName": "my-server",
  "cpuUsage": 45.2,
  "memoryUsage": 72.1,
  "diskUsage": 38.4,
  "loadAverage": 1.25,
  "logErrorCount": 3,
  "recordedAt": "2024-10-25T14:32:05Z"
}
```

---

## Known Backend Limitations

### 1. No alert system
The backend does not include alert rules, alert history, or notifications. The Alerts page
shows client-side display warnings only and clearly documents this.

**What would be needed:** `GET/POST /api/alerts` endpoints, an alert rule table in PostgreSQL,
and optionally a notification delivery mechanism.

### 2. Fixed history window
`GET /api/servers/{name}/metrics` returns the 100 most recent records only. Arbitrary date range
queries (e.g. "show me last 7 days") are not supported.

**What would be needed:** A query parameter such as `?from=...&to=...` on the metrics endpoint,
backed by a repository query with a date range filter.

### 3. Active ≠ currently reporting
The `active` field on a server record reflects a database flag, not a live connectivity check.
A server may be marked active even if its monitoring agent has stopped running.

**What would be needed:** A "last seen" timestamp check with a configurable staleness threshold,
or a backend-driven health-check mechanism.

### 4. No server management UI
Registering new servers requires calling `POST /api/admin/servers` directly (e.g. with curl).
There is no frontend form for this because the response includes the raw API key, which must
not be stored or displayed in the browser.

---

## Troubleshooting

### "Cannot reach the backend"
- Ensure the Spring Boot backend is running: `cd backend && ./mvnw spring-boot:run`
- Confirm it is listening on port 8080 (default)
- Check that `SERVERPULSE_ADMIN_USERNAME` and `SERVERPULSE_ADMIN_PASSWORD` are set

### "Invalid username or password"
- Verify the credentials match the environment variables the backend was started with
- The backend hashes passwords with BCrypt — changing the env var requires restarting the backend

### Charts show no data
- Confirm the monitoring agent is running on the registered server
- Check that the agent's API key matches the one registered with the backend
- Use `GET /api/servers/{name}/latest` directly to verify metric data is arriving

### Vite proxy not working
- Make sure the backend is running on `localhost:8080` (not a different port)
- Check `vite.config.js` — the proxy target can be changed if needed

### Credentials lost on page reload
This is expected. Credentials are stored in memory only for security. Re-enter them on the
login page after reloading.
