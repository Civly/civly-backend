import * as z from "npm:zod@latest";

export const layoutConfigsSchema = z
  .object({
    templateId: z.number().int().nonnegative(),
    colorId: z.number().int().nonnegative(),
    fontSize: z.number().int(), // bounds elsewhere
  })
  .strict();

export type LayoutConfigs = z.infer<typeof layoutConfigsSchema>;
