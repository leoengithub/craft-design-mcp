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
}

export type ContinueCraftAction =
  | { type: "answer_project_questions"; answers: string[] }
  | { type: "answer_block_questions"; answers: string[] }
  | { type: "choose_direction"; direction_id: string }
  | { type: "define_more"; details: string }
  | { type: "request_design" }
  | { type: "approve_block"; block: string }
  | { type: "restart_block" }

export interface ContinueCraftOutput {
  state: CraftWorkflowState
  design_md_patch?: string
  questions?: string[]
  directions?: Direction[]
  design_preview?: string
  craft_context?: CraftContext
  resume_prompt?: string
  hint: string
}
