import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import * as z from "npm:zod@latest";
import { corsHeaders } from "./_h_corsHeaders.ts";
import { getCV } from "./_f_getCV.ts";
import { updateCV } from "./_f_update.ts";
import { deleteCV } from "./_f_delete.ts";
import { duplicateCV } from "./_f_duplicate.ts";
import { createCV } from "./_f_create.ts";
import { getAllCVs } from "./_f_getAll.ts";
import { patchCV } from "./_f_patch.ts";


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
      pathname: "/cv-data/:id?",
    });
    const matchingPath = instrumentPattern.exec(url);
    const id = matchingPath ? matchingPath.pathname.groups.id : null;

    let cv = null;
    if (method === "POST" || method === "PUT") {
      const body = await req.json();
      cv = body;
    }
    // call relevant method based on method and id
    switch (true) {
      case id && method === "GET":
        return getCV(supabaseClient, id);
      case id && method === "PUT":
        if (cv === null) return;
        return updateCV(supabaseClient, id, cv);
      case id && method === "PATCH":
        if (cv === null) return;
        return patchCV(supabaseClient, id, cv);
      case id && method === "DELETE":
        return deleteCV(supabaseClient, id);
      case id && method === "POST":
        return duplicateCV(supabaseClient, id);
      case method === "POST":
        if (cv === null) return;
        return createCV(supabaseClient, cv);
      case method === "GET":
        return getAllCVs(supabaseClient);
      default:
        return getAllCVs(supabaseClient);
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
