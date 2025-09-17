import { z } from "zod";

export const experienceItemSchema = z
  .object({
    role: z.string().min(1, { message: "Role is required" }),
    company: z.string().min(1, { message: "Company name is required" }),
    startDate: z
      .string()
      .min(1, { message: "Start date is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date (YYYY-MM-DD)",
      }),
    currentlyWorkingHere: z.boolean(),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "End date must be a valid date (YYYY-MM-DD)",
      }),
    location: z.string().optional(),
    description: z.string().optional(),
    isEditing: z.boolean().optional(),
  })
  .strict()
  // Rule: endDate required unless currently working
  .refine((data) => data.currentlyWorkingHere || !!data.endDate, {
    message: "End date is required unless you are currently working here",
    path: ["endDate"],
  })
  // Rule: endDate must not be before startDate
  .refine(
    (data) =>
      !data.endDate || Date.parse(data.endDate) >= Date.parse(data.startDate),
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );

export type ExperienceItem = z.infer<typeof experienceItemSchema>;
