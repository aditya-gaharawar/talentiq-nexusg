import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── SKILL DICTIONARY ───
const SKILL_DICTIONARY: Record<string, string[]> = {
  programming: ["python", "java", "c++", "c", "javascript", "typescript", "golang", "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab"],
  web: ["html", "css", "react", "angular", "vue", "node.js", "nodejs", "express", "next.js", "nextjs", "django", "flask", "spring boot", "tailwind", "bootstrap", "graphql", "rest api"],
  ai_ml: ["machine learning", "deep learning", "tensorflow", "pytorch", "keras", "pandas", "numpy", "matplotlib", "scikit-learn", "opencv", "nlp", "computer vision", "openai api", "langchain", "huggingface"],
  cloud_tools: ["aws", "azure", "google cloud", "gcp", "firebase", "netlify", "vercel", "docker", "kubernetes", "terraform", "jenkins", "ci/cd", "github actions"],
  database: ["sql", "mysql", "postgresql", "mongodb", "redis", "dynamodb", "supabase", "prisma", "sequelize"],
  other: ["git", "linux", "agile", "scrum", "system design", "data structures", "algorithms", "competitive programming"],
};

const ALL_SKILLS = Object.values(SKILL_DICTIONARY).flat();

// ─── SECTION KEYWORDS ───
const SECTION_PATTERNS: Record<string, string[]> = {
  education: ["education", "bachelor", "btech", "b.tech", "degree", "college", "university", "master", "mtech", "m.tech", "pursuing", "graduated", "gpa", "cgpa"],
  skills: ["skills", "technical skills", "languages", "frameworks", "libraries", "tools", "technologies", "proficient", "familiar with"],
  projects: ["projects", "developed", "built", "implemented", "created", "designed", "personal projects", "academic projects"],
  experience: ["experience", "internship", "intern", "worked", "employed", "company", "role"],
  competitive: ["leetcode", "codechef", "codeforces", "rating", "competitive programming", "hackerrank", "topcoder", "contest"],
  certifications: ["certifications", "certified", "certificate", "coursera", "udemy", "edx"],
};

// ─── TEXT CLEANING ───
function cleanResumeText(raw: string): string {
  let text = raw.toLowerCase();
  text = text.replace(/\r\n/g, "\n");
  text = text.replace(/([a-z])-\n([a-z])/g, "$1$2"); // merge broken words
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]{2,}/g, " ");
  // Remove duplicate consecutive lines
  const lines = text.split("\n");
  const deduped: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && deduped[deduped.length - 1]?.trim() !== trimmed) {
      deduped.push(trimmed);
    } else if (!trimmed) {
      deduped.push("");
    }
  }
  return deduped.join("\n").trim();
}

// ─── LOCAL SKILL EXTRACTION ───
function extractSkillsFromText(text: string): string[] {
  const found = new Set<string>();
  for (const skill of ALL_SKILLS) {
    // Word boundary check for multi-word skills
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[\\s,;|/()\\[\\]])${escaped}(?:[\\s,;|/()\\[\\]]|$)`, "i");
    if (regex.test(text)) {
      found.add(skill);
    }
  }
  return Array.from(found);
}

// ─── SECTION DETECTION ───
function detectSections(text: string): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const [section, keywords] of Object.entries(SECTION_PATTERNS)) {
    result[section] = keywords.some(kw => text.includes(kw));
  }
  return result;
}

// ─── PROJECT EXTRACTION (local heuristic) ───
function extractProjectHints(text: string): string[] {
  const projectKeywords = ["developed", "built", "implemented", "created", "designed", "architected"];
  const lines = text.split("\n");
  const projects: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (projectKeywords.some(kw => line.includes(kw)) && line.length > 15 && line.length < 200) {
      projects.push(line.charAt(0).toUpperCase() + line.slice(1));
    }
  }
  return projects.slice(0, 10);
}

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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = user.id;

    const { resume_url, resume_text } = await req.json();
    if (!resume_url) {
      return new Response(JSON.stringify({ error: "resume_url is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── STEP 1: Text processing ───
    let cleanedText = "";
    if (resume_text && typeof resume_text === "string" && resume_text.length > 50) {
      cleanedText = cleanResumeText(resume_text);
    } else {
      // Fallback: use the URL filename for context
      cleanedText = decodeURIComponent(resume_url.split("/").pop() || "resume").replace(/[_\-\.]/g, " ").toLowerCase();
    }

    // ─── STEP 2: Section detection ───
    const sections = detectSections(cleanedText);

    // ─── STEP 3: Local skill extraction ───
    const localSkills = extractSkillsFromText(cleanedText);

    // ─── STEP 4: Local project hints ───
    const localProjects = extractProjectHints(cleanedText);

    // ─── STEP 5-7: AI-powered deep analysis ───
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const contextForAI = cleanedText.length > 100
      ? `Resume text (cleaned):\n${cleanedText.substring(0, 4000)}`
      : `Resume filename: ${resume_url.split("/").pop()}. Locally detected skills: ${localSkills.join(", ")}. Detected sections: ${Object.entries(sections).filter(([,v]) => v).map(([k]) => k).join(", ")}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a resume analysis AI for a college placement platform. Analyze the resume content and provide structured analysis. Use the locally detected skills as a base and add any additional ones you find. Be realistic but encouraging for college students. Always provide actionable improvement suggestions.`,
          },
          {
            role: "user",
            content: `Analyze this resume and provide comprehensive analysis.\n\n${contextForAI}\n\nLocally detected skills: ${localSkills.join(", ")}\nDetected sections: ${JSON.stringify(sections)}\nLocal project hints: ${localProjects.join("; ")}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_resume_analysis",
              description: "Submit the structured resume analysis results with improvement suggestions",
              parameters: {
                type: "object",
                properties: {
                  detected_skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "All skills detected (combine local + AI-detected). Include the locally detected skills plus any additional ones.",
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        technologies: { type: "array", items: { type: "string" } },
                        description: { type: "string" },
                      },
                      required: ["title", "technologies", "description"],
                    },
                    description: "Projects found in the resume with title, technologies, and brief description",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key strengths identified (e.g., strong coding profile, competitive programming, multiple projects)",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas for improvement (e.g., missing cloud skills, no internships, limited system design)",
                  },
                  resume_score: {
                    type: "number",
                    description: "Overall resume quality score 0-100",
                  },
                  summary: {
                    type: "string",
                    description: "Brief 2-3 sentence summary of the candidate profile",
                  },
                  suggested_skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Skills the student should learn next (e.g., Docker, AWS, System Design)",
                  },
                  suggested_projects: {
                    type: "array",
                    items: { type: "string" },
                    description: "Project ideas the student should build (e.g., Build a scalable web app, Deploy on cloud)",
                  },
                  improvement_suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        suggestion: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["category", "suggestion", "priority"],
                    },
                    description: "Specific actionable improvement suggestions with category and priority",
                  },
                },
                required: ["detected_skills", "projects", "strengths", "weaknesses", "resume_score", "summary", "suggested_skills", "suggested_projects", "improvement_suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_resume_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI analysis error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const analysis = JSON.parse(toolCall.function.arguments);

    // ─── Persist results ───
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const skillsToSet = analysis.detected_skills || localSkills;
    const projectsCount = (analysis.projects || []).length;

    // Update profile
    await adminClient
      .from("profiles")
      .update({
        skills: skillsToSet,
        projects_count: projectsCount,
        resume_url: resume_url,
        extracted_resume_text: cleanedText.substring(0, 10000),
      })
      .eq("user_id", userId);

    // Upsert resume_analysis record
    await adminClient
      .from("resume_analysis")
      .upsert({
        student_id: userId,
        resume_url,
        detected_skills: skillsToSet,
        projects: analysis.projects || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        resume_score: analysis.resume_score || 0,
        summary: analysis.summary || "",
        suggested_skills: analysis.suggested_skills || [],
        suggested_projects: analysis.suggested_projects || [],
        improvement_suggestions: analysis.improvement_suggestions || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: "student_id" });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          detected_skills: skillsToSet,
          projects: analysis.projects,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          resume_score: analysis.resume_score,
          summary: analysis.summary,
          suggested_skills: analysis.suggested_skills,
          suggested_projects: analysis.suggested_projects,
          improvement_suggestions: analysis.improvement_suggestions,
          sections_detected: sections,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("resume-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
