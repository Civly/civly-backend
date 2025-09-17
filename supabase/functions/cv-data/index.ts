import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import * as z from "npm:zod@latest";
import { encode } from "npm:html-entities@latest";
import { encode } from "npm:html-entities@latest";
import {
  validateCV,
  validateCV2,
  validateEducationItem,
  validateExperienceItem,
  validateLayoutConfigs,
  validatePersonalInformation,
  validateSkill,
  validateSkillGroup,
} from "./validation.ts";
import type {
  CV,
  EducationItem,
  ExperienceItem,
  Skill,
  SkillGroup,
} from "./types.d.ts";

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
      pathname: "/restful-api/:action/:id?",
    });
    const matchingPath = instrumentPattern.exec(url);
    const id = matchingPath ? matchingPath.pathname.groups.id : null;
    const action = matchingPath ? matchingPath.pathname.groups.action : null;
    if (action === "profile") {
      let profile = null;
      if (method === "POST" || method === "PUT") {
        const body = await req.json();
        profile = body.profile;
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
    } else if (action === "cv") {
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
    } else if (action === "cv2") {
      let cv = null;
      if (method === "POST" || method === "PUT") {
        const body = await req.json();
        cv = body;
      }
      // call relevant method based on method and id
      switch (true) {
        case id && method === "GET":
          return getCV2(supabaseClient, id);
        case id && method === "PUT":
          if (cv === null) return;
          return updateCV2(supabaseClient, id, cv);
        case id && method === "DELETE":
          return deleteCV(supabaseClient, id);
        case id && method === "POST":
          return duplicateCV2(supabaseClient, id);
        case method === "POST":
          if (cv === null) return;
          return createCV(supabaseClient, cv);
        case method === "GET":
          return getAllCVs(supabaseClient);
        default:
          return getAllCVs(supabaseClient);
      }
    } else if (action === "view") {
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
          return getViewProtected(supabaseClient, viewData, req);
        default:
          return;
      }
    } else {
      console.log("no action provided");
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
