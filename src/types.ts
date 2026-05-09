export type WorkflowPhase =
  | "project_setup"
  | "block_definition"
  | "direction_choice"
  | "define_or_design"
  | "ready"
  | "block_done"
  | "all_done"

export type BlockStatus = "pending" | "current" | "completed"

export interface CraftWorkflowState {
  phase: WorkflowPhase
  goal: string
  block_plan: Array<{ block: string; status: BlockStatus }>
  current_block?: string
  execution?: {
    renderer?: "code" | "figma"
    figma_session_id?: string
  }
  project_context?: {
    audience?: string
    tone?: string
    platform?: "web" | "mobile" | "both"
    brand_notes?: string
  }
  direction?: {
    id: string
    name: string
    design_system: string
  }
  block_definitions: Record<string, {
    primary_action?: string
    notes?: string[]
  }>
  design_md: string
  existing_components?: string[]
  custom_design_system?: {
    tokens: DesignSystemTokens
    anti_patterns: string[]
  }
}

export interface Direction {
  id: string
  name: string
  description: string
  reference: string
  design_system: string
  palette_preview: string[]
  typeface: string
}

export interface DesignSystemTokens {
  colors: Record<string, string>
  typography: {
    display: { family: string; weight: string; sizes: string[] }
    body: { family: string; weight: string; sizes: string[] }
    mono?: { family: string }
  }
  spacing: {
    base: number
    scale: number[]
  }
  radius: Record<string, string>
  shadows: Record<string, string>
}

export interface CraftContext {
  block: string
  parent_goal: string
  mode?: "free" | "structured"
  brief: {
    primary_action: string
    audience?: string
    tone?: string
    notes?: string[]
  }
  direction: {
    id: string
    name: string
    design_system: string
  }
  tokens: DesignSystemTokens
  constraints: {
    layout_rules: string[]
    component_patterns: string[]
    anti_patterns: string[]
  }
  design_md_snapshot: string
  existing_components?: string[]
}

export type ContinueCraftAction =
  | { type: "answer_project_questions"; answers: string[] }
  | { type: "answer_block_questions"; answers: string[] }
  | { type: "choose_direction"; direction_id: string }
  | { type: "define_more"; details: string }
  | { type: "request_design" }
  | { type: "approve_block"; block: string }
  | { type: "restart_block" }

export interface PluginSpec {
  version: "1"
  mode: "free" | "structured"
  block: string
  goal: string
  direction: { id: string; name: string; design_system: string }
  tokens: DesignSystemTokens
  brief: {
    primary_action: string
    audience?: string
    tone?: string
    notes?: string[]
  }
  platform: "web" | "mobile" | "both"
  constraints: {
    layout_rules: string[]
    component_patterns: string[]
    anti_patterns: string[]
  }
  existing_components?: string[]
}

export interface ContinueCraftOutput {
  state: CraftWorkflowState
  design_md_patch?: string
  questions?: string[]
  directions?: Direction[]
  design_preview?: string
  craft_context?: CraftContext
  plugin_spec?: PluginSpec
  resume_prompt?: string
  hint: string
}

export interface DetectedLanguage {
  colors: Record<string, string>
  typography: {
    body?: { family: string; size: number; weight: number }
    label?: { family: string; size: number; weight: number }
    display?: { family: string; size: number; weight: number }
  }
  spacing: { gap?: number; padding_h?: number; padding_v?: number }
  radius: Record<string, number>
  components_present: string[]
  target_node?: { id: string; name: string; type: string; child_count?: number }
}

export type AgentOp =
  | { op: "get_context" }
  | { op: "create_frame"; name: string; width: number; height: number; direction?: "HORIZONTAL" | "VERTICAL" | "NONE"; padding?: number; gap?: number; fill?: string; x?: number; y?: number }
  | { op: "create_text"; text: string; fontSize?: number; fontWeight?: "Regular" | "Medium" | "SemiBold"; fill?: string; parentId?: string; x?: number; y?: number }
  | { op: "apply_fill"; nodeId: string; hex: string }
  | { op: "set_text"; nodeId: string; text: string }
  | { op: "scaffold_block"; spec: PluginSpec }

export interface OpResult {
  success: boolean
  nodeId?: string
  context?: DetectedLanguage
  message?: string
}

export type AgentRequestType = "get_context" | "execute_op" | "execute_plan"

export type AgentRequestPayload =
  | {}
  | { op: AgentOp }
  | { description: string; ops: AgentOp[] }

export interface AgentRequestEnvelope {
  request_id: string
  type: AgentRequestType
  payload: AgentRequestPayload
}

export type AgentResultEnvelope =
  | { type: "context"; success: boolean; data?: DetectedLanguage; message?: string }
  | { type: "op"; data: OpResult }
  | { type: "plan"; approved: boolean; results?: OpResult[]; message?: string }
