export type OpportunityRoleType = 
  | 'FULL_TIME'
  | 'INTERNSHIP'
  | 'APPRENTICESHIP'
  | 'CONTRACT'
  | 'FACULTY_INTERNSHIP'
  | 'FDP'
  | 'RESEARCH_PROJECT';

export interface CandidateMatchScore {
  score: number;
  cognitiveConfidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
}

export interface JobOpportunity {
  id: string | number;
  title: string;
  company: string;
  company_id?: number;
  company_logo?: string;
  company_website?: string;
  company_headquarters?: string;
  category?: string;
  role_type?: OpportunityRoleType | string;
  type?: string;
  logo?: string;
  location: string;
  is_remote?: boolean;
  duration?: string;
  tenure?: string;
  stipend?: string;
  stipend_or_ctc?: string;
  deadline?: string;
  application_deadline?: string;
  matchScore?: number;
  skills: string[];
  required_skills?: string[];
  about?: string;
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  open_positions?: number;
  applications_count?: number;
  is_verified_partner?: boolean;
  is_diversity_drive?: boolean;
  target_gender?: string;
  dei_initiatives?: string[];
  min_nheqf_level?: string;
  created_at?: string;
}

export interface FilterState {
  roleType: string;
  workArrangement: string;
  location: string;
  searchQuery: string;
  minMatchScore?: number;
}
