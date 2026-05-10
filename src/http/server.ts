import { execFile as execFileCallback } from "node:child_process"
import { randomUUID } from "node:crypto"
import { promisify } from "node:util"
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { URL } from "node:url"
import { pollNext, postResult, getSessionStatus, touchSession, listActiveSessions, disconnectSession } from "../agent/sessions.js"
import type { AgentResultEnvelope } from "../types.js"

let serverStarted = false
const execFile = promisify(execFileCallback)
const serverInstanceId = randomUUID()

export async function startHttpServer(port = 7337): Promise<void> {
  if (serverStarted) return

  try {
    await listen(port)
  } catch (error) {
    if (!isAddressInUse(error)) throw error
    await takeoverStaleCraftBridge(port)
    await listen(port)
  }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  setCors(res)
  if (!req.url) {
    json(res, 400, { ok: false, error: "Missing URL" })
    return
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, "http://localhost")

  if (req.method === "GET" && url.pathname === "/agent/status") {
    const sessionId = url.searchParams.get("session_id")
    if (!sessionId) {
      json(res, 400, { ok: false, error: "session_id is required" })
      return
    }
    json(res, 200, getSessionStatus(sessionId))
    return
  }

  if (req.method === "GET" && url.pathname === "/agent/server") {
    json(res, 200, { ok: true, instance_id: serverInstanceId, pid: process.pid })
    return
  }

  if (req.method === "GET" && url.pathname === "/agent/sessions") {
    json(res, 200, { sessions: listActiveSessions() })
    return
  }

  if (req.method === "GET" && url.pathname === "/agent/poll") {
    const sessionId = url.searchParams.get("session_id")
    if (!sessionId) {
      json(res, 400, { ok: false, error: "session_id is required" })
      return
    }

    const request = await pollNext(sessionId, 30_000)
    if (!request) {
      res.writeHead(204)
      res.end()
      return
    }

    json(res, 200, request)
    return
  }

  if (req.method === "POST" && url.pathname === "/agent/result") {
    const body = await readJson(req) as {
      session_id?: string
      request_id?: string
      result?: AgentResultEnvelope
    }

    if (!body.session_id || !body.request_id || !body.result) {
      json(res, 400, { ok: false, error: "session_id, request_id, and result are required" })
      return
    }

    try {
      postResult(body.session_id, body.request_id, body.result)
      json(res, 200, { ok: true })
    } catch (error) {
      json(res, 404, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
    return
  }

  if (req.method === "POST" && url.pathname === "/agent/heartbeat") {
    const body = await readJson(req) as { session_id?: string }
    if (!body.session_id) {
      json(res, 400, { ok: false, error: "session_id is required" })
      return
    }
    touchSession(body.session_id)
    json(res, 200, { ok: true })
    return
  }

  if (req.method === "POST" && url.pathname === "/agent/disconnect") {
    const body = await readJson(req) as { session_id?: string }
    if (!body.session_id) {
      json(res, 400, { ok: false, error: "session_id is required" })
      return
    }
    disconnectSession(body.session_id)
    json(res, 200, { ok: true })
    return
  }

  json(res, 404, { ok: false, error: "Not found" })
}

async function listen(port: number): Promise<void> {
  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res)
    } catch (error) {
      json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
  })

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(port, () => {
      serverStarted = true
      resolve()
    })
  })
}

function isAddressInUse(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "EADDRINUSE")
}

async function takeoverStaleCraftBridge(port: number): Promise<void> {
  const pids = await listListeningPids(port)
  for (const pid of pids) {
    if (pid === process.pid) continue
    const command = await describeProcess(pid)
    if (!/craft-design-mcp/i.test(command)) {
      throw new Error(`Port ${port} is already in use by non-Craft process ${pid}: ${command}`)
    }
    try {
      process.kill(pid, "SIGTERM")
    } catch {
      continue
    }
  }

  await waitForPortRelease(port, 3000)
}

async function listListeningPids(port: number): Promise<number[]> {
  try {
    const { stdout } = await execFile("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"])
    return stdout
      .split(/\s+/)
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value))
  } catch {
    return []
  }
}

async function describeProcess(pid: number): Promise<string> {
  try {
    const { stdout } = await execFile("ps", ["-p", String(pid), "-o", "command="])
    return stdout.trim()
  } catch {
    return ""
  }
}

async function waitForPortRelease(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const pids = await listListeningPids(port)
    if (pids.length === 0) return
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error(`Timed out waiting for stale Craft Bridge listener on :${port} to exit`)
}

function setCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString("utf8")
  return raw ? JSON.parse(raw) : {}
}
