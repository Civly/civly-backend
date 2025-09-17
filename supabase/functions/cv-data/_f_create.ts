import getUserId from "./_f_getUserId";
import * as z from "zod";
import { encode } from "html-entities";
import { corsHeaders } from "./_h_corsHeaders";

export async function createCV(supabaseClient, cv) {
  console.log("creating cv", cv);
  const userId = await getUserId(supabaseClient);
  let insertData;
  insertData = {
    userId: userId,
  };
  if (cv.name !== null) {
    const schema = z
      .object({
        name: z.string(),
      })
      .transform(({ name }) => ({
        name: encode(name),
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
      userId: userId,
      name: parsed.name,
    };
  }
  const { data, error } = await supabaseClient
    .from("cv")
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}
