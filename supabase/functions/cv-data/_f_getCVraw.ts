import { getUserId } from "./_f_getUserId";

export async function getCVraw(supabaseClient, id: string) {
  const userId = await getUserId(supabaseClient);
  const { data: cvbaseData, cvbaseDataError } = await supabaseClient
    .from("cv")
    .select("id, name, visibility, layoutConfigs, personalInformation, experience, education, skillGroups")
    .eq("id", id).eq('userId', userId)
    .single();
  if (cvbaseDataError) throw cvbaseDataError;

  return {
    ...cvbaseData,
  };
}