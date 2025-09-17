import { z } from "zod";

export const skillGroupItemSchema = z
  .object({
    order: z
      .number()
      .int({ message: "Order must be an integer" })
      .nonnegative({ message: "Order must be zero or positive" }),
    name: z
      .string()
      .min(1, { message: "Skill name is required" })
      .max(100, { message: "Skill name must not exceed 100 characters" }),
  })
  .strict();

export const skillGroupSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Skill group name is required" })
      .max(100, { message: "Skill group name must not exceed 100 characters" }),
    order: z
      .number()
      .int({ message: "Order must be an integer" })
      .nonnegative({ message: "Order must be zero or positive" })
      .optional(),
    skills: z
      .array(skillGroupItemSchema)
      .min(1, { message: "Each group must have at least one skill" }),
  })
  .strict();

export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type SkillGroupItem = z.infer<typeof skillGroupItemSchema>;
