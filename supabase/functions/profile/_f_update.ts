import { getUserId } from "./_f_getUserId.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function updateProfile(supabaseClient, id: string, profile) {
  const userId = await getUserId(supabaseClient);
  const { error } = await supabaseClient
    .from("profiles")
    .update(profile)
    .eq("id", userId);
  if (error) throw error;
  return new Response(
    JSON.stringify({
      profile,
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