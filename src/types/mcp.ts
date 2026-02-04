/**
 * MCP Tool Response and Input Types
 */

/**
 * Standard response from MCP tools
 */
export type ToolResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
};

/**
 * Search tool input
 */
export interface SearchToolInput {
  resourceType: "candidates" | "companies" | "projects" | "timereports";
  query?: string;
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
}

/**
 * Get resource tool input
 */
export interface GetToolInput {
  resourceType: "candidates" | "companies" | "projects" | "timereports";
  id: string;
}

/**
 * Create resource tool input
 */
export interface CreateToolInput {
  resourceType: "candidates" | "companies" | "projects" | "timereports";
  data: Record<string, unknown>;
}

/**
 * Update resource tool input
 */
export interface UpdateToolInput {
  resourceType: "candidates" | "companies" | "projects" | "timereports";
  id: string;
  data: Record<string, unknown>;
}

/**
 * Union of all tool input types
 */
export type ToolInput =
  | SearchToolInput
  | GetToolInput
  | CreateToolInput
  | UpdateToolInput;
