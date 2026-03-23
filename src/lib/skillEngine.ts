// Skill matching utilities

export const calculateSkillMatch = (
  studentSkills: string[],
  requiredSkills: string[]
): { matchScore: number; matchedSkills: string[]; missingSkills: string[] } => {
  const normalizedStudent = studentSkills.map(s => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());

  const matchedSkills = normalizedRequired.filter(s => normalizedStudent.includes(s));
  const missingSkills = normalizedRequired.filter(s => !normalizedStudent.includes(s));
  const matchScore = normalizedRequired.length > 0
    ? Math.round((matchedSkills.length / normalizedRequired.length) * 100)
    : 0;

  return { matchScore, matchedSkills, missingSkills };
};

export const calculatePlacementScore = (params: {
  cgpa: number;
  skillScore: number;     // 0–100
  projectScore: number;   // 0–100
  certScore: number;      // 0–100
  mockScore: number;      // 0–100
  activityScore: number;  // 0–100
}): number => {
  const score =
    (params.cgpa * 10 * 0.30) + // normalize CGPA (0-10) to 0-100
    (params.skillScore * 0.25) +
    (params.projectScore * 0.15) +
    (params.certScore * 0.10) +
    (params.mockScore * 0.10) +
    (params.activityScore * 0.10);
  return Math.min(100, Math.round(score));
};

export const calculateCareerReadiness = (params: {
  cgpa: number;
  skillsCount: number;
  projectsCount: number;
  certificationsCount: number;
}): number => {
  const cgpaScore = Math.min(params.cgpa * 10, 100) * 0.3;
  const skillScore = Math.min(params.skillsCount * 10, 100) * 0.3;
  const projectScore = Math.min(params.projectsCount * 20, 100) * 0.2;
  const certScore = Math.min(params.certificationsCount * 25, 100) * 0.2;
  return Math.min(100, Math.round(cgpaScore + skillScore + projectScore + certScore));
};

export const SKILL_RESOURCES: Record<string, string> = {
  "data structures": "https://leetcode.com",
  "system design": "https://github.com/donnemartin/system-design-primer",
  "docker": "https://docs.docker.com/get-started/",
  "react": "https://react.dev/learn",
  "python": "https://docs.python.org/3/tutorial/",
  "machine learning": "https://www.coursera.org/learn/machine-learning",
  "javascript": "https://javascript.info",
  "typescript": "https://www.typescriptlang.org/docs/",
  "sql": "https://sqlbolt.com",
  "aws": "https://aws.amazon.com/training/",
  "node.js": "https://nodejs.org/en/learn",
  "java": "https://dev.java/learn/",
  "kubernetes": "https://kubernetes.io/docs/tutorials/",
  "git": "https://learngitbranching.js.org",
};
