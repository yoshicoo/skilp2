export type SkillItem = { name: string; level: number; category?: string };
export type ProjectItem = {
  title: string; industry: string; size?: string; role: string;
  period?: string; description?: string; techStack?: string[]; achievements?: string[];
};
export type CVData = {
  summary?: string; strengths?: string[]; recommendedAssignments?: string[];
  skills: SkillItem[]; projects: ProjectItem[]; responsibilities: string[];
  domainKnowledge: string[]; certifications: string[];
  management: { teamSize?: string; period?: string; details?: string };
  others?: string[];
};
export type ExtractResponse = {
  extracted: CVData;
  suggestions: { nextQuestions: string[]; missingSections: string[] };
};
