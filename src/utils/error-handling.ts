import { z } from "zod";
import { NotFoundError, ValidationError } from "../api/client.js";
import { formatZodErrors } from "./formatting.js";

export interface ToolErrorResult {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
  [key: string]: unknown;
}

export function handleToolError(
  error: unknown,
  operation: string,
  resourceName: string
): ToolErrorResult {
  if (error instanceof NotFoundError) {
    return {
      content: [
        {
          type: "text",
          text: `${resourceName} not found`,
        },
      ],
      isError: true,
    };
  }

  if (error instanceof ValidationError) {
    return {
      content: [
        {
          type: "text",
          text: `Validation error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      content: [
        {
          type: "text",
          text: `Validation error: ${formatZodErrors(error.errors)}`,
        },
      ],
      isError: true,
    };
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  return {
    content: [
      {
        type: "text",
        text: `Error ${operation} ${resourceName.toLowerCase()}: ${message}`,
      },
    ],
    isError: true,
  };
}

export function handleSearchError(
  error: unknown,
  resourceName: string
): ToolErrorResult {
  if (error instanceof z.ZodError) {
    return {
      content: [
        {
          type: "text",
          text: `Validation error: ${formatZodErrors(error.errors)}`,
        },
      ],
      isError: true,
    };
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  return {
    content: [
      {
        type: "text",
        text: `Error searching ${resourceName.toLowerCase()}: ${message}`,
      },
    ],
    isError: true,
  };
}
