import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Timer, 
  IndianRupee, 
  CalendarClock, 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowLeft, 
  Check, 
  Sparkles 
} from 'lucide-react';

const initialOpportunities = [
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
    about: 'Join the TechNova product team and build customer-facing interfaces used by 40,000+ businesses. You will work alongside senior engineers and designers in a fast, review-driven environment.',
    responsibilities: [
      'Build and maintain responsive React components',
      'Collaborate with designers on the design system',
      'Write unit tests and participate in code reviews',
      'Improve page performance and accessibility'
    ],
    qualifications: [
      'Pursuing B.E./B.Tech in CS or related field',
      'Strong fundamentals in JavaScript and the DOM',
      'Portfolio of personal or academic projects'
    ]
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
    about: 'EduSpark is building the next generation of interactive learning tools. We are looking for a FullStack Developer to help scale our platform features.',
    responsibilities: [
      'Develop scalable APIs using Node.js and Express',
      'Integrate MongoDB pipelines for analytics dashboards',
      'Ensure seamless UX across frontend and backend connections'
    ],
    qualifications: [
      'Strong knowledge of React and Node.js backend integration',
      'Experience working with RESTful APIs and databases'
    ]
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
    about: 'Auralis is crafting high-fidelity design systems for modern financial web products.',
    responsibilities: [
      'Architect micro-frontend web design components',
      'Maintain system UI consistency across multi-tier applications'
    ],
    qualifications: [
      'Expertise in CSS, Tailwind, and component systems',
      'Proficiency in TypeScript and React ecosystem'
    ]
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
    about: 'MediCore is creating an agile booking system to manage real-time patient queue allocations across regional clinics.',
    responsibilities: [
      'Build responsive UI screens for scheduling',
      'Connect frontend state to SQL database queries'
    ],
    qualifications: [
      'Basic database normalization and React state management skills'
    ]
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
    about: 'Analyze real-time market movement datasets and transform complex transactional information into actionable insights.',
    responsibilities: [
      'Run query pipelines on financial databases',
      'Create visual dashboards for stakeholders'
    ],
    qualifications: [
      'Familiarity with SQL joins, aggregations, and Python Pandas'
    ]
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
    about: 'Build resilient backends capable of serving high-concurrency microservices.',
    responsibilities: [
      'Write clean, maintainable Java code',
      'Optimize algorithmic runtime for data-intensive services'
    ],
    qualifications: [
      'Solid foundations in OOP, Data Structures, and SQL'
    ]
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
    about: 'Automate infrastructure deployment scripts and manage containerized microservice deployments.',
    responsibilities: [
      'Build container builds using Docker',
      'Monitor cloud metrics and optimize build workflows'
    ],
    qualifications: [
      'Working knowledge of Linux CLI and basic containerization'
    ]
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
    about: 'Learn real-world threat detection, system hardening, and network vulnerability assessments.',
    responsibilities: [
      'Monitor access logs and identify anomalous security events',
      'Assist senior engineers with audit reports'
    ],
    qualifications: [
      'Understanding of networking protocols and Linux commands'
    ]
  }
];

const Opportunities = ({ 
  onRouteChange, 
  initialSearch = '', 
  initialSelectedId = null, 
  opportunitiesList = initialOpportunities 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  
  // Track applied opportunities by ID
  const [appliedIds, setAppliedIds] = useState([]);

  // Sync incoming search query or pre-selected opportunity from Navbar search
  React.useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  React.useEffect(() => {
    if (initialSelectedId) {
      const found = opportunitiesList.find((op) => String(op.id) === String(initialSelectedId));
      if (found) {
        setSelectedOpportunity(found);
      }
    }
  }, [initialSelectedId, opportunitiesList]);

  const handleApply = (id) => {
    if (!appliedIds.includes(id)) {
      setAppliedIds((prev) => [...prev, id]);
    }
  };

  const filteredOpportunities = useMemo(() => {
    return opportunitiesList.filter((op) => {
      const matchesSearch =
        op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'All' || op.type === selectedType;
      const matchesLocation =
        selectedLocation === 'All' ||
        (selectedLocation === 'Remote'
          ? op.location.toLowerCase().includes('remote')
          : !op.location.toLowerCase().includes('remote'));

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [opportunitiesList, searchTerm, selectedType, selectedLocation]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedLocation('All');
  };

  /* Render Details View if a card was clicked */
  if (selectedOpportunity) {
    const isApplied = appliedIds.includes(selectedOpportunity.id);

    return (
      <div className="min-h-screen pb-16">
        <div className="mt-16">
          <main className="max-w-6xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-6 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span>Back to Opportunities</span>
            </button>

            {/* View Details Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                        {selectedOpportunity.logo || selectedOpportunity.company?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900">{selectedOpportunity.title}</h1>
                        <p className="text-slate-500 font-medium text-sm mt-0.5">
                          {selectedOpportunity.company} · {selectedOpportunity.category || 'Tech'} · {selectedOpportunity.type}
                        </p>
                      </div>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-200 shrink-0">
                      {selectedOpportunity.matchScore || 90}% Match
                    </div>
                  </div>

                  {/* Metadata Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                        <MapPin size={14} /> Location
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.location}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                        <Timer size={14} /> Duration
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.duration}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                        <IndianRupee size={14} /> Stipend / Salary
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.stipend}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                        <CalendarClock size={14} /> Apply before
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selectedOpportunity.deadline}</p>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">About the role</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {selectedOpportunity.about || `Join the ${selectedOpportunity.company} team as a ${selectedOpportunity.title} and work on impactful production systems.`}
                  </p>
                </div>

                {/* Responsibilities */}
                {selectedOpportunity.responsibilities && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Responsibilities</h2>
                    <ul className="flex flex-col gap-3">
                      {selectedOpportunity.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                          <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preferred Qualifications */}
                {selectedOpportunity.qualifications && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Preferred qualifications</h2>
                    <ul className="flex flex-col gap-3">
                      {selectedOpportunity.qualifications.map((qual, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                          <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Skills */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Required skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.skills?.map((skill, index) => (
                      <span key={index} className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column - Sidebar Widgets */}
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                
                {/* Compatibility Sidebar */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Your Compatibility</h3>
                  <p className="text-3xl font-extrabold text-blue-600 mb-4">{selectedOpportunity.matchScore || 90}% Match</p>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${selectedOpportunity.matchScore || 90}%` }}
                    />
                  </div>

                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Matched skills</p>
                  <div className="flex flex-col gap-2.5 mb-6">
                    {selectedOpportunity.skills?.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <Check size={16} className="text-emerald-500" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleApply(selectedOpportunity.id)}
                    disabled={isApplied}
                    className={`w-full py-3 font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                      isApplied
                        ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check size={18} />
                        <span>Applied</span>
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                </div>

                {/* Why this opportunity */}
                <div className="bg-blue-50/60 rounded-3xl p-6 sm:p-8 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-base mb-4">
                    <Sparkles size={18} />
                    <span>Why this opportunity?</span>
                  </div>
                  <ul className="flex flex-col gap-3 text-sm text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>You already have {selectedOpportunity.skills?.slice(0, 3).join(', ')}.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{selectedOpportunity.location} matches your location preferences.</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  /* Render List View */
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Explore Opportunities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Find internships, jobs, and projects matching your criteria.
          </p>
        </div>

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDE: Filter Section */}
          <aside className="w-full lg:w-72 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] shrink-0 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Filter size={18} className="text-blue-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Title, skill, or company..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Employment Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Type</label>
                <div className="flex flex-col gap-2">
                  {['All', 'Full-Time', 'Part-Time', 'Job', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="jobType"
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'All Locations', value: 'All' },
                    { label: 'Remote Only', value: 'Remote' },
                    { label: 'On-Site / In-Office', value: 'Onsite' },
                  ].map((loc) => (
                    <label key={loc.value} className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="location"
                        checked={selectedLocation === loc.value}
                        onChange={() => setSelectedLocation(loc.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      {loc.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE: Opportunities Cards (2 per row) */}
          <div className="flex-1 w-full">
            {filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpportunities.map((op) => {
                  const isApplied = appliedIds.includes(op.id);

                  return (
                    <div
                      key={op.id}
                      className="relative w-full bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-5"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center border border-blue-100 shrink-0">
                            {op.logo || op.company?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 truncate">{op.title}</h3>
                            <p className="text-sm font-medium text-slate-500">
                              {op.company} <span className="text-slate-300">•</span> {op.type}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.stipend?.replace('₹', '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock size={16} className="text-slate-400 shrink-0" />
                          <span className="truncate">{op.deadline}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {op.skills && (
                        <div className="flex flex-wrap gap-1.5">
                          {op.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setSelectedOpportunity(op)}
                          className="flex-1 py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApply(op.id)}
                          disabled={isApplied}
                          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 ${
                            isApplied
                              ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check size={16} />
                              <span>Applied</span>
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full bg-white rounded-2xl p-12 text-center border border-slate-100">
                <p className="text-slate-500 font-medium">No opportunities found matching your active filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Opportunities;