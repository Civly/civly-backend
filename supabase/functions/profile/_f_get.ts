import { corsHeaders } from "./_h_corsHeaders.ts";

export async function getProfile(supabaseClient, id: string) {
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", id)
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