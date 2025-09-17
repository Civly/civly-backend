import { corsHeaders } from "./_h_corsHeaders.ts";
import { getCV } from "./_f_getCV.ts";

export async function getView(supabaseClient, id) {
  const { data: cvData, cvDataError } = await supabaseClient
    .from("cv")
    .select("visibility, password")
    .eq("id", id)
    .single();
  if (cvDataError) throw cvDataError;
  if (cvData.visibility == "public" && cvData.password === null) {
    return await getCV(supabaseClient, id);
  } else if (cvData.visibility == "public" && cvData.password !== null) {
    return new Response(
      JSON.stringify({
        error: "CV is password protected",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 403,
      }
    );
  } else {
    return new Response(
      JSON.stringify({
        error: "CV not available",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 404,
      }
    );
  }
}
