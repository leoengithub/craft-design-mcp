import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CraftWorkflowState } from "../types.js"
import { prepareReadyArtifacts } from "../agent/prepare-ready.js"
import { awaitRequestResult, createRequest } from "../agent/sessions.js"

const StateSchema = z.object({
  phase: z.enum(["project_setup", "block_definition", "direction_choice", "define_or_design", "ready", "block_done", "all_done"]),
  goal: z.string(),
  block_plan: z.array(z.object({ block: z.string(), status: z.enum(["pending", "current", "completed"]) })),
  current_block: z.string().optional(),
  execution: z.object({
    renderer: z.enum(["code", "figma"]).optional(),
    figma_session_id: z.string().optional(),
  }).optional(),
  project_context: z.object({
    audience: z.string().optional(),
    tone: z.string().optional(),
    platform: z.enum(["web", "mobile", "both"]).optional(),
    brand_notes: z.string().optional(),
  }).optional(),
  direction: z.object({
    id: z.string(),
    name: z.string(),
    design_system: z.string(),
  }).optional(),
  block_definitions: z.record(z.object({
    primary_action: z.string().optional(),
    notes: z.array(z.string()).optional(),
  })),
  design_md: z.string(),
  existing_components: z.array(z.string()).optional(),
  component_mappings: z.array(z.object({
    component_name: z.string(),
    source_path: z.string().optional(),
    semantic_component_id: z.string(),
    variants: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    prop_mapping: z.record(z.string()).optional(),
    renderer_hints: z.array(z.string()).optional(),
  })).optional(),
  custom_design_system: z.object({
    tokens: z.any(),
    anti_patterns: z.array(z.string()),
  }).optional(),
})

export function registerExecuteCraftReady(server: McpServer) {
  server.tool(
    "execute_craft_ready",
    "Canonical execution path for Craft once the workflow is in phase 'ready'. Recomputes the disciplined Craft payload from state and executes the primary renderer path. For Figma this always uses figma_render_tree semantics internally, not ad hoc low-level ops.",
    {
      state: StateSchema,
      timeout_ms: z.number().int().positive().max(300000).optional(),
    },
    async ({ state, timeout_ms }) => {
      const typedState = state as CraftWorkflowState
      if (typedState.phase !== "ready") {
        throw new Error(`execute_craft_ready requires phase 'ready', got '${typedState.phase}'`)
      }

      const prepared = await prepareReadyArtifacts(typedState)

      if (typedState.execution?.renderer === "figma") {
        const sessionId = typedState.execution.figma_session_id
        if (!sessionId) {
          throw new Error("Figma renderer selected but no figma_session_id is present in state")
        }
        const ops = [{ op: "render_tree" as const, plan: prepared.renderTree }]
        const { requestId } = createRequest(sessionId, "execute_plan", {
          description: `Craft execute ready "${prepared.renderTree.artifact_name}"`,
          ops,
          render_intent: prepared.renderIntent,
        })
        const result = await awaitRequestResult(sessionId, requestId, timeout_ms ?? 300_000)
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              renderer: "figma",
              request_id: requestId,
              critique_findings: prepared.critiqueFindings,
              preflight_findings: prepared.preflightFindings,
              craft_context: prepared.craftContext,
              render_intent: prepared.renderIntent,
              render_tree: prepared.renderTree,
              result,
            }),
          }],
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            renderer: typedState.execution?.renderer ?? "code",
            critique_findings: prepared.critiqueFindings,
            preflight_findings: prepared.preflightFindings,
            craft_context: prepared.craftContext,
            render_intent: prepared.renderIntent,
            render_tree: prepared.renderTree,
            hint: "Execution payload prepared. For non-Figma renderers, the host agent must still carry out the target renderer step.",
          }),
        }],
      }
    }
  )
}
