import z from "zod";
import { educationItemSchema } from "./_s_educationSchema";
import { experienceItemSchema } from "./_s_experienceSchema";
import { layoutConfigsSchema } from "./_s_layoutSchema";
import { personalInformationSchema } from "./_s_personalInformationSchema";
import { skillGroupSchema } from "./_s_skillsSchema";

export const cvDataSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  visibility: z.enum(["draft", "private", "public"]).optional(),
  password: z.string().optional(),
  // Subschemas
  layoutConfigs: layoutConfigsSchema,
  personalInformation: personalInformationSchema,
  experience: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skillGroups: z.array(skillGroupSchema),
});

export type CvData = z.infer<typeof cvDataSchema>;
