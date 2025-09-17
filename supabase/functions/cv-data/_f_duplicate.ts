import { getCVraw } from "./_f_getCVraw.ts";
import { getUserId } from "./_f_getUserId.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function duplicateCV(supabaseClient, id) {
  const userId = await getUserId(supabaseClient);
  const cv = await getCVraw(supabaseClient, id);
  //Update
  const { data: cvData, error: cvinsertError } = await supabaseClient
    .from("cv")
    .insert({
      userId: userId,
      visibility: "draft",
      name: cv.name + " COPY",
      updatedAt: new Date().toISOString(),
      data: cv.data,
      layoutConfigs: cv.layoutConfigs,
      personalInformation: cv.personalInformation,
      experience: cv.experience,
      education: cv.education,
    })
    .select()
    .single();
  if (cvinsertError) throw cvinsertError;

  return new Response(
    JSON.stringify({
      id: cvData.id,
      name: cvData.name,
      createdAt: cvData.createdAt,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    }
  );
}
