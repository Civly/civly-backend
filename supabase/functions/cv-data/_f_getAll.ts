import { getUserId } from "./_f_getUserId.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function getAllCVs(supabaseClient) {
  const userId = await getUserId(supabaseClient);
  const { data, error } = await supabaseClient
    .from("cv")
    .select("id, createdAt, updatedAt, userId, visibility, name").eq('userId',userId)
    .order("createdAt", {
      ascending: false,
    });
  if (error) {
    console.log(error);
    throw error;
  }
  return new Response(
    JSON.stringify({
      data,
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