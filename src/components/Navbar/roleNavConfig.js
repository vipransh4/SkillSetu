export const normalizeRole = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'industry' || r === 'recruiter') return 'recruiter';
  if (r === 'academician' || r === 'academia') return 'academician';
  return 'student';
};

export const ROLE_NAV_CONFIG = {
  opportunities: {
    student: {
      column1: {
        header: 'EXPLORE',
        items: [
          { label: 'All Opportunities', route: 'opportunities', query: '' },
          { label: 'Internship Drives', route: 'opportunities', query: 'internship' },
          { label: 'Full-Time Roles', route: 'opportunities', query: 'full-time' },
          { label: 'Remote Openings', route: 'opportunities', query: 'remote' }
        ]
      },
      column2: {
        header: 'CATEGORY',
        items: [
          { label: 'Corporate Residencies', route: 'opportunities', query: 'residency' },
          { label: 'High-Match Roles (90%+)', route: 'opportunities', query: 'high-match', badge: '90%+' },
          { label: 'Verified Fast-Track', route: 'opportunities', query: 'verified', badge: 'Fast-Track' }
        ]
      },
      column3: {
        header: 'APPLICATIONS',
        items: [
          { label: 'Active Submissions', route: 'applications' },
          { label: 'Interview Pipeline', route: 'applications', query: 'interviews' },
          { label: 'Offer Ledger', route: 'applications', query: 'offers' }
        ]
      }
    },
    recruiter: {
      column1: {
        header: 'POSTINGS',
        items: [
          { label: 'My Openings', route: 'post-jobs' },
          { label: 'Create New Listing', route: 'post-jobs' },
          { label: 'Campus Hiring Drives', route: 'opportunities' }
        ]
      },
      column2: {
        header: 'TALENT SEARCH',
        items: [
          { label: 'Advanced Talent Search', route: 'students' },
          { label: 'Shortlisted Pipeline', route: 'applications' },
          { label: 'Candidate Radar', route: 'students' }
        ]
      },
      column3: {
        header: 'OPERATIONS',
        items: [
          { label: 'Direct Interview Invites', route: 'applications' },
          { label: 'Offer Dispatches', route: 'applications' },
          { label: 'Institutional MoUs', route: 'post-jobs' }
        ]
      }
    },
    academician: {
      column1: {
        header: 'FACULTY IMMERSION',
        items: [
          { label: 'Faculty Internships', route: 'opportunities', query: 'faculty' },
          { label: 'Corporate Residencies', route: 'opportunities', query: 'residency' },
          { label: 'FDP Tracks', route: 'learning', query: 'fdp' }
        ]
      },
      column2: {
        header: 'CONSULTANCY & RESEARCH',
        items: [
          { label: 'Joint Research Grants', route: 'opportunities', query: 'research' },
          { label: 'Industry Consultancy', route: 'opportunities', query: 'consultancy' },
          { label: 'Innovation Challenges', route: 'learning', query: 'challenges' }
        ]
      },
      column3: {
        header: 'ADVISORY',
        items: [
          { label: 'Student Job Demand Radar', route: 'institution-analytics' },
          { label: 'Recommended Tracks', route: 'learning' },
          { label: 'Share with Batch', route: 'institution-analytics' }
        ]
      }
    }
  },

  learning: {
    student: {
      column1: {
        header: 'SKILLS & PATHWAYS',
        items: [
          { label: 'My Skill Ledger', route: 'my-skills' },
          { label: 'Clustered Assessments', route: 'assessment' },
          { label: 'Dynamic Learning Paths', route: 'learning' }
        ]
      },
      column2: {
        header: 'VERIFICATION',
        items: [
          { label: 'Project Corroboration', route: 'upload-skills' },
          { label: 'Academic Bank of Credits Sync', route: 'upload-skills', badge: 'ABC' },
          { label: 'Verification Badges', route: 'my-skills', badge: 'Verified' }
        ]
      },
      column3: {
        header: 'BENCHMARKS',
        items: [
          { label: 'NHEQF Level Alignment', route: 'my-skills', badge: 'Level 6.0' },
          { label: 'Peer Percentiles', route: 'my-skills' },
          { label: 'Anti-Cheat Verification', route: 'assessment' }
        ]
      }
    },
    recruiter: {
      column1: {
        header: 'CURRICULUM STANDARDS',
        items: [
          { label: 'Institutional Syllabus Index', route: 'learning' },
          { label: 'Benchmark Competencies', route: 'students' },
          { label: 'NHEQF Standards', route: 'learning' }
        ]
      },
      column2: {
        header: 'VERIFICATION RIGOR',
        items: [
          { label: 'Clustered Assessment Weights', route: 'students' },
          { label: 'Anti-Cheat Audit Logs', route: 'students' },
          { label: 'Project Artifact Rules', route: 'students' }
        ]
      },
      column3: {
        header: 'BENCHMARKING',
        items: [
          { label: 'Skill Gap Analysis', route: 'students' },
          { label: 'Campus Placement Radar', route: 'opportunities' },
          { label: 'Accreditation Metrics', route: 'post-jobs' }
        ]
      }
    },
    academician: {
      column1: {
        header: 'GOVERNANCE',
        items: [
          { label: 'Campus Skill Deficit Radar', route: 'institution-analytics' },
          { label: 'Curriculum Mapping', route: 'institution-analytics' },
          { label: 'Department Benchmarks', route: 'institution-analytics' }
        ]
      },
      column2: {
        header: 'RESOURCE HUB',
        items: [
          { label: 'Course Lectures', route: 'institution-lectures' },
          { label: 'Video Modules', route: 'institution-lectures' },
          { label: 'Study Resources', route: 'learning' }
        ]
      },
      column3: {
        header: 'INSTITUTIONAL',
        items: [
          { label: 'Batch Ingestion', route: 'institution-organization' },
          { label: 'Student APAAR Ledger', route: 'institution-compliance' },
          { label: 'NEP 2020 Compliance', route: 'institution-governance' }
        ]
      }
    }
  },

  applications: {
    student: {
      column1: {
        header: 'APPLICATION STAGES',
        items: [
          { label: 'Active Pipeline', route: 'applications' },
          { label: 'Scheduled Interviews', route: 'applications', query: 'interviews' },
          { label: 'Received Offers', route: 'applications', query: 'offers' }
        ]
      },
      column2: {
        header: 'EVALUATIONS',
        items: [
          { label: 'Assessment Scores', route: 'assessment' },
          { label: 'Feedback History', route: 'applications' },
          { label: 'Recruiter Remarks', route: 'applications' }
        ]
      },
      column3: {
        header: 'DISCOVERY',
        items: [
          { label: 'Explore More Positions', route: 'opportunities' },
          { label: 'Reverse-Matched Roles', route: 'my-skills' },
          { label: 'Follow Partner Companies', route: 'opportunities' }
        ]
      }
    },
    recruiter: {
      column1: {
        header: 'CANDIDATE FUNNEL',
        items: [
          { label: 'All Applicants', route: 'applications' },
          { label: 'Under Review', route: 'applications' },
          { label: 'Shortlisted Pool', route: 'applications' }
        ]
      },
      column2: {
        header: 'INTERVIEWS',
        items: [
          { label: 'Scheduled Interviews', route: 'applications' },
          { label: 'Zego Live Sessions', route: 'opportunities' },
          { label: 'Candidate Evaluations', route: 'applications' }
        ]
      },
      column3: {
        header: 'DECISIONS',
        items: [
          { label: 'Offered Candidates', route: 'applications' },
          { label: 'Archived Submissions', route: 'applications' },
          { label: 'Audit Log & Reports', route: 'post-jobs' }
        ]
      }
    },
    academician: {
      column1: {
        header: 'PLACEMENT FUNNEL',
        items: [
          { label: 'Department Conversion', route: 'institution-analytics' },
          { label: 'Offer Verification', route: 'institution-analytics' },
          { label: 'Student Applications', route: 'institution-analytics' }
        ]
      },
      column2: {
        header: 'RECRUITERS',
        items: [
          { label: 'Partner Companies', route: 'opportunities' },
          { label: 'Campus Drives', route: 'opportunities' },
          { label: 'Corporate MOUs', route: 'institution-hub' }
        ]
      },
      column3: {
        header: 'REPORTS',
        items: [
          { label: 'NIRF / NAAC Export', route: 'institution-analytics' },
          { label: 'Skill Gap Breakdown', route: 'institution-analytics' },
          { label: 'Placement Summary', route: 'institution-analytics' }
        ]
      }
    }
  },

  students: {
    student: {
      column1: {
        header: 'PEER NETWORK',
        items: [
          { label: 'Talent Directory', route: 'students' },
          { label: 'Verified Profiles', route: 'students' },
          { label: 'Portfolio Showcase', route: 'upload-skills' }
        ]
      },
      column2: {
        header: 'BENCHMARKING',
        items: [
          { label: 'Peer Score Percentiles', route: 'my-skills' },
          { label: 'Domain Rankings', route: 'my-skills' },
          { label: 'Skill Gap Analysis', route: 'my-skills' }
        ]
      },
      column3: {
        header: 'PROFILE TOOLS',
        items: [
          { label: 'Update Portfolio', route: 'upload-skills' },
          { label: 'Take Skill Assessment', route: 'assessment' },
          { label: 'Digital Credentials', route: 'profile' }
        ]
      }
    },
    recruiter: {
      column1: {
        header: 'TALENT DISCOVERY',
        items: [
          { label: 'All Verified Talent', route: 'students' },
          { label: 'Cognitive Score >= 80%', route: 'students' },
          { label: 'Shortlisted Candidates', route: 'students' }
        ]
      },
      column2: {
        header: 'PIPELINE ACTIONS',
        items: [
          { label: 'Direct Shortlisting', route: 'students' },
          { label: 'Schedule Video Interview', route: 'opportunities' },
          { label: 'Send Opportunity Invite', route: 'students' }
        ]
      },
      column3: {
        header: 'CAMPUS CORRIDORS',
        items: [
          { label: 'Engineering Colleges', route: 'students' },
          { label: 'Management Institutes', route: 'students' },
          { label: 'Accreditation Filter', route: 'students' }
        ]
      }
    },
    academician: {
      column1: {
        header: 'STUDENT ROSTER',
        items: [
          { label: 'Department Cohort', route: 'institution-analytics' },
          { label: 'Verified Skills Ledger', route: 'institution-analytics' },
          { label: 'Placement Status', route: 'institution-analytics' }
        ]
      },
      column2: {
        header: 'PERFORMANCE',
        items: [
          { label: 'Assessment Scores', route: 'institution-analytics' },
          { label: 'Readiness Percentiles', route: 'institution-analytics' },
          { label: 'Top Performers', route: 'institution-analytics' }
        ]
      },
      column3: {
        header: 'COMPLIANCE',
        items: [
          { label: 'APAAR ID Mapping', route: 'institution-compliance' },
          { label: 'ABC Credits Sync', route: 'institution-compliance' },
          { label: 'NEP Specialization Radar', route: 'institution-governance' }
        ]
      }
    }
  },

  portfolio: {
    student: {
      column1: {
        header: 'DIGITAL PORTFOLIO',
        items: [
          { label: 'View My Portfolio', route: 'upload-skills' },
          { label: 'Verified Skills Matrix', route: 'my-skills' },
          { label: 'Cognitive Score & Badges', route: 'assessment' },
          { label: 'Academic Transcript & SGPA', route: 'upload-skills' }
        ]
      },
      column2: {
        header: 'EXPERIENCE & PROJECTS',
        items: [
          { label: 'Production Projects', route: 'upload-skills' },
          { label: 'Internship Milestones & Ratings', route: 'applications', query: 'internships' },
          { label: 'SIH & IEEE Achievements', route: 'upload-skills' },
          { label: 'Industry Certifications', route: 'profile' }
        ]
      },
      column3: {
        header: 'PORTFOLIO ACTIONS',
        items: [
          { label: 'Add New Project', route: 'upload-skills' },
          { label: 'Log Internship Milestone', route: 'applications' },
          { label: 'Public Candidate Profile', route: 'profile' },
          { label: 'Share Portfolio Link', route: 'profile' }
        ]
      }
    },
    recruiter: {
      column1: {
        header: 'PORTFOLIO DISCOVERY',
        items: [
          { label: 'Verified Candidate Portfolios', route: 'students' },
          { label: 'Blind-Screened Portfolios', route: 'students' },
          { label: 'Top 10% Verified Talent', route: 'students' }
        ]
      },
      column2: {
        header: 'INTERNSHIP EVALUATIONS',
        items: [
          { label: 'Supervised Interns', route: 'applications' },
          { label: 'Weekly Milestone Logs', route: 'applications' },
          { label: 'Rating & Credential Dispatch', route: 'applications' }
        ]
      },
      column3: {
        header: 'VERIFIED SIGNALS',
        items: [
          { label: 'Production Code Reviews', route: 'students' },
          { label: 'SIH & Competition Honors', route: 'students' },
          { label: 'Fast-Track Interview Invites', route: 'applications' }
        ]
      }
    },
    academician: {
      column1: {
        header: 'STUDENT PORTFOLIOS',
        items: [
          { label: 'Department Cohort Portfolios', route: 'institution-analytics' },
          { label: 'Verified Project Ledger', route: 'institution-analytics' },
          { label: 'National Competition Honors', route: 'institution-analytics' }
        ]
      },
      column2: {
        header: 'CREDENTIALS & COMPLIANCE',
        items: [
          { label: 'APAAR & ABC Credits Sync', route: 'institution-compliance' },
          { label: 'Semester SGPA Records', route: 'institution-analytics' },
          { label: 'NEP 2020 Skill Verification', route: 'institution-governance' }
        ]
      },
      column3: {
        header: 'FACULTY DOSSIER',
        items: [
          { label: 'My Research & FDP Portfolio', route: 'academician-profile' },
          { label: 'Patents & Consultancies', route: 'academician-profile' },
          { label: 'AISHE Institutional Export', route: 'institution-organization' }
        ]
      }
    }
  }
};
