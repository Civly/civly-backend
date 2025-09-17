import { corsHeaders } from "./_h_corsHeaders";

async function deleteCV(supabaseClient, id) {
  const { error } = await supabaseClient.from("cv").delete().eq("id", id);
  if (error) throw error;
  return new Response(JSON.stringify({}), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
