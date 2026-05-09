import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { URL } from "node:url"
import { pollNext, postResult, getSessionStatus, touchSession } from "../agent/sessions.js"
import type { AgentResultEnvelope } from "../types.js"

let serverStarted = false

export async function startHttpServer(port = 7337): Promise<void> {
  if (serverStarted) return

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

  json(res, 404, { ok: false, error: "Not found" })
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
