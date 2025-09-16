import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
import * as z from "npm:zod@latest";
import {encode} from 'npm:html-entities@latest';
import { validateCV, validateEducationItem, validateExperienceItem, validateLayoutConfigs, validatePersonalInformation, validateSkill, validateSkillGroup } from './validation.ts';
import type { CV, EducationItem, ExperienceItem, Skill, SkillGroup } from './types.d.ts';

//For CV-Password Brute Force Protection
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};
// RUD Profile
async function getProfile(supabaseClient, id) {
  const { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return new Response(JSON.stringify({
    profile
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function deleteProfile(supabaseClient, id) {
  const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
  if (error) throw error;
  return new Response(JSON.stringify({}), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function updateProfile(supabaseClient, id, profile) {
  const { error } = await supabaseClient.from('profiles').update(profile).eq('id', id);
  if (error) throw error;
  return new Response(JSON.stringify({
    profile
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
// View CV for public
async function getView(supabaseClient, id) {
  const { data: cvData, cvDataError } = await supabaseClient.from('cv').select('visibility, password').eq('id', id).single();
  if (cvDataError) throw cvDataError;
  if(cvData.visibility == 'public' && cvData.password === null){
    return await getCV2(supabaseClient, id);
  } else if(cvData.visibility == 'public' && cvData.password !== null){
    return new Response(JSON.stringify({
      error: 'CV is password protected'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 403
    });
  } else {
    return new Response(JSON.stringify({
      error: 'CV not available'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 404
    });
  }
}

async function getViewProtected(supabaseClient, viewData: CV | null, request) {
  if(viewData === null) { 
    throw Error('Bad request. Please provide a password.')
  }
  const serviceRole = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
  const ip = request.headers.get("x-forwarded-for").substring(0,request.headers.get("x-forwarded-for").indexOf(',')) || "unknown";
  const {data: attempt} = await serviceRole.from('FailedLoginAttempts').select('lockedUntil, failedAttempts').eq('ip', ip).eq('cv_id',viewData?.id).single();

  if(attempt?.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
    return new Response(JSON.stringify({
      error: 'Too many failed password attempts.'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 429
    });
  }

  const { data: cvData, cvDataError } = await supabaseClient.from('cv').select('visibility, password').eq('id', viewData?.id).single();
  if (cvDataError) throw cvDataError;
  if(cvData.password !== null && cvData.visibility == 'public' && viewData?.password == cvData.password){
    //Password was correct reset retries
    if(attempt){
      await serviceRole.from('FailedLoginAttempts').delete().eq('ip', ip).eq('cv_id', viewData?.id);
    }
    return await getCV2(supabaseClient, viewData?.id);
  } else {
    if(attempt){
      const newAttempts = attempt.failedAttempts + 1;
      await serviceRole.from('FailedLoginAttempts').update({
        failedAttempts: newAttempts,
        lockedUntil: newAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_TIME).toISOString() : null,
        updatedAt: new Date().toISOString()
      }).eq('ip',ip).eq('cv_id', viewData?.id);
    } else {
      await serviceRole.from('FailedLoginAttempts').insert({ip, cv_id: viewData?.id, failedAttempts: 1, createdAt: new Date().toISOString()})
    }
    return new Response(JSON.stringify({
      error: 'CV is password protected'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 403
    });
  }
}
// CRUD CV2 with json field in table cv
async function getCVraw2(supabaseClient, id) {
  const { data: cvbaseData, cvbaseDataError } = await supabaseClient.from('cv').select('id, name, visibility, data').eq('id', id).single();
  if (cvbaseDataError) throw cvbaseDataError;
  
  return {
    ...cvbaseData
  };
}

// CRUD CV
async function getCVraw(supabaseClient, id) {
  const { data: cvbaseData, cvbaseDataError } = await supabaseClient.from('cv').select('id, name, visibility').eq('id', id).single();
  if (cvbaseDataError) throw cvbaseDataError;
  
  const { data: layout_configs, layout_configsError } = await supabaseClient.from('layoutConfigs').select('template_id, color_id, font_size').eq('cv_id', id).single();
  if (layout_configsError) throw layout_configsError;
  const { data: personalInformation, personalInformationError } = await supabaseClient.from('personalInformation').select('name, surname, profile_url, birthdate, email, phone, location, linkedin, xing, website, professionalTitle, summary, ').eq('cv_id', id).single();
  if (personalInformationError) throw personalInformationError;
  const { data: experience, experienceError } = await supabaseClient.from('ExperienceItem').select('role, company, startDate, currentlyWorkingHere, endDate, location, description').eq('cv_id', id);
  if (experienceError) throw experienceError;
  const { data: education, educationError } = await supabaseClient.from('EducationItem').select('degree, institution, startdate, location, description').eq('cv_id', id);
  if (educationError) throw educationError;

  const { data: skillGroups, skillGroupsError } = await supabaseClient.from('SkillGroup').select('id, name, order').eq('cv_id', id);
  if (skillGroupsError) throw skillGroupsError;
  if(Array.isArray(skillGroups)){
    for (const sg of skillGroups) {
      const { data: skill, skillError } = await supabaseClient.from('Skill').select('name, order').eq('skillgroup_id', sg.id);
      if (skillError) throw skillError;
      sg.skills = skill;
      delete sg.id;
    }
  }
  return {
    ...cvbaseData,
    layout_configs: {...layout_configs},
    personalInformation: {...personalInformation},
    experience: experience,
    education: education,
    skillGroups: skillGroups
  };
}

async function getCV(supabaseClient, id) {
  const cv = await getCVraw(supabaseClient, id);
  return new Response(JSON.stringify(cv), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function getCV2(supabaseClient, id) {
  const cv = await getCVraw2(supabaseClient, id);
  return new Response(JSON.stringify(cv), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function getAllCVs(supabaseClient) {
  const { data, error } = await supabaseClient.from('cv').select('id, created_at, updated_at, user_id, visibility, name').order('created_at', {
    ascending: false
  });
  if (error) {
    console.log(error);
    throw error;
  }
  return new Response(JSON.stringify({
    data
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function deleteCV(supabaseClient, id) {
  const { error } = await supabaseClient.from('cv').delete().eq('id', id);
  if (error) throw error;
  return new Response(JSON.stringify({}), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function updateCV(supabaseClient, id, cv) {
  const userId = await getUserId(supabaseClient);

  let parsedCV = validateCV(cv);
  let parsedLayout_configs;
  let parsedPersonalInformation;
  let parsedExperiences: ExperienceItem[] = [];
  let parsedEducation: EducationItem[] = [];
  let parsedskillGroups: SkillGroup[] = [];

  if(cv.layout_configs){
    parsedLayout_configs = validateLayoutConfigs(cv.layout_configs);
  }
  if(cv.personalInformation){
    parsedPersonalInformation = validatePersonalInformation(cv.personalInformation);
  }
  if(Array.isArray(cv.experience)){
    for (const ex of cv.experience) {
      parsedExperiences.push(validateExperienceItem(ex));
    }
  }
  if(Array.isArray(cv.education)){
    for (const ed of cv.education) {
      parsedEducation.push(validateEducationItem(ed));
    }
  }
  if(Array.isArray(cv.skillGroups)){
    for (const sg of cv.skillGroups) {
      let validatedSG = validateSkillGroup(sg);
      let parsedSkillsTemp: Skill[] = [];
      if(Array.isArray(sg.skills)){    
        for (const skill of sg.skills) {
          parsedSkillsTemp.push(validateSkill(skill));
        }
      }
      validatedSG.skills = parsedSkillsTemp;
      parsedskillGroups.push(validatedSG);
    }
  }

  //Update 
  const { error: cvupdateError } = await supabaseClient.from('cv').update({
    ...parsedCV,
    updated_at: new Date().toISOString()
  }).eq('id', id);
  if (cvupdateError) throw cvupdateError;
  const { error: layoutconfigsError } = await supabaseClient.from('layoutConfigs').update({
    ...parsedLayout_configs,
  }).eq('cv_id', id).eq('user_id', userId);
  if (layoutconfigsError) throw layoutconfigsError;
  const { error: personalInformationError } = await supabaseClient.from('personalInformation').update({
    ...parsedPersonalInformation,
  }).eq('cv_id', id).eq('user_id', userId);
  if (personalInformationError) throw personalInformationError;

  //Delete first, then insert as new
  const { error: deleteExpError } = await supabaseClient.from('ExperienceItem').delete().eq('cv_id', id).eq('user_id', userId);
  if (deleteExpError) throw deleteExpError;
  for (const exp of parsedExperiences) {
    const { error: insertExpError } = await supabaseClient.from('ExperienceItem').insert(
      {
        cv_id: id,
        user_id: userId,
        ...exp,
      });
    if (insertExpError) throw insertExpError;
  }

  const { error: deleteEduError } = await supabaseClient.from('EducationItem').delete().eq('cv_id', id).eq('user_id', userId);
  if (deleteEduError) throw deleteEduError;
  for (const edu of parsedEducation) {
    const { error: insertEduError } = await supabaseClient.from('EducationItem').insert(
      {
        cv_id: id,
        user_id: userId,
        ...edu,
      });
    if (insertEduError) throw insertEduError;
  }

  const { error: deleteSkillGroupError } = await supabaseClient.from('SkillGroup').delete().eq('cv_id', id).eq('user_id', userId);
  if (deleteSkillGroupError) throw deleteSkillGroupError;
  for (const skillgroup of parsedskillGroups) {
    const { data: skillgroupinserted,error: insertSkillGroupError } = await supabaseClient.from('SkillGroup').insert(
      {
        cv_id: id,
        user_id: userId,
        name: skillgroup.name,
        order: skillgroup.order,
      }).select().single();
    if (insertSkillGroupError) throw insertSkillGroupError;
    if(skillgroup.skills){
      for (const skill of skillgroup.skills) {
        const { error: insertSkillError } = await supabaseClient.from('Skill').insert(
          {
            skillgroup_id: skillgroupinserted.id,
            user_id: userId,
            name: skill.name,
            order: skill.order,
          });
        if (insertSkillError) throw insertSkillError;
      }
    }
  }

  return new Response(JSON.stringify({
    id,
    ...parsedCV,
    layout_configs: {...parsedLayout_configs},
    personalInformation: {...parsedPersonalInformation},
    experience: parsedExperiences,
    education: parsedEducation,
    skillGroups: parsedskillGroups
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}

async function updateCV2(supabaseClient, id, cv) {
  let parsedCV = validateCV(cv);
 
  //Update 
  const { error: cvupdateError } = await supabaseClient.from('cv').update({
    data: parsedCV,
    updated_at: new Date().toISOString()
  }).eq('id', id);
  if (cvupdateError) throw cvupdateError;
  
  return new Response(JSON.stringify(parsedCV), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}

async function duplicateCV2(supabaseClient, id) {
  const userId = await getUserId(supabaseClient);
  const cv = await getCVraw2(supabaseClient, id);
  //Update 
  const { data: cvData, error: cvinsertError } = await supabaseClient.from('cv').insert({
    user_id: userId,
    visibility: 'draft',
    name: cv.name + ' COPY', 
    updated_at: new Date().toISOString(),
    data: cv.data
  }).select().single();
  if (cvinsertError) throw cvinsertError;

  return new Response(JSON.stringify({
    id: cvData.id,
    name: cvData.name,
    created_at: cvData.created_at
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}

async function duplicateCV(supabaseClient, id) {
  const userId = await getUserId(supabaseClient);
  const cv = await getCVraw(supabaseClient, id);
  //Update 
  const { data: cvData, error: cvinsertError } = await supabaseClient.from('cv').insert({
    user_id: userId,
    visibility: 'draft',
    name: cv.name + ' COPY', 
    updated_at: new Date().toISOString()
  }).select().single();
  if (cvinsertError) throw cvinsertError;

  if(cv.layout_configs){
    const { error: layoutconfigsError } = await supabaseClient.from('layoutConfigs').insert({
      cv_id: cvData.id,
      template_id: cv.layout_configs.template_id,
      color_id: cv.layout_configs.color_id,
      font_size: cv.layout_configs.font_size,
      user_id: userId
    });
    if (layoutconfigsError) throw layoutconfigsError;
  }
  
  if(cv.personalInformation){
    const { error: personalInformationError } = await supabaseClient.from('personalInformation').insert({
      cv_id: cvData.id,
      user_id: userId,
      name: cv.personalInformation.name,
      surname: cv.personalInformation.surname,
      profile_url: cv.personalInformation.profile_url,
      birthdate: cv.personalInformation.birthdate,
      email: cv.personalInformation.email,
      phone: cv.personalInformation.phone,
      location: cv.personalInformation.location,
      linkedin: cv.personalInformation.linkedin,
      xing: cv.personalInformation.xing,
      professionalTitle: cv.personalInformation.professionalTitle,
      summary: cv.personalInformation.summary
    });
    if (personalInformationError) throw personalInformationError;
  }

  if(Array.isArray(cv.experience)){
    for (const exp of cv.experience) {
      const { error: insertExpError } = await supabaseClient.from('ExperienceItem').insert(
      {
        cv_id: cvData.id,
        user_id: userId,
        role: exp.role,
        company: exp.company,
        startDate: exp.startDate,
        currentlyWorkingHere: exp.currentlyWorkingHere,
        endDate: exp.endDate,
        location: exp.location,
        description: exp.description
      });
      if (insertExpError) throw insertExpError;
    }
  }
  
  if(Array.isArray(cv.education)){
    for (const edu of cv.education) {
      const { error: insertEduError } = await supabaseClient.from('EducationItem').insert(
      {
        cv_id: cvData.id,
        user_id: userId,
        degree: edu.degree,
        institution: edu.institution,
        startDate: edu.startDate,
        currentlyStudyingHere: edu.currentlyStudyingHere,
        endDate: edu.endDate,
        location: edu.location,
        description: edu.description
      });
      if (insertEduError) throw insertEduError;
    }
  }
  
  if(Array.isArray(cv.skillGroups)){
    for (const skillgroup of cv.skillGroups) {
      const { data: skillgroupinserted,error: insertSkillGroupError } = await supabaseClient.from('SkillGroup').insert(
        {
          cv_id: cvData.id,
          user_id: userId,
          name: skillgroup.name,
          order: skillgroup.order,
        }).select().single();
      if (insertSkillGroupError) throw insertSkillGroupError;
      if(skillgroup.skills){
        for (const skill of skillgroup.skills) {
          const { error: insertSkillError } = await supabaseClient.from('Skill').insert(
            {
              skillgroup_id: skillgroupinserted.id,
              user_id: userId,
              name: skill.name,
              order: skill.order,
            });
          if (insertSkillError) throw insertSkillError;
        }
      }
    }
  }

  return new Response(JSON.stringify({
    id: cvData.id,
    name: cvData.name,
    created_at: cvData.created_at
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}

async function debug(data) {
  return new Response(JSON.stringify({
    data
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
//util
async function createCV(supabaseClient, cv) {
  console.log('creating cv', cv);
  const userId = await getUserId(supabaseClient);
  let insertData;
  insertData = {
    user_id: userId
  };
  if (cv.name !== null) {
    const schema = z.object({
      name: z.string()
    }).transform(({ name })=>({
        name: encode(name)
      }));
    let parsed;
    try {
      parsed = schema.parse(cv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error.issues;
      }
    }
    insertData = {
      user_id: userId,
      name: parsed.name
    };
  }
  const { data, error } = await supabaseClient.from('cv').insert(insertData).select().single();
  if (error) throw error;
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 200
  });
}
async function getUserId(supabaseClient) {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user.id;
}
Deno.serve(async (req)=>{
  const { url, method } = req;
  // This is needed if you're planning to invoke your function from a browser.
  if (method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    // For more details on URLPattern, check https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
    const instrumentPattern = new URLPattern({
      pathname: '/restful-api/:action/:id?'
    });
    const matchingPath = instrumentPattern.exec(url);
    const id = matchingPath ? matchingPath.pathname.groups.id : null;
    const action = matchingPath ? matchingPath.pathname.groups.action : null;
    if (action === 'profile') {
      let profile = null;
      if (method === 'POST' || method === 'PUT') {
        const body = await req.json();
        profile = body.profile;
      }
      // call relevant method based on method and id
      switch(true){
        case id && method === 'GET':
          return getProfile(supabaseClient, id);
        case id && method === 'PUT':
          if (profile === null) return;
          return updateProfile(supabaseClient, id, profile);
        case id && method === 'DELETE':
          return deleteProfile(supabaseClient, id);
        default:
          return;
      }
    } else if (action === 'cv') {
      let cv = null;
      if (method === 'POST' || method === 'PUT') {
        const body = await req.json();
        cv = body;
      }
      // call relevant method based on method and id
      switch(true){
        case id && method === 'GET':
          return getCV(supabaseClient, id);
        case id && method === 'PUT':
          if (cv === null) return;
          return updateCV(supabaseClient, id, cv);
        case id && method === 'DELETE':
          return deleteCV(supabaseClient, id);
        case id && method === 'POST':
          return duplicateCV(supabaseClient, id);
        case method === 'POST':
          if (cv === null) return;
          return createCV(supabaseClient, cv);
        case method === 'GET':
          return getAllCVs(supabaseClient);
        default:
          return getAllCVs(supabaseClient);
      }
    } else if (action === 'cv2') {
      let cv = null;
      if (method === 'POST' || method === 'PUT') {
        const body = await req.json();
        cv = body;
      }
      // call relevant method based on method and id
      switch(true){
        case id && method === 'GET':
          return getCV2(supabaseClient, id);
        case id && method === 'PUT':
          if (cv === null) return;
          return updateCV2(supabaseClient, id, cv);
        case id && method === 'DELETE':
          return deleteCV(supabaseClient, id);
        case id && method === 'POST':
          return duplicateCV2(supabaseClient, id);
        case method === 'POST':
          if (cv === null) return;
          return createCV(supabaseClient, cv);
        case method === 'GET':
          return getAllCVs(supabaseClient);
        default:
          return getAllCVs(supabaseClient);
      }
    } else if (action === 'view') {
      let viewData = null;
      if (method === 'POST') {
        const body = await req.json();
        viewData = body;
      }
      // call relevant method based on method and id
      switch(true){
        case id && method === 'GET':
          return getView(supabaseClient, id);
        case method === 'POST':
          return getViewProtected(supabaseClient, viewData, req);
        default:
          return;
      }
    } else {
      console.log('no action provided');
    }
  } catch (error) {
    console.error(error);
    if(error instanceof z.ZodError){
      return new Response(JSON.stringify({
        error: error.issues
      }), {
        headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
