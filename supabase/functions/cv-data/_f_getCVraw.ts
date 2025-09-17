export async function getCVraw(supabaseClient, id: string) {
  const { data: cvbaseData, cvbaseDataError } = await supabaseClient
    .from("cv")
    .select("id, name, visibility, layoutConfigs, personalInformation, experience, education, skillGroups")
    .eq("id", id)
    .single();
  if (cvbaseDataError) throw cvbaseDataError;

  return {
    ...cvbaseData,
  };
}