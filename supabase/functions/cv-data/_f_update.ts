import { validateCV } from "./_f_validate.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";
import { CvData } from "./_s_cvDataSchema.ts";

export async function updateCV(supabaseClient, id: string, cv: CvData) {
  let parsedCV = validateCV(cv);

  //Update
  const { error: cvupdateError } = await supabaseClient
    .from("cv")
    .update(parsedCV.password ?{
      name: parsedCV.name,
      visibility: parsedCV.visibility,
      password: parsedCV.password,
      data: parsedCV,
      layoutConfigs: parsedCV.layoutConfigs,
      personalInformation: parsedCV.personalInformation,
      experience: parsedCV.experience,
      education: parsedCV.education,
      updatedAt: new Date().toISOString(),
    }:
    {
      name: parsedCV.name,
      visibility: parsedCV.visibility,
      data: parsedCV,
      layoutConfigs: parsedCV.layoutConfigs,
      personalInformation: parsedCV.personalInformation,
      experience: parsedCV.experience,
      education: parsedCV.education,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);
  if (cvupdateError) throw cvupdateError;

  return new Response(JSON.stringify(parsedCV), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
