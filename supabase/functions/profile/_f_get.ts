import { getUserId } from "./_f_getUserId.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function getProfile(supabaseClient, id: string) {
  const userId = await getUserId(supabaseClient);
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
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