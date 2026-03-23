import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useResumeAnalysis, ResumeAnalysis } from "@/hooks/useResumeAnalysis";

interface ResumeUploadProps {
  currentUrl?: string | null;
  onUploadComplete?: (url: string, analysis?: ResumeAnalysis | null) => void;
}

// Client-side PDF text extraction using pdf.js CDN
async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Dynamic import of pdf.js from CDN
    const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs" as any);
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs";
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textParts.push(pageText);
    }
    
    return textParts.join("\n\n");
  } catch (e) {
    console.warn("PDF text extraction failed, will rely on AI analysis:", e);
    return "";
  }
}

const ResumeUpload = ({ currentUrl, onUploadComplete }: ResumeUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { analyzeResume, analyzing } = useResumeAnalysis();

  // Delete old resume files from storage for this user
  const deleteOldResumes = async () => {
    if (!user) return;
    try {
      const { data: files } = await supabase.storage
        .from("resumes")
        .list(user.id);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("resumes").remove(paths);
      }
    } catch (e) {
      console.warn("Could not clean old resumes:", e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      // Step 1: Extract text from PDF
      let extractedText = "";
      if (file.type === "application/pdf") {
        toast.info("Extracting text from resume...");
        extractedText = await extractTextFromPdf(file);
      }

      // Step 2: Delete old resume files
      await deleteOldResumes();

      // Step 3: Upload new file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);
      const resumeUrl = urlData.publicUrl;

      // Step 4: Update profile with new resume URL and clear old text
      await supabase
        .from("profiles")
        .update({ resume_url: resumeUrl, extracted_resume_text: null } as any)
        .eq("user_id", user.id);

      toast.success("Resume uploaded! Analyzing with AI...");
      setUploading(false);

      // Step 5: Trigger AI analysis (updates skills, projects, scores in DB)
      const analysis = await analyzeResume(resumeUrl, extractedText);
      if (analysis) {
        toast.success(`Resume analyzed! Score: ${analysis.resume_score}/100. Found ${analysis.detected_skills.length} skills.`);
      }

      onUploadComplete?.(resumeUrl, analysis);
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      setFileName(null);
      setUploading(false);
    }
  };

  const isProcessing = uploading || analyzing;

  return (
    <div className="glass rounded-xl p-5">
      <h4 className="font-heading font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <FileText size={16} className="text-primary" /> Resume
        {analyzing && <span className="text-xs text-accent animate-pulse">AI analyzing...</span>}
      </h4>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleUpload}
        className="hidden"
      />
      {currentUrl || fileName ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <CheckCircle size={16} className="text-accent flex-shrink-0" />
            <span className="text-foreground text-xs truncate flex-1">
              {fileName || "Resume uploaded"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            disabled={isProcessing}
            onClick={() => fileRef.current?.click()}
          >
            {analyzing ? (
              <><Loader2 className="animate-spin mr-1" size={12} /> Analyzing...</>
            ) : uploading ? (
              <><Loader2 className="animate-spin mr-1" size={12} /> Uploading...</>
            ) : (
              <><Upload size={12} className="mr-1" /> Replace Resume</>
            )}
          </Button>
        </div>
      ) : (
        <Button
          variant="hero-outline"
          size="sm"
          className="w-full"
          disabled={isProcessing}
          onClick={() => fileRef.current?.click()}
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <>
              <Upload size={14} /> Upload Resume (PDF, DOC, DOCX)
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ResumeUpload;
