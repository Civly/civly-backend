async function getCVraw(supabaseClient, id) {
  const { data: cvbaseData, cvbaseDataError } = await supabaseClient
    .from("cv")
    .select("id, name, visibility")
    .eq("id", id)
    .single();
  if (cvbaseDataError) throw cvbaseDataError;

  const { data: layoutConfigs, layoutConfigsError } = await supabaseClient
    .from("layoutConfigs")
    .select("templateId, colorId, fontSize")
    .eq("cvId", id)
    .single();
  if (layoutConfigsError) throw layoutConfigsError;
  const { data: personalInformation, personalInformationError } =
    await supabaseClient
      .from("personalInformation")
      .select(
        "name, surname, profileUrl, birthdate, email, phone, location, linkedin, xing, website, professionalTitle, summary"
      )
      .eq("cvId", id)
      .single();
  if (personalInformationError) throw personalInformationError;
  const { data: experience, experienceError } = await supabaseClient
    .from("ExperienceItem")
    .select(
      "role, company, startDate, currentlyWorkingHere, endDate, location, description"
    )
    .eq("cvId", id);
  if (experienceError) throw experienceError;
  const { data: education, educationError } = await supabaseClient
    .from("EducationItem")
    .select(
      "degree, institution, startDate, currentlyStudyingHere, endDate, location, description"
    )
    .eq("cvId", id);
  if (educationError) throw educationError;

  const { data: skillGroups, skillGroupsError } = await supabaseClient
    .from("SkillGroup")
    .select("id, name, order")
    .eq("cvId", id);
  if (skillGroupsError) throw skillGroupsError;
  if (Array.isArray(skillGroups)) {
    for (const sg of skillGroups) {
      const { data: skill, skillError } = await supabaseClient
        .from("Skill")
        .select("name, order")
        .eq("skillgroupId", sg.id);
      if (skillError) throw skillError;
      sg.skills = skill;
      delete sg.id;
    }
  }
  return {
    ...cvbaseData,
    layoutConfigs: { ...layoutConfigs },
    personalInformation: { ...personalInformation },
    experience: experience,
    education: education,
    skillGroups: skillGroups,
  };
}
