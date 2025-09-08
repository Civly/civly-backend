// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface Profile {
  id: string;
  name?: string;
  surname?: string;
  birthday?: Date;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  updated_at?: string;
  avatar_url?: string;
}

interface CV {
  id: string;
  last_modified: Date;
  user_id: string;
  visibility: 'draft' | 'private' | 'public';
  password: string;
  layout_configs: LayoutConfigs
  personalInformation: PersonalInformation
  expericence?: ExperienceItem[]
  education?: EducationItem[]
  skillGroups?: SkillGroup[]
}

interface PersonalInformation {
  id: string;
  cv_id: string;
  name?: string;
  surname?: string;
  profile_url?: string;
  birthdate?: Date;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  xing?: string;
  website?: string;
  professionalTitle?: string;
  summary?: string;
}

interface LayoutConfigs {
  id: string;
  cv_id: string;
  template_id: number;
  color_id: number;
  font_size: number;
}

interface ExperienceItem {
  id: string;
  cv_id: string;
  role: string;
  company?: string;
  startDate?: Date;
  currentlyWorkingHere: boolean;
  endDate?: Date;
  location?: string;
  description?: string;
}

interface EducationItem {
  id: string;
  cv_id: string;
  degree?: string;
  institution?: string;
  startDate?: Date;
  currentlyStudyingHere?: boolean;
  endDate?: Date;
  location?: string;
  description?: string;    
}

interface SkillGroup {
  id: string;
  cv_id: string;
  name?: string;           
  order?: number;  
  skills?: Skill[];         
}

interface Skill {
  id: string;
  skillgroup_id: string;
  order?: number;
  name?: string; 
}
// RUD Profile
async function getProfile(supabaseClient: SupabaseClient, id: string) {
  const { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('id', id).single()
  if (error) throw error

  return new Response(JSON.stringify({ profile }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function deleteProfile(supabaseClient: SupabaseClient, id: string) {
  const { error } = await supabaseClient.from('profiles').delete().eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({}), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function updateProfile(supabaseClient: SupabaseClient, id: string, profile: Profile) {

  const { error } = await supabaseClient.from('profiles').update(profile).eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({ profile }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

// CRUD CV

async function getCV(supabaseClient: SupabaseClient, id: string) {
  const { data: instrument, error } = await supabaseClient.from('cv').select('*').eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({ instrument }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function getAllCVs(supabaseClient: SupabaseClient) {
  const { data: instruments, error } = await supabaseClient.from('cv').select('*')
  if (error) throw error

  return new Response(JSON.stringify({ instruments }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function deleteCV(supabaseClient: SupabaseClient, id: string) {
  const { error } = await supabaseClient.from('cv').delete().eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({}), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function updateCV(supabaseClient: SupabaseClient, id: string, cv: CV) {
  const { error } = await supabaseClient.from('cv').update(cv).eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({ cv }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function debug(data) {
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

//util
async function createCV(supabaseClient: SupabaseClient, cv: CV) {
  const { error } = await supabaseClient.from('cv').insert(cv)
  if (error) throw error

  return new Response(JSON.stringify({ cv }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

Deno.serve(async (req) => {
  const { url, method } = req

  // This is needed if you're planning to invoke your function from a browser.
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // For more details on URLPattern, check https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
    const instrumentPattern = new URLPattern({ pathname: '/restful-api/:action/:id' })
    const matchingPath = instrumentPattern.exec(url)
    const id = matchingPath ? matchingPath.pathname.groups.id : null
    const action = matchingPath ? matchingPath.pathname.groups.action : null

    if(action === 'profile'){
      let profile = null
      if (method === 'POST' || method === 'PUT') {
        const body = await req.json()
        profile = body.profile
      }

      // call relevant method based on method and id
      switch (true) {
        case id && method === 'GET':
          return getProfile(supabaseClient, id as string)
        case id && method === 'PUT':
          if(profile === null)return;
          return updateProfile(supabaseClient, id as string, profile)
        case id && method === 'DELETE':
          return deleteProfile(supabaseClient, id as string)
        default:
          return;
      }
    } else if (action === 'cv') {
      let cv = null
      if (method === 'POST' || method === 'PUT') {
        const body = await req.json()
        cv = body.cv
      }

      // call relevant method based on method and id
      switch (true) {
        case id && method === 'GET':
          return getCV(supabaseClient, id as string)
        case id && method === 'PUT':
          if(cv === null)return;
          return updateCV(supabaseClient, id as string, cv)
        case id && method === 'DELETE':
          return deleteCV(supabaseClient, id as string)
        case method === 'POST':
          if(cv === null)return;
          return createCV(supabaseClient, cv)
        case method === 'GET':
          return getAllCVs(supabaseClient)
        default:
          return getAllCVs(supabaseClient)
      }
    }
    
  } catch (error) {
    console.error(error)

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
