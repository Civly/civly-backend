import { getCVraw } from "./_f_getCVraw.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function getCV(supabaseClient, id: string) {
  const cv = await getCVraw(supabaseClient, id);
  return new Response(JSON.stringify(cv), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
