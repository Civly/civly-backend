import { getUserId } from "./_f_getUserId.ts";
import { validateCV } from "./_f_validate.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";
import { CvData } from "./_s_cvDataSchema.ts";

export async function updateCV(supabaseClient, id: string, cv: CvData) {
  const userId = await getUserId(supabaseClient);
  let parsedCV = validateCV(cv);

  //Update
  const { error: cvupdateError } = await supabaseClient
    .from("cv")
    .update(parsedCV.password ?{
      name: parsedCV.name,
      password: parsedCV.password,
      layoutConfigs: parsedCV.layoutConfigs,
      personalInformation: parsedCV.personalInformation,
      experience: parsedCV.experience,
      education: parsedCV.education,
      skillGroups: parsedCV.skillGroups,
      updatedAt: new Date().toISOString(),
    }:
    {
      name: parsedCV.name,
      layoutConfigs: parsedCV.layoutConfigs,
      personalInformation: parsedCV.personalInformation,
      experience: parsedCV.experience,
      education: parsedCV.education,
      skillGroups: parsedCV.skillGroups,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id).eq('userId',userId);
  if (cvupdateError) throw cvupdateError;

  return new Response(JSON.stringify(parsedCV), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
