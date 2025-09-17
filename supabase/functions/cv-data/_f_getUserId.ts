async function getUserId(supabaseClient) {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user.id;
}
export default getUserId;
