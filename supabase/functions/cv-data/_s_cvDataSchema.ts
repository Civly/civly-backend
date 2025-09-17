import * as z from "npm:zod@latest";
import {encode} from 'npm:html-entities@latest';
import { educationItemSchema } from "./_s_educationSchema.ts";
import { experienceItemSchema } from "./_s_experienceSchema.ts";
import { layoutConfigsSchema } from "./_s_layoutSchema.ts";
import { personalInformationSchema } from "./_s_personalInformationSchema.ts";
import { skillGroupSchema } from "./_s_skillsSchema.ts";

export const cvDataSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1).transform((val) => {
              return val ? encode(val) : undefined;
          }),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  visibility: z.enum(["draft", "private", "public"]).optional(),
  password: z.string().optional(),
  // Subschemas
  layoutConfigs: layoutConfigsSchema.optional(),
  personalInformation: personalInformationSchema.optional(),
  experience: z.array(experienceItemSchema).optional(),
  education: z.array(educationItemSchema).optional(),
  skillGroups: z.array(skillGroupSchema).optional(),
});

export type CvData = z.infer<typeof cvDataSchema>;
