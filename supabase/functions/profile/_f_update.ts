import { corsHeaders } from "./_h_corsHeaders.ts";

export async function updateProfile(supabaseClient, id: string, profile) {
  const { error } = await supabaseClient
    .from("profiles")
    .update(profile)
    .eq("id", id);
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