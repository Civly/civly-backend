import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import * as z from "npm:zod@latest";
import { corsHeaders } from "./_h_corsHeaders.ts";
import { getView } from "./_f_get.ts";
import { getViewProtected } from "./_f_getProtected.ts";

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
      pathname: "/view/:id?",
    });
    const matchingPath = instrumentPattern.exec(url);
    const id = matchingPath ? matchingPath.pathname.groups.id : null;
    
    let viewData = null;
    if (method === "POST") {
        const body = await req.json();
        viewData = body;
    }
    // call relevant method based on method and id
    switch (true) {
        case id && method === "GET":
            return getView(supabaseClient, id);
        case method === "POST":
            const serviceRole = createClient(
                Deno.env.get("SUPABASE_URL"),
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
                {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                },
                }
            );
            return getViewProtected(serviceRole, supabaseClient, viewData, req);
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
