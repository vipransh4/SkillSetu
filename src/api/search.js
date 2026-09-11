import apiClient from './client';

// Shared mock opportunities dataset
export const mockOpportunities = [
  {
    id: 'op-1',
    title: 'Frontend Developer Intern',
    company: 'TechNova',
    category: 'SaaS',
    type: 'Full-Time',
    logo: 'TN',
    location: 'Remote',
    duration: '6 Months',
    stipend: '₹25,000 / mo',
    deadline: '30 Oct 2026',
    matchScore: 91,
    skills: ['React', 'Git', 'CSS', 'JavaScript'],
  },
  {
    id: 'op-2',
    title: 'FullStack Developer',
    company: 'EduSpark',
    category: 'EdTech',
    type: 'Job',
    logo: 'ES',
    location: 'Remote',
    duration: 'Full-time',
    stipend: '₹9-14 LPA',
    deadline: '28 Oct 2026',
    matchScore: 88,
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
  },
  {
    id: 'op-3',
    title: 'UI Engineer',
    company: 'Auralis',
    category: 'FinTech',
    type: 'Job',
    logo: 'AU',
    location: 'Bangalore',
    duration: 'Full-time',
    stipend: '10-15 LPA',
    deadline: '02 Nov 2026',
    matchScore: 85,
    skills: ['React', 'TypeScript', 'CSS', 'Design Systems'],
  },
  {
    id: 'op-4',
    title: 'Hospital Scheduling System',
    company: 'MediCore',
    category: 'HealthTech',
    type: 'Live Project',
    logo: 'MC',
    location: 'Chennai',
    duration: '10 weeks',
    stipend: '₹15,000 total',
    deadline: '18 Oct 2026',
    matchScore: 80,
    skills: ['React', 'SQL', 'Problem Solving', 'Teamwork'],
  },
  {
    id: 'op-5',
    title: 'Data Analyst Intern',
    company: 'FinEdge',
    category: 'Analytics',
    type: 'Internship',
    logo: 'FE',
    location: 'Pune',
    duration: '3 Months',
    stipend: '₹18,000 / mo',
    deadline: '20 Oct 2026',
    matchScore: 82,
    skills: ['SQL', 'Python', 'Data Analysis', 'Communication'],
  },
  {
    id: 'op-6',
    title: 'Software Engineer',
    company: 'Nimbus Labs',
    category: 'Cloud Services',
    type: 'Job',
    logo: 'NL',
    location: 'Bangalore/Remote',
    duration: 'Full-time',
    stipend: '8-12 LPA',
    deadline: '12 Nov 2026',
    matchScore: 89,
    skills: ['Java', 'Data Structures', 'SQL', 'Problem Solving'],
  },
  {
    id: 'op-7',
    title: 'Cloud Engineering Intern',
    company: 'Sky-Stack',
    category: 'DevOps',
    type: 'Internship',
    logo: 'SS',
    location: 'Hyderabad',
    duration: '6 Months',
    stipend: '₹30,000 / mo',
    deadline: '05 Nov 2026',
    matchScore: 86,
    skills: ['Cloud Computing', 'Linux', 'Docker', 'Python'],
  },
  {
    id: 'op-8',
    title: 'Cybersecurity Apprentice',
    company: 'SecureGrid',
    category: 'Security',
    type: 'Apprenticeship',
    logo: 'SG',
    location: 'Delhi NCR',
    duration: '12 Months',
    stipend: '₹22,000 / mo',
    deadline: '15 Nov 2026',
    matchScore: 84,
    skills: ['Cybersecurity', 'Linux', 'Problem Solving'],
  },
];

// Shared mock candidates dataset
export const mockCandidates = [
  {
    id: 'std-1',
    name: 'Aarav Sharma',
    avatar: 'AS',
    avatarBg: 'bg-teal-600',
    verified: true,
    college: 'NIT Trichy',
    skills: ['React', 'Node.js', 'SQL', 'JavaScript'],
    assessmentScore: 88,
    matchScore: 94,
    role: 'Full Stack Engineer',
  },
  {
    id: 'std-2',
    name: 'Diya Patel',
    avatar: 'DP',
    avatarBg: 'bg-purple-600',
    verified: true,
    college: 'IIT Madras',
    skills: ['Python', 'AWS', 'SQL', 'Machine Learning'],
    assessmentScore: 91,
    matchScore: 91,
    role: 'Cloud & AI Engineer',
  },
  {
    id: 'std-3',
    name: 'Rohan Iyer',
    avatar: 'RI',
    avatarBg: 'bg-amber-600',
    verified: false,
    college: 'Anna University',
    skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes'],
    assessmentScore: 82,
    matchScore: 87,
    role: 'Backend Systems Developer',
  },
  {
    id: 'std-4',
    name: 'Sneha Kulkarni',
    avatar: 'SK',
    avatarBg: 'bg-emerald-600',
    verified: true,
    college: 'BITS Pilani',
    skills: ['React', 'TypeScript', 'Figma', 'UI/UX Design'],
    assessmentScore: 86,
    matchScore: 85,
    role: 'Frontend & Product Designer',
  },
  {
    id: 'std-5',
    name: 'Arjun Mehta',
    avatar: 'AM',
    avatarBg: 'bg-red-600',
    verified: false,
    college: 'VIT Vellore',
    skills: ['Node.js', 'MongoDB', 'Redis', 'Express'],
    assessmentScore: 79,
    matchScore: 81,
    role: 'API & Microservices Engineer',
  },
];

// Shared mock faculty opportunities dataset
export const mockFacultyOpportunities = [
  {
    id: 'fac-1',
    title: 'AI & Deep Learning Faculty Development Program',
    company: 'TechNova Research',
    category: 'FDP',
    type: 'Residency',
    location: 'Remote / Virtual',
    duration: '4 Weeks',
    stipend: '₹40,000 Grant',
    deadline: '25 Oct 2026',
    matchScore: 95,
    skills: ['Deep Learning', 'PyTorch', 'Generative AI', 'Curriculum Design'],
  },
  {
    id: 'fac-2',
    title: 'EV Battery Management Collaborative Research Project',
    company: 'Nimbus Labs',
    category: 'Research',
    type: 'Research Project',
    location: 'Bangalore / Hybrid',
    duration: '6 Months',
    stipend: '₹2,50,000 Funding',
    deadline: '15 Nov 2026',
    matchScore: 92,
    skills: ['Matlab', 'Simulink', 'IoT Sensors', 'Thermal Dynamics'],
  },
  {
    id: 'fac-3',
    title: 'DevOps & Cloud Architecture Industry Training',
    company: 'Sky-Stack Enterprise',
    category: 'Industrial Training',
    type: 'Workshop',
    location: 'Hyderabad',
    duration: '2 Weeks',
    stipend: '₹25,000 Honorarium',
    deadline: '08 Nov 2026',
    matchScore: 89,
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS Cloud'],
  },
  {
    id: 'fac-4',
    title: 'Capital Markets & Algorithmic Trading Fellowship',
    company: 'FinEdge Financial',
    category: 'Consultancy',
    type: 'Consultancy',
    location: 'Mumbai / Hybrid',
    duration: '3 Months',
    stipend: '₹1,20,000 Grant',
    deadline: '30 Nov 2026',
    matchScore: 87,
    skills: ['Financial Econometrics', 'Python', 'Risk Modeling', 'Data Analysis'],
  },
];

export const searchService = {
  /**
   * Search job opportunities with backend 3-signal fusion or fallback
   */
  async searchJobs(query = '', limit = 10) {
    const q = query.trim().toLowerCase();
    try {
      const response = await apiClient.get('/students/jobs/search', {
        params: { q: query, limit },
      });
      if (response.data?.listings && response.data.listings.length > 0) {
        return response.data.listings.map((item) => ({
          id: String(item.id),
          title: item.title,
          company: item.company_name || 'Partner Company',
          category: item.role_type || 'Job',
          type: item.role_type || 'Full-Time',
          logo: (item.company_name || 'SS').substring(0, 2).toUpperCase(),
          location: item.location || (item.is_remote ? 'Remote' : 'On-Site'),
          duration: item.tenure || 'Flexible',
          stipend: item.stipend_or_ctc || 'Competitive',
          deadline: item.application_deadline || 'Open',
          matchScore: Math.round((item.fusion_score || item.deterministic_score || 0.85) * 100),
          skills: item.matched_skills || item.required_skills || [],
        }));
      }
    } catch {
      // Fallback to client-side search
    }

    if (!q) return mockOpportunities.slice(0, limit);

    return mockOpportunities
      .filter((op) => {
        return (
          op.title.toLowerCase().includes(q) ||
          op.company.toLowerCase().includes(q) ||
          op.location.toLowerCase().includes(q) ||
          op.skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .slice(0, limit);
  },

  /**
   * Search candidate talent with backend 3-signal recruiter search or fallback
   */
  async searchCandidates(query = '', limit = 10) {
    const q = query.trim().toLowerCase();
    try {
      const response = await apiClient.get('/students/search', {
        params: { q: query, limit },
      });
      if (response.data?.results && response.data.results.length > 0) {
        return response.data.results.map((c) => ({
          id: String(c.id || c.student_id),
          name: c.name || c.username || `Candidate #${c.student_id || c.id}`,
          avatar: (c.name || c.username || 'CA').substring(0, 2).toUpperCase(),
          avatarBg: 'bg-blue-600',
          verified: !!c.is_verified,
          college: c.institution || 'Verified University',
          skills: c.skills_matched || c.top_skills || [],
          assessmentScore: Math.round(c.confidence_score || c.assessment_score || 85),
          matchScore: Math.round((c.fusion_score || c.fit_score || 0.88) * 100),
          role: c.current_designation || c.degree || 'Candidate',
        }));
      }
    } catch {
      // Fallback to client-side candidate search
    }

    if (!q) return mockCandidates.slice(0, limit);

    return mockCandidates
      .filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.college.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .slice(0, limit);
  },

  /**
   * Search faculty opportunities & institutions with backend or fallback
   */
  async searchFaculty(query = '', limit = 10) {
    const q = query.trim().toLowerCase();
    try {
      const response = await apiClient.get('/institutions/faculty/opportunities', {
        params: { q: query },
      });
      if (response.data && response.data.length > 0) {
        return response.data.map((item) => ({
          id: String(item.id),
          title: item.title,
          company: item.company_name || 'Academic Institution',
          category: item.role_type || 'FDP',
          type: item.role_type || 'Faculty Residency',
          location: item.location || (item.is_remote ? 'Remote' : 'On-Site'),
          duration: item.tenure || 'Flexible',
          stipend: item.stipend_or_ctc || 'Grant Provided',
          deadline: item.application_deadline || 'Open',
          matchScore: 90,
          skills: item.required_skills || [],
        }));
      }
    } catch {
      // Fallback
    }

    if (!q) return mockFacultyOpportunities.slice(0, limit);

    return mockFacultyOpportunities
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .slice(0, limit);
  },

  /**
   * Universal role-aware search query
   */
  async searchByRole(query, userRole = 'student') {
    const q = query.trim();
    if (!q) {
      return { jobs: [], candidates: [], faculty: [] };
    }

    if (userRole === 'industry') {
      const candidates = await this.searchCandidates(q, 6);
      const jobs = await this.searchJobs(q, 4);
      return { candidates, jobs, faculty: [] };
    } else if (userRole === 'academician') {
      const faculty = await this.searchFaculty(q, 6);
      const jobs = await this.searchJobs(q, 4);
      return { faculty, jobs, candidates: [] };
    } else {
      // student / guest
      const jobs = await this.searchJobs(q, 6);
      return { jobs, candidates: [], faculty: [] };
    }
  },
};

export default searchService;
