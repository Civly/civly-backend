// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface Instrument {
  name: string
}

async function getInstrument(supabaseClient: SupabaseClient, id: string) {
  const { data: instrument, error } = await supabaseClient.from('instruments').select('*').eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({ instrument }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function getAllInstruments(supabaseClient: SupabaseClient) {
  const { data: instruments, error } = await supabaseClient.from('instruments').select('*')
  if (error) throw error

  return new Response(JSON.stringify({ instruments }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function deleteInstrument(supabaseClient: SupabaseClient, id: string) {
  const { error } = await supabaseClient.from('instruments').delete().eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({}), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function updateInstrument(supabaseClient: SupabaseClient, id: string, instrument: Instrument) {
  const { error } = await supabaseClient.from('instruments').update(instrument).eq('id', id)
  if (error) throw error

  return new Response(JSON.stringify({ instrument }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}

async function createInstrument(supabaseClient: SupabaseClient, instrument: Instrument) {
  const { error } = await supabaseClient.from('instruments').insert(instrument)
  if (error) throw error

  return new Response(JSON.stringify({ instrument }), {
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
    const instrumentPattern = new URLPattern({ pathname: '/restful-api/:id' })
    const matchingPath = instrumentPattern.exec(url)
    const id = matchingPath ? matchingPath.pathname.groups.id : null

    let instrument = null
    if (method === 'POST' || method === 'PUT') {
      const body = await req.json()
      instrument = body.instrument
    }

    // call relevant method based on method and id
    switch (true) {
      case id && method === 'GET':
        return getInstrument(supabaseClient, id as string)
      case id && method === 'PUT':
        return updateInstrument(supabaseClient, id as string, instrument)
      case id && method === 'DELETE':
        return deleteInstrument(supabaseClient, id as string)
      case method === 'POST':
        return createInstrument(supabaseClient, instrument)
      case method === 'GET':
        return getAllInstruments(supabaseClient)
      default:
        return getAllInstruments(supabaseClient)
    }
  } catch (error) {
    console.error(error)

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
