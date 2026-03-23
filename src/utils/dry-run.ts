import { z } from 'zod';

// Zod schema fragment to merge into any write tool schema
export const dryRunSchema = z.object({
  dryRun: z
    .boolean()
    .default(true)
    .describe(
      'When true (default), returns a preview of what would happen without executing. Set to false to actually perform the operation.'
    ),
});

// Standard dry-run response builder
export function dryRunResponse(operation: string, details: Record<string, unknown>) {
  return {
    content: [
      {
        type: 'text' as const,
        text: `🔒 DRY RUN — ${operation}\n\nThis operation was NOT executed. Preview of what would happen:\n${JSON.stringify(details, null, 2)}\n\nTo execute for real, call again with dryRun: false`,
      },
    ],
  };
}
