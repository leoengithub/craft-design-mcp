import { randomUUID } from "node:crypto"
import type { AgentRequestEnvelope, AgentRequestPayload, AgentRequestType, AgentResultEnvelope } from "../types.js"

type RequestStatus = "queued" | "delivered" | "completed" | "cancelled"

interface SessionRequest {
  id: string
  type: AgentRequestType
  payload: AgentRequestPayload
  status: RequestStatus
  createdAt: number
  deliveredAt?: number
  timeoutAt?: number
  result?: AgentResultEnvelope
  error?: string
  resolve: (result: AgentResultEnvelope) => void
  reject: (error: Error) => void
}

interface AgentSession {
  requests: Map<string, SessionRequest>
  queue: string[]
  waiters: Array<(request: AgentRequestEnvelope | null) => void>
  lastSeenAt?: number
}

const sessions = new Map<string, AgentSession>()

function getSession(sessionId: string): AgentSession {
  let session = sessions.get(sessionId)
  if (!session) {
    session = {
      requests: new Map(),
      queue: [],
      waiters: [],
    }
    sessions.set(sessionId, session)
  }
  return session
}

export function createRequest(sessionId: string, type: AgentRequestType, payload: AgentRequestPayload) {
  const session = getSession(sessionId)
  const requestId = randomUUID()

  let resolve!: (result: AgentResultEnvelope) => void
  let reject!: (error: Error) => void
  const promise = new Promise<AgentResultEnvelope>((res, rej) => {
    resolve = res
    reject = rej
  })

  const request: SessionRequest = {
    id: requestId,
    type,
    payload,
    status: "queued",
    createdAt: Date.now(),
    resolve,
    reject,
  }

  session.requests.set(requestId, request)
  session.queue.push(requestId)
  flushWaiters(session)

  return { requestId, promise }
}

export async function pollNext(sessionId: string, timeoutMs = 30_000): Promise<AgentRequestEnvelope | null> {
  const session = getSession(sessionId)
  const available = dequeue(session)
  if (available) return available

  return await new Promise<AgentRequestEnvelope | null>((resolve) => {
    const timer = setTimeout(() => {
      session.waiters = session.waiters.filter(waiter => waiter !== waiterResolve)
      resolve(null)
    }, timeoutMs)

    const waiterResolve = (request: AgentRequestEnvelope | null) => {
      clearTimeout(timer)
      resolve(request)
    }

    session.waiters.push(waiterResolve)
  })
}

export function awaitRequestResult(sessionId: string, requestId: string, timeoutMs = 60_000): Promise<AgentResultEnvelope> {
  const session = getSession(sessionId)
  const request = session.requests.get(requestId)
  if (!request) {
    return Promise.reject(new Error(`Unknown request: ${requestId}`))
  }

  if (request.status === "completed" && request.result) {
    return Promise.resolve(request.result)
  }
  if (request.status === "cancelled") {
    return Promise.reject(new Error(request.error ?? "Request cancelled"))
  }

  request.timeoutAt = Date.now() + timeoutMs

  return new Promise<AgentResultEnvelope>((resolve, reject) => {
    const timer = setTimeout(() => {
      request.status = "cancelled"
      request.error = "Timed out waiting for Figma plugin response"
      reject(new Error(request.error))
    }, timeoutMs)

    request.resolve = (result) => {
      clearTimeout(timer)
      resolve(result)
    }
    request.reject = (error) => {
      clearTimeout(timer)
      reject(error)
    }
  })
}

export function postResult(sessionId: string, requestId: string, result: AgentResultEnvelope): void {
  const session = getSession(sessionId)
  const request = session.requests.get(requestId)
  if (!request) {
    throw new Error(`Unknown request: ${requestId}`)
  }
  if (request.status === "completed") return

  request.status = "completed"
  request.result = result
  request.resolve(result)
}

export function getSessionStatus(sessionId: string) {
  const session = getSession(sessionId)
  let pendingCount = 0
  for (const request of session.requests.values()) {
    if (request.status === "queued" || request.status === "delivered") pendingCount += 1
  }
  return { ok: true, pending_count: pendingCount }
}

export function getExistingSessionStatus(sessionId: string) {
  const session = sessions.get(sessionId)
  if (!session) {
    return { ok: false, connected: false, pending_count: 0 }
  }

  let pendingCount = 0
  for (const request of session.requests.values()) {
    if (request.status === "queued" || request.status === "delivered") pendingCount += 1
  }

  return { ok: true, connected: true, pending_count: pendingCount }
}

export function touchSession(sessionId: string): void {
  const session = getSession(sessionId)
  session.lastSeenAt = Date.now()
}

function flushWaiters(session: AgentSession): void {
  while (session.waiters.length > 0) {
    const request = dequeue(session)
    if (!request) return
    const waiter = session.waiters.shift()
    waiter?.(request)
  }
}

function dequeue(session: AgentSession): AgentRequestEnvelope | null {
  while (session.queue.length > 0) {
    const requestId = session.queue.shift()!
    const request = session.requests.get(requestId)
    if (!request || request.status !== "queued") continue
    request.status = "delivered"
    request.deliveredAt = Date.now()
    return {
      request_id: request.id,
      type: request.type,
      payload: request.payload,
    }
  }
  return null
}
