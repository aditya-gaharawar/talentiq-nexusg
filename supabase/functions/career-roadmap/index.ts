import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub as string;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch applications count
    const { count: appCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("student_id", userId);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a career advisor AI. Generate a personalized career roadmap for a college student based on their profile data. Return structured steps via the tool call.",
          },
          {
            role: "user",
            content: `Generate a personalized career roadmap for this student:
- Name: ${profile.full_name || "Student"}
- Department: ${profile.department || "Not specified"}
- CGPA: ${profile.cgpa || 0}
- Skills: ${(profile.skills || []).join(", ") || "None added"}
- Projects: ${profile.projects_count || 0}
- Certifications: ${profile.certifications_count || 0}
- Resume uploaded: ${!!profile.resume_url}
- Applications submitted: ${appCount || 0}
- Placement status: ${profile.placement_status || "not_placed"}

Generate 5-7 actionable roadmap steps tailored to their current progress. Each step should have a title, description, and whether it's completed based on their data.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_roadmap",
              description: "Submit the personalized career roadmap",
              parameters: {
                type: "object",
                properties: {
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string", description: "Short step title" },
                        description: { type: "string", description: "Brief description of what to do" },
                        done: { type: "boolean", description: "Whether this step is completed" },
                      },
                      required: ["label", "description", "done"],
                      additionalProperties: false,
                    },
                  },
                  advice: { type: "string", description: "One sentence of personalized advice" },
                },
                required: ["steps", "advice"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_roadmap" } },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI roadmap generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const roadmap = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("career-roadmap error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
