import { getUserId } from "./_f_getUserId.ts";
import {encode} from 'npm:html-entities@latest';
import * as z from "npm:zod@latest";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function createCV(supabaseClient) {
  const userId = await getUserId(supabaseClient);
  let insertData;
  insertData = {
    userId: userId,
    visibility: "draft",
    updatedAt: new Date().toISOString(),
    layoutConfigs: {
      templateId: 0,
      colorId: 0,
      fontId: 0,
      fontSizeId: 0,
    },
    personalInformation: {
      name: "",
      surname: "",
      profileUrl: "",
      birthdate: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      xing: "",
      website: "",
      professionalTitle: "",
      summary: "",
    },
    experience: [],
    education: [],
    skillGroups: [],
  };
  
  const { data, error } = await supabaseClient
    .from("cv")
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
