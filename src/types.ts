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
  component_mappings?: ComponentMapping[]
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

export type ResolutionSource = "codebase" | "craft_ds" | "local_figma" | "materialized_local" | "primitive"

export interface SemanticVariantSpec {
  id: string
  slots?: string[]
  composition_rules?: string[]
}

export interface SemanticComponentSpec {
  id: string
  category: string
  slots: string[]
  variants: SemanticVariantSpec[]
  states: string[]
  required_tokens: string[]
  composition_rules: string[]
  fallback_kind: "stack" | "text" | "button" | "badge" | "divider" | "spacer"
}

export interface ComponentMapping {
  component_name: string
  source_path?: string
  semantic_component_id: string
  variants?: string[]
  states?: string[]
  prop_mapping?: Record<string, string>
  renderer_hints?: string[]
}

export interface ResolvedComponentRef {
  semantic_component_id: string
  source: ResolutionSource
  target_name: string
  variant?: string
  state?: string
  mapping_name?: string
  allow_fallback: boolean
}

export interface SemanticNodeMetadata {
  component_id: string
  variant?: string
  state?: string
  slots?: Record<string, string>
  token_overrides?: Record<string, string>
  resolution_target?: "codebase" | "design_system" | "auto"
  allow_fallback?: boolean
}

export interface DesignSystemComponentManifest {
  semantic_component_id: string
  label: string
  variants?: string[]
  states?: string[]
  preferred_tokens?: string[]
  composition_rules?: string[]
}

export interface DesignSystemManifest {
  name: string
  label: string
  components: DesignSystemComponentManifest[]
  critique_rules: string[]
}

export interface SkillManifest {
  block_type: string
  root_component_id?: string
  preferred_components: string[]
  required_components: string[]
  critique_rules: string[]
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

export interface RenderIntent {
  artifact_name: string
  renderer: "figma" | "code"
  surface_kind: "marketing" | "application" | "settings" | "dashboard" | "auth" | "content" | "custom"
  target_context?: {
    target_node_id?: string
    selection_name?: string
    file_session_id?: string
  }
  content: {
    block_tree: Array<{
      id: string
      kind: string
      purpose: string
      content?: Record<string, string | string[]>
      children?: string[]
    }>
    primary_action?: string
  }
  style: {
    tone?: string
    density?: "compact" | "balanced" | "spacious"
    platform?: "web" | "mobile" | "both"
  }
  design_system: {
    source: "craft"
    tokens: string[]
    component_preferences: string[]
    anti_patterns: string[]
  }
  execution: {
    auto_run: boolean
    reuse_existing_assets: boolean
    materialize_missing_assets: boolean
    persist_generated_assets: boolean
  }
}

export interface RenderBlockPlan {
  artifact_name: string
  asset_section_name: string
  block: string
  goal: string
  platform: "web" | "mobile" | "both"
  mode: "free" | "structured"
  layout:
    | "hero"
    | "navigation"
    | "feedback-bar"
    | "pricing"
    | "feature-grid"
    | "kpi-summary"
    | "data-table"
    | "sidebar"
    | "form"
    | "empty-state"
    | "footer"
    | "toolbar"
    | "accordion"
    | "generic"
  direction: {
    id: string
    name: string
    design_system: string
  }
  tokens: DesignSystemTokens
  style: {
    primary: string
    bg: string
    surface: string
    text: string
    muted: string
    border: string
    accent?: string
  }
  content: {
    eyebrow?: string
    title?: string
    body?: string
    cta_label?: string
    secondary_cta_label?: string
    stats?: Array<{ label: string; value: string; delta?: string }>
    items?: Array<{ title: string; body?: string; badge?: string; meta?: string }>
    columns?: Array<{ title: string; price?: string; body?: string; cta_label?: string; featured?: boolean; bullets?: string[] }>
    links?: string[]
  }
}

export type RenderTextRole = "display" | "headline" | "subheadline" | "body" | "label" | "caption"

interface RenderTreeCommon {
  semantic?: SemanticNodeMetadata
  resolution?: ResolvedComponentRef
}

export type RenderTreeNode =
  | ({
      kind: "stack"
      name: string
      direction: "VERTICAL" | "HORIZONTAL"
      gap?: number
      padding?: number
      width?: number
      min_height?: number
      fill?: string
      stroke?: string
      radius?: number
      align?: "MIN" | "CENTER" | "SPACE_BETWEEN"
      children: RenderTreeNode[]
    } & RenderTreeCommon)
  | ({
      kind: "text"
      text: string
      role: RenderTextRole
      color?: string
      max_width?: number
      align?: "LEFT" | "CENTER"
    } & RenderTreeCommon)
  | ({
      kind: "button"
      label: string
      variant: "primary" | "secondary" | "ghost"
    } & RenderTreeCommon)
  | ({
      kind: "badge"
      label: string
    } & RenderTreeCommon)
  | ({
      kind: "divider"
    } & RenderTreeCommon)
  | ({
      kind: "spacer"
      size: number
    } & RenderTreeCommon)

export interface RenderTreePlan {
  artifact_name: string
  asset_section_name: string
  goal: string
  block: string
  platform: "web" | "mobile" | "both"
  tokens: DesignSystemTokens
  palette: {
    primary: string
    bg: string
    surface: string
    text: string
    muted: string
    border: string
    accent?: string
  }
  root: RenderTreeNode
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
  render_intent?: RenderIntent
  render_plan?: RenderBlockPlan
  render_tree?: RenderTreePlan
  critique_findings?: string[]
  preflight_findings?: string[]
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
  | { op: "render_block"; plan: RenderBlockPlan }
  | { op: "render_tree"; plan: RenderTreePlan }
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
  | { description: string; ops: AgentOp[]; render_intent?: RenderIntent }

export interface AgentRequestEnvelope {
  request_id: string
  type: AgentRequestType
  payload: AgentRequestPayload
}

export type AgentResultEnvelope =
  | { type: "context"; success: boolean; data?: DetectedLanguage; message?: string }
  | { type: "op"; data: OpResult }
  | { type: "plan"; approved: boolean; results?: OpResult[]; message?: string }
