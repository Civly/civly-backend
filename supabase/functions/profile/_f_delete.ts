import { corsHeaders } from "./_h_corsHeaders.ts";

export async function deleteProfile(supabaseClient, id: string) {
  const { error } = await supabaseClient.from("profiles").delete().eq("id", id);
  if (error) throw error;
  return new Response(JSON.stringify({}), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}