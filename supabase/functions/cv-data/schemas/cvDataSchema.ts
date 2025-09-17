import z from "zod";
import { educationItemSchema } from "./educationSchema";
import { experienceItemSchema } from "./experienceSchema";
import { layoutConfigsSchema } from "./layoutSchema";
import { personalInformationSchema } from "./personalInformationSchema";
import { skillGroupSchema } from "./skillsSchema";

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
