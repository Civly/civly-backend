import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { getProfile } from "./_f_get.ts";
import { updateProfile } from "./_f_update.ts";
import { deleteProfile } from "./_f_delete.ts";

//For CV-Password Brute Force Protection
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
  const { url, method } = req;
  // This is needed if you're planning to invoke your function from a browser.
  if (method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      }
    );
    // For more details on URLPattern, check https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
    const instrumentPattern = new URLPattern({
      pathname: "/profile/:id?",
    });
    const matchingPath = instrumentPattern.exec(url);
    const id = matchingPath ? matchingPath.pathname.groups.id : null;
    
    let profile = null;
    if (method === "POST" || method === "PUT") {
      const body = await req.json();
      profile = body;
    }
    // call relevant method based on method and id
    switch (true) {
    case id && method === "GET":
        return getProfile(supabaseClient, id);
    case id && method === "PUT":
        if (profile === null) return;
        return updateProfile(supabaseClient, id, profile);
    case id && method === "DELETE":
        return deleteProfile(supabaseClient, id);
    default:
        return;
    }
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: error.issues,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
