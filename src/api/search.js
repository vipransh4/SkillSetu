import apiClient from './client';
import authService from './auth';

export const searchService = {
  /**
   * Search active job listings via 3-signal fusion endpoint
   */
  async searchJobs(query = '', limit = 10) {
    const q = query.trim();
    try {
      const response = await apiClient.get('/students/jobs/search', {
        params: { q, limit },
      });
      const items = response.data?.results || response.data?.listings || [];
      if (Array.isArray(items)) {
        return items.map((item) => ({
          id: String(item.id),
          title: item.title,
          company: item.company_name || 'Enterprise Partner',
          category: item.role_type || 'Job',
          type: item.role_type === 'INTERNSHIP' ? 'Internship' : (item.role_type === 'FULL_TIME' ? 'Full-Time' : (item.role_type || 'Job')),
          logo: (item.company_name || 'SS').substring(0, 2).toUpperCase(),
          location: item.location || (item.is_remote ? 'Remote' : 'On-Site'),
          duration: item.tenure || 'Flexible',
          stipend: item.stipend_or_ctc || 'Competitive',
          deadline: item.application_deadline ? new Date(item.application_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open',
          matchScore: Math.round((item.match_score || item.fusion_score || 0.88) * 100),
          skills: item.matched_skills?.length ? item.matched_skills : (item.required_skills || []),
        }));
      }
    } catch (err) {
      console.warn('Jobs search error, falling back to feed', err);
      // Fallback: try loading live feed
      try {
        const feedRes = await apiClient.get('/students/jobs/feed', { params: { q } });
        const list = feedRes.data?.jobs || feedRes.data?.results || [];
        return list.slice(0, limit).map((item) => ({
          id: String(item.id),
          title: item.title,
          company: item.company_name || 'Enterprise Partner',
          category: item.role_type || 'Job',
          type: item.role_type === 'INTERNSHIP' ? 'Internship' : 'Full-Time',
          logo: (item.company_name || 'SS').substring(0, 2).toUpperCase(),
          location: item.location || (item.is_remote ? 'Remote' : 'On-Site'),
          duration: item.tenure || 'Flexible',
          stipend: item.stipend_or_ctc || 'Competitive',
          deadline: item.application_deadline ? new Date(item.application_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open',
          matchScore: 90,
          skills: item.required_skills || [],
        }));
      } catch {
        return [];
      }
    }
    return [];
  },

  /**
   * Search candidates - STRICTLY RESTRICTED TO RECRUITERS.
   * Candidates and unauthenticated users receive an empty array [].
   */
  async searchCandidates(query = '', limit = 10) {
    const user = authService.getUser();
    
    // Privacy & Role Gate: Candidates NEVER see other candidate profiles
    if (!user || user.role !== 'industry') {
      return [];
    }

    const q = query.trim();
    try {
      const response = await apiClient.get('/students/search', {
        params: { q, limit },
      });
      const items = response.data?.results || [];
      if (Array.isArray(items)) {
        return items
          .map((c) => {
            const allSkills = Object.keys(c.skills_matrix || {});
            const fullSkills = (c.raw_extracted_skills && c.raw_extracted_skills.length) 
              ? c.raw_extracted_skills 
              : (allSkills.length ? allSkills : (c.matched_skills || []));

            // Strict skill-based matching: 0 skills or 0 match -> strictly 0% Match
            let calculatedMatch = 0;
            if (fullSkills.length === 0) {
              calculatedMatch = 0;
            } else if (typeof c.final_score === 'number' && c.final_score > 0) {
              calculatedMatch = Math.min(100, Math.round(c.final_score * 100));
            } else if (typeof c.fusion_score === 'number' && c.fusion_score > 0) {
              calculatedMatch = Math.min(100, Math.round(c.fusion_score * 100));
            } else {
              calculatedMatch = 0;
            }

            return {
              id: String(c.id || c.student_id),
              name: c.name || (c.username ? c.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Candidate #${c.student_id || c.id}`),
              username: c.username,
              avatar: (c.name || c.username || 'CA').substring(0, 2).toUpperCase(),
              avatarBg: c.is_verified ? 'bg-blue-600' : 'bg-slate-700',
              verified: !!c.is_verified,
              college: c.institution || 'Verified University',
              department: c.department || 'Engineering',
              degree: c.degree || '',
              skills: fullSkills,
              matchedSkills: c.matched_skills || [],
              assessmentScore: Math.round(c.overall_confidence_score || c.confidence_score || 0),
              matchScore: calculatedMatch,
              role: c.inferred_sector || c.department || c.current_designation || 'Candidate',
              bio: c.bio || '',
              experience: c.experience_years || 0,
              github: c.github_handle || '',
              shortlisted: false,
            };
          })
          .filter((candidate) => !q || candidate.matchScore > 0 || (candidate.skills && candidate.skills.length > 0));
      }
    } catch (err) {
      console.warn('Candidate search error, falling back to roster', err);
      // Fallback to roster
      try {
        const rosterRes = await apiClient.get('/students/');
        if (Array.isArray(rosterRes.data)) {
          const queryWords = q.toLowerCase().split(/\s+/).filter(Boolean);
          const filtered = rosterRes.data.filter((p) => {
            const rawSkills = p.raw_extracted_skills?.length ? p.raw_extracted_skills : Object.keys(p.skills_matrix || {});
            if (rawSkills.length === 0) return false; // 0 skills -> no match
            return !q || rawSkills.some(s => queryWords.some(qw => s.toLowerCase().includes(qw))) || p.username?.toLowerCase().includes(q.toLowerCase());
          });

          return filtered.slice(0, limit).map((p) => {
            const allSkills = Object.keys(p.skills_matrix || {});
            const fullSkills = (p.raw_extracted_skills && p.raw_extracted_skills.length) ? p.raw_extracted_skills : (allSkills.length ? allSkills : []);
            let calculatedMatch = 0;
            if (fullSkills.length === 0) {
              calculatedMatch = 0;
            } else if (q) {
              const matchedCount = fullSkills.filter(s => queryWords.some(qw => s.toLowerCase().includes(qw))).length;
              calculatedMatch = matchedCount > 0 ? Math.min(100, Math.round((matchedCount / queryWords.length) * 85)) : 0;
            } else {
              calculatedMatch = Math.round(p.profile_strength_score || 0);
            }

            return {
              id: String(p.id),
              name: p.username ? p.username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Candidate #${p.id}`,
              username: p.username,
              avatar: (p.username || 'CA').substring(0, 2).toUpperCase(),
              avatarBg: p.is_verified ? 'bg-blue-600' : 'bg-slate-700',
              verified: !!p.is_verified,
              college: p.institution || 'Verified University',
              department: p.department || 'Engineering',
              degree: p.degree || '',
              skills: fullSkills,
              matchedSkills: [],
              assessmentScore: Math.round(p.overall_confidence_score || 0),
              matchScore: calculatedMatch,
              role: p.department || p.current_designation || 'Candidate',
              bio: p.bio || '',
              experience: p.experience_years || 0,
              github: p.github_handle || '',
              shortlisted: false,
            };
          });
        }
      } catch {
        return [];
      }
    }
    return [];
  },

  /**
   * Search faculty opportunities & institutional initiatives
   */
  async searchFaculty(query = '', limit = 10) {
    const q = query.trim();
    try {
      const response = await apiClient.get('/institutions/faculty/opportunities', {
        params: { q },
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.slice(0, limit).map((item) => ({
          id: String(item.id),
          title: item.title,
          company: item.company_name || 'Academic Institution',
          category: item.role_type || 'FDP',
          type: item.role_type || 'Faculty Residency',
          location: item.location || (item.is_remote ? 'Remote' : 'On-Site'),
          duration: item.tenure || 'Flexible',
          stipend: item.stipend_or_ctc || 'Grant Provided',
          deadline: item.application_deadline ? new Date(item.application_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open',
          matchScore: 92,
          skills: item.required_skills || [],
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  },

  /**
   * Universal role-aware search dispatcher:
   * - Students / Candidates / Guests: ONLY search and see Job Listings & Opportunities. Never candidates.
   * - Recruiters (industry): Search candidate talent and jobs.
   * - Academicians: Search faculty opportunities and institutions.
   */
  async searchByRole(query, userRole = 'student') {
    const q = query.trim();
    if (!q) {
      return { jobs: [], candidates: [], faculty: [] };
    }

    if (userRole === 'industry') {
      // Recruiter: Searches candidates first, with secondary matching in job postings
      const candidates = await this.searchCandidates(q, 6);
      const jobs = await this.searchJobs(q, 4);
      return { candidates, jobs, faculty: [] };
    } else if (userRole === 'academician') {
      // Academician: Searches faculty programs and jobs
      const faculty = await this.searchFaculty(q, 6);
      const jobs = await this.searchJobs(q, 4);
      return { faculty, jobs, candidates: [] };
    } else {
      // Student / Candidate / Guest:
      // STRICT ISOLATION: Candidates NEVER see other candidates. Only job listings are shown!
      const jobs = await this.searchJobs(q, 8);
      return { jobs, candidates: [], faculty: [] };
    }
  },
};

export default searchService;
