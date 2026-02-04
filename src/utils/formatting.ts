import { z } from "zod";

export function formatZodErrors(errors: z.ZodError["errors"]): string {
  return errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
}
