import * as z from "npm:zod@latest";

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

export const personalInformationSchema = z
  .object({
    name: z.string().min(1, { message: "First name is required" }),
    surname: z.string().min(1, { message: "Surname is required" }),

    profileUrl: z
      .url({ message: "Profile URL must be a valid URL" })
      .min(1, { message: "Profile URL is required" }),

    birthdate: z
      .string()
      .min(1, { message: "Birthdate is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Birthdate must be a valid ISO date (YYYY-MM-DD)",
      }),

    email: z
      .email({ message: "Email must be a valid address" })
      .optional()
      .or(z.literal("")),

    phone: z.string().optional(),

    location: z.string().optional(),

    linkedin: z
      .url({ message: "LinkedIn must be a valid URL" })
      .optional()
      .or(z.literal("")),

    xing: z
      .url({ message: "Xing must be a valid URL" })
      .optional()
      .or(z.literal("")),

    website: z
      .url({ message: "Website must be a valid URL" })
      .optional()
      .or(z.literal("")),

    professionalTitle: z.string().optional(),

    summary: z
      .string()
      .max(2000, {
        message: "Summary must not exceed 2000 characters",
      })
      .optional(),
  })
  .strict();

export const educationItemSchema = z
  .object({
    degree: z.string().min(1, { message: "Degree field is required" }),
    institution: z.string().min(1, { message: "Institution name is required" }),
    startDate: z
      .string()
      .min(1, { message: "Start date is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date (YYYY-MM-DD)",
      }),
    currentlyStudyingHere: z.boolean(),
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
  .refine(
    (data) => {
      if (!data.currentlyStudyingHere && !data.endDate) return false;
      return true;
    },
    {
      message: "End date is required unless you are currently studying here",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return Date.parse(data.endDate) >= Date.parse(data.startDate);
      }
      return true;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );
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
export const layoutConfigsSchema = z
  .object({
    templateId: z.number().int().nonnegative(),
    colorId: z.number().int().nonnegative(),
    fontSize: z.number().int(), // bounds elsewhere
  })
  .strict();

export const cvDataSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  userId: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  visibility: z.enum(["draft", "private", "public"]).optional(),
  password: z.string().optional(),
  // Subschemas
  layoutConfigs: layoutConfigsSchema,
  personalInformation: personalInformationSchema,
  experience: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skillGroups: z.array(skillGroupSchema),
});

export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type SkillGroupItem = z.infer<typeof skillGroupItemSchema>;
export type PersonalInformation = z.infer<typeof personalInformationSchema>;
export type LayoutConfigs = z.infer<typeof layoutConfigsSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type CvData = z.infer<typeof cvDataSchema>;
