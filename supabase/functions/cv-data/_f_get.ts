async function getCV(supabaseClient, id) {
  const cv = await getCVraw2(supabaseClient, id);
  return new Response(JSON.stringify(cv), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
