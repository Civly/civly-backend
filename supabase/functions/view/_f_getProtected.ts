import { corsHeaders } from "./_h_corsHeaders.ts";
import { getCV } from "./_f_getCV.ts";

//For CV-Password Brute Force Protection
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000;

export async function getViewProtected(serviceRole, supabaseClient, viewData: CV | null, request) {
  if (viewData === null) {
    throw Error("Bad request. Please provide a password.");
  }
  const ip =
    request.headers
      .get("x-forwarded-for")
      .substring(0, request.headers.get("x-forwarded-for").indexOf(",")) ||
    "unknown";
  const { data: attempt } = await serviceRole
    .from("FailedLoginAttempts")
    .select("lockedUntil, failedAttempts")
    .eq("ip", ip)
    .eq("cvId", viewData?.id)
    .single();

  if (attempt?.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
    return new Response(
      JSON.stringify({
        error: "Too many failed password attempts.",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 429,
      }
    );
  }

  const { data: cvData, cvDataError } = await supabaseClient
    .from("cv")
    .select("visibility, password")
    .eq("id", viewData?.id)
    .single();
  if (cvDataError) throw cvDataError;
  if (
    cvData.password !== null &&
    cvData.visibility == "private" &&
    viewData?.password == cvData.password
  ) {
    //Password was correct reset retries
    if (attempt) {
      await serviceRole
        .from("FailedLoginAttempts")
        .delete()
        .eq("ip", ip)
        .eq("cvId", viewData?.id);
    }
    return await getCV(supabaseClient, viewData?.id);
  } else {
    if (attempt) {
      const newAttempts = attempt.failedAttempts + 1;
      await serviceRole
        .from("FailedLoginAttempts")
        .update({
          failedAttempts: newAttempts,
          lockedUntil:
            newAttempts >= MAX_ATTEMPTS
              ? new Date(Date.now() + BLOCK_TIME).toISOString()
              : null,
          updatedAt: new Date().toISOString(),
        })
        .eq("ip", ip)
        .eq("cvId", viewData?.id);
    } else {
      await serviceRole
        .from("FailedLoginAttempts")
        .insert({
          ip,
          cvId: viewData?.id,
          failedAttempts: 1,
          createdAt: new Date().toISOString(),
        });
    }
    return new Response(
      JSON.stringify({
        error: "CV is password protected",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 403,
      }
    );
  }
}
