import { getUserId } from "./_f_getUserId.ts";
import { corsHeaders } from "./_h_corsHeaders.ts";

export async function deleteProfile(serviceRole, supabaseClient, id: string) {
  const userId = await getUserId(supabaseClient);
  if(id === userId){
    const { error } = await supabaseClient.from("cv").delete().eq("userId", userId);
    if (error) throw error;
    const { error: profileError } = await supabaseClient.from("profiles").delete().eq("id", userId);
    if (profileError) throw profileError;
    const { error: adminError } = await serviceRole.auth.admin.deleteUser(userId);
    if (adminError) throw adminError;
  }
  return new Response(JSON.stringify({}), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}