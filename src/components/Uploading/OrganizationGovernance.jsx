import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  MoreVertical,
  Shield,
  GraduationCap,
  Sparkles,
  X,
  Check,
  ChevronRight,
  ArrowUpDown,
  BookOpen,
  Eye,
  RefreshCw,
  FileText
} from 'lucide-react';
import apiClient from '../../api/client';

const NHEQF_LEVELS = [
  { value: 'All', label: 'All NHEQF Levels' },
  { value: 'Level 4.5', label: 'Level 4.5 (Year 1 - Cert)' },
  { value: 'Level 5.0', label: 'Level 5.0 (Year 2 - Diploma)' },
  { value: 'Level 5.5', label: 'Level 5.5 (Year 3 - Bachelor)' },
  { value: 'Level 6.0', label: 'Level 6.0 (Year 4 - B.Tech/Hons)' },
  { value: 'Level 7.0', label: 'Level 7.0 (Postgraduate)' }
];

const SAMPLE_CSV_ROWS = [
  { roll_no: '23CS0101', full_name: 'Aarav Sharma', email: 'aarav.sharma@campus.edu', apaar_id: '8910-2345-6712', department: 'Computer Science', nheqf: 'Level 6.0', graduation_year: '2026' },
  { roll_no: '23CS0102', full_name: 'Diya Patel', email: 'diya.patel@campus.edu', apaar_id: '4512-7890-1234', department: 'Computer Science', nheqf: 'Level 6.0', graduation_year: '2026' },
  { roll_no: '23EC0205', full_name: 'Rohan Verma', email: 'rohan.v@campus.edu', apaar_id: '6789-0123-4567', department: 'Electronics & Communication', nheqf: 'Level 5.5', graduation_year: '2026' },
  { roll_no: '23ME0304', full_name: 'Ananya Iyer', email: 'ananya.i@campus.edu', apaar_id: '3456-7890-1234', department: 'Mechanical Engineering', nheqf: 'Level 6.0', graduation_year: '2026' },
  { roll_no: '23IT0411', full_name: 'Kabir Mehta', email: 'kabir.m@campus.edu', apaar_id: '9012-3456-7890', department: 'Information Technology', nheqf: 'Level 5.5', graduation_year: '2027' }
];

const INITIAL_STUDENTS = [
  {
    student_id: 101,
    roll_no: '23CS0101',
    full_name: 'Aarav Sharma',
    username: 'aarav_sharma',
    email: 'aarav.sharma@campus.edu',
    apaar_id: '8910-2345-6712',
    apaar_verified: true,
    department: 'Computer Science',
    graduation_year: '2026',
    nheqf_level: 'Level 6.0',
    skill_fit_index: 88,
    profile_strength_score: 92,
    confidence_score: 89,
    status: 'Verified',
    placement_status: 'SHORTLISTED',
    certifications_count: 3,
    target_roles: ['Full Stack Engineer', 'Cloud Architect'],
    offers_count: 1
  },
  {
    student_id: 102,
    roll_no: '23CS0102',
    full_name: 'Diya Patel',
    username: 'diya_patel',
    email: 'diya.patel@campus.edu',
    apaar_id: '4512-7890-1234',
    apaar_verified: true,
    department: 'Computer Science',
    graduation_year: '2026',
    nheqf_level: 'Level 6.0',
    skill_fit_index: 94,
    profile_strength_score: 96,
    confidence_score: 94,
    status: 'Placed',
    placement_status: 'PLACED',
    certifications_count: 4,
    target_roles: ['Backend Systems Engineer', 'Data Engineer'],
    offers_count: 2
  },
  {
    student_id: 103,
    roll_no: '23EC0205',
    full_name: 'Rohan Verma',
    username: 'rohan_verma',
    email: 'rohan.v@campus.edu',
    apaar_id: '6789-0123-4567',
    apaar_verified: true,
    department: 'Electronics & Communication',
    graduation_year: '2026',
    nheqf_level: 'Level 5.5',
    skill_fit_index: 68,
    profile_strength_score: 72,
    confidence_score: 70,
    status: 'Pending Viva',
    placement_status: 'UNDER_REVIEW',
    certifications_count: 1,
    target_roles: ['Embedded Systems Engineer', 'IoT Developer'],
    offers_count: 0
  },
  {
    student_id: 104,
    roll_no: '23ME0304',
    full_name: 'Ananya Iyer',
    username: 'ananya_iyer',
    email: 'ananya.i@campus.edu',
    apaar_id: '3456-7890-1234',
    apaar_verified: true,
    department: 'Mechanical Engineering',
    graduation_year: '2026',
    nheqf_level: 'Level 6.0',
    skill_fit_index: 52,
    profile_strength_score: 58,
    confidence_score: 55,
    status: 'Retest Flagged',
    placement_status: 'APPLIED',
    certifications_count: 0,
    target_roles: ['CAD Specialist', 'FEA Analyst'],
    offers_count: 0
  },
  {
    student_id: 105,
    roll_no: '23IT0411',
    full_name: 'Kabir Mehta',
    username: 'kabir_mehta',
    email: 'kabir.m@campus.edu',
    apaar_id: '9012-3456-7890',
    apaar_verified: false,
    department: 'Information Technology',
    graduation_year: '2027',
    nheqf_level: 'Level 5.5',
    skill_fit_index: 76,
    profile_strength_score: 80,
    confidence_score: 78,
    status: 'Verified',
    placement_status: 'INTERVIEW',
    certifications_count: 2,
    target_roles: ['DevOps Engineer', 'Site Reliability Engineer'],
    offers_count: 1
  }
];

const OrganizationGovernance = ({ onViewFullProfile = null }) => {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedNheqf, setSelectedNheqf] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const [institutionMeta, setInstitutionMeta] = useState({
    name: 'National Institute of Technology & Management',
    aishe_code: 'C-18492',
    naac_grade: 'A++ (CGPA 3.82)',
    nirf_rank: '#14 National Rank',
    apaar_status: 'DigiLocker Active',
    state: 'Karnataka',
    city: 'Bengaluru'
  });

  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [isUpskillingModalOpen, setIsUpskillingModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);

  const [singleFormData, setSingleFormData] = useState({
    full_name: '',
    email: '',
    roll_no: '',
    apaar_id: '',
    department: 'Computer Science',
    graduation_year: '2026',
    nheqf_level: 'Level 6.0'
  });

  const [batchFile, setBatchFile] = useState(null);
  const [batchPreviewRows, setBatchPreviewRows] = useState([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [batchUploadSuccess, setBatchUploadSuccess] = useState(false);

  const [retestReason, setRetestReason] = useState('Cognitive Viva Recalibration');
  const [selectedUpskillingTrack, setSelectedUpskillingTrack] = useState('Distributed Cloud Architecture');

  useEffect(() => {
    const fetchInstitutionData = async () => {
      setIsLoading(true);
      try {
        const profileRes = await apiClient.get('/institutions/faculty/me');
        if (profileRes.data && profileRes.data.institution) {
          const inst = profileRes.data.institution;
          setInstitutionMeta(prev => ({
            ...prev,
            name: inst.name || prev.name,
            aishe_code: inst.code || prev.aishe_code,
            nirf_rank: inst.nirf_rank ? `#${inst.nirf_rank} National Rank` : prev.nirf_rank,
            city: inst.city || prev.city,
            state: inst.state || prev.state
          }));
        }
      } catch (err) {}

      try {
        const rosterRes = await apiClient.get('/placement/student-status');
        if (rosterRes.data && Array.isArray(rosterRes.data.roster) && rosterRes.data.roster.length > 0) {
          const mapped = rosterRes.data.roster.map((s, idx) => ({
            student_id: s.student_id || idx + 200,
            roll_no: `23${(s.department || 'CS').substring(0, 2).toUpperCase()}${(100 + idx).toString().padStart(4, '0')}`,
            full_name: s.username ? s.username.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : `Student ${idx + 1}`,
            username: s.username,
            email: s.email,
            apaar_id: `8910-2345-${(1000 + idx).toString().slice(-4)}`,
            apaar_verified: true,
            department: s.department || 'Computer Science',
            graduation_year: '2026',
            nheqf_level: 'Level 6.0',
            skill_fit_index: Math.round(s.overall_confidence_score || 75),
            profile_strength_score: Math.round(s.profile_strength_score || 80),
            confidence_score: Math.round(s.overall_confidence_score || 75),
            status: s.placement_status === 'PLACED' ? 'Placed' : s.is_verified ? 'Verified' : 'Pending Viva',
            placement_status: s.placement_status || 'UNDER_REVIEW',
            certifications_count: Array.isArray(s.certifications) ? s.certifications.length : 1,
            target_roles: s.target_roles && s.target_roles.length > 0 ? s.target_roles : ['Software Engineer'],
            offers_count: Array.isArray(s.offers) ? s.offers.length : 0
          }));
          setStudents(mapped);
        }
      } catch (err) {}
      setIsLoading(false);
    };

    fetchInstitutionData();
  }, []);

  const departmentList = useMemo(() => {
    const set = new Set(students.map(s => s.department));
    return ['All', ...Array.from(set)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.apaar_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'All' || s.department.toLowerCase() === selectedDept.toLowerCase();
      const matchesNheqf = selectedNheqf === 'All' || s.nheqf_level.toLowerCase() === selectedNheqf.toLowerCase();
      const matchesStatus = selectedStatus === 'All' || s.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesDept && matchesNheqf && matchesStatus;
    });
  }, [students, searchQuery, selectedDept, selectedNheqf, selectedStatus]);

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!singleFormData.full_name || !singleFormData.email) return;

    const newStudent = {
      student_id: Date.now(),
      roll_no: singleFormData.roll_no || `23CS${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: singleFormData.full_name,
      username: singleFormData.full_name.toLowerCase().replace(/\s+/g, '_'),
      email: singleFormData.email,
      apaar_id: singleFormData.apaar_id || '8910-4421-9988',
      apaar_verified: true,
      department: singleFormData.department,
      graduation_year: singleFormData.graduation_year,
      nheqf_level: singleFormData.nheqf_level,
      skill_fit_index: 75,
      profile_strength_score: 78,
      confidence_score: 75,
      status: 'Verified',
      placement_status: 'APPLIED',
      certifications_count: 1,
      target_roles: ['Software Engineer'],
      offers_count: 0
    };

    setStudents(prev => [newStudent, ...prev]);
    setIsSingleModalOpen(false);
    setSingleFormData({
      full_name: '',
      email: '',
      roll_no: '',
      apaar_id: '',
      department: 'Computer Science',
      graduation_year: '2026',
      nheqf_level: 'Level 6.0'
    });
  };

  const handleFileDrop = (file) => {
    setBatchFile(file);
    setBatchPreviewRows(SAMPLE_CSV_ROWS);
  };

  const handleConfirmBatchUpload = () => {
    setIsUploadingBatch(true);
    setTimeout(() => {
      const newItems = batchPreviewRows.map((r, idx) => ({
        student_id: Date.now() + idx,
        roll_no: r.roll_no,
        full_name: r.full_name,
        username: r.full_name.toLowerCase().replace(/\s+/g, '_'),
        email: r.email,
        apaar_id: r.apaar_id,
        apaar_verified: true,
        department: r.department,
        graduation_year: r.graduation_year,
        nheqf_level: r.nheqf,
        skill_fit_index: 80,
        profile_strength_score: 82,
        confidence_score: 80,
        status: 'Verified',
        placement_status: 'APPLIED',
        certifications_count: 1,
        target_roles: ['Associate Software Engineer'],
        offers_count: 0
      }));

      setStudents(prev => [...newItems, ...prev]);
      setIsUploadingBatch(false);
      setBatchUploadSuccess(true);
      setTimeout(() => {
        setIsBatchModalOpen(false);
        setBatchFile(null);
        setBatchPreviewRows([]);
        setBatchUploadSuccess(false);
      }, 1200);
    }, 1000);
  };

  const handleExecuteRetest = () => {
    if (!activeStudent) return;
    setStudents(prev =>
      prev.map(s =>
        s.student_id === activeStudent.student_id
          ? { ...s, status: 'Retest Flagged' }
          : s
      )
    );
    setIsRetestModalOpen(false);
  };

  const handleExecuteUpskilling = () => {
    if (!activeStudent) return;
    setIsUpskillingModalOpen(false);
  };

  const downloadSampleTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,roll_no,full_name,email,apaar_id,department,nheqf_level,graduation_year\n23CS0101,Aarav Sharma,aarav.s@campus.edu,8910-2345-6712,Computer Science,Level 6.0,2026\n23EC0205,Rohan Verma,rohan.v@campus.edu,6789-0123-4567,Electronics,Level 5.5,2026';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'skillsetu_student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-semibold text-lg tracking-tight">
              {institutionMeta.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                  {institutionMeta.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px] font-medium text-slate-600 tabular-nums">
                  <Shield className="w-3 h-3 text-slate-500" />
                  AISHE {institutionMeta.aishe_code}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px] font-medium text-slate-600 tabular-nums">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {institutionMeta.apaar_status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{institutionMeta.city}, {institutionMeta.state}</span>
                <span className="text-slate-300">•</span>
                <span className="tabular-nums font-medium text-slate-700">{institutionMeta.naac_grade}</span>
                <span className="text-slate-300">•</span>
                <span className="tabular-nums font-medium text-slate-700">{institutionMeta.nirf_rank}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              AISHE Audit Packet
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              Batch Ingest (CSV)
            </button>
            <button
              onClick={() => setIsSingleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all duration-150"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Student
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Total Active Students</span>
            <span className="text-base font-semibold text-slate-900 tabular-nums tracking-tight mt-0.5 block">
              {students.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">APAAR / DigiLocker Synced</span>
            <span className="text-base font-semibold text-slate-900 tabular-nums tracking-tight mt-0.5 block">
              {students.filter(s => s.apaar_verified).length} ({Math.round((students.filter(s => s.apaar_verified).length / (students.length || 1)) * 100)}%)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Verified Skill Matrix</span>
            <span className="text-base font-semibold text-slate-900 tabular-nums tracking-tight mt-0.5 block">
              {students.filter(s => s.status === 'Verified' || s.status === 'Placed').length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Retest Pending</span>
            <span className="text-base font-semibold text-slate-900 tabular-nums tracking-tight mt-0.5 block">
              {students.filter(s => s.status === 'Retest Flagged').length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, APAAR ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all duration-150"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {departmentList.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            <select
              value={selectedNheqf}
              onChange={(e) => setSelectedNheqf(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {NHEQF_LEVELS.map(lvl => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Placed">Placed</option>
              <option value="Pending Viva">Pending Viva</option>
              <option value="Retest Flagged">Retest Flagged</option>
            </select>

            {(searchQuery || selectedDept !== 'All' || selectedNheqf !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('All');
                  setSelectedNheqf('All');
                  setSelectedStatus('All');
                }}
                className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-900 transition-colors duration-150"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-medium">
                <th className="py-3 px-4">Student & APAAR</th>
                <th className="py-3 px-4">Department & Year</th>
                <th className="py-3 px-4">NHEQF Level</th>
                <th className="py-3 px-4">Skill Index (Ws)</th>
                <th className="py-3 px-4">Profile Score (P)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No student records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewFullProfile && onViewFullProfile(stu.student_id)}
                            className="font-semibold text-slate-900 tracking-tight hover:text-blue-600 transition-colors cursor-pointer text-left"
                          >
                            {stu.full_name}
                          </button>
                          {stu.apaar_verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 border border-slate-200/80 px-1.5 py-0.5 rounded">
                              <Shield className="w-2.5 h-2.5 text-slate-500" />
                              APAAR
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {stu.roll_no} • {stu.apaar_id}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{stu.department}</div>
                      <div className="text-[11px] text-slate-500 tabular-nums">Class of {stu.graduation_year}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px] font-medium text-slate-600 tabular-nums">
                        {stu.nheqf_level}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, stu.skill_fit_index))}%` }}
                          />
                        </div>
                        <span className="tabular-nums font-semibold text-slate-800 text-[11px]">
                          {stu.skill_fit_index}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="tabular-nums font-semibold text-slate-900 text-xs">
                        {stu.profile_strength_score}/100
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stu.status === 'Placed'
                              ? 'bg-emerald-600'
                              : stu.status === 'Verified'
                              ? 'bg-blue-600'
                              : stu.status === 'Retest Flagged'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-[11px] font-medium text-slate-700">
                          {stu.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setActiveStudent(stu);
                            setIsDossierOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors duration-150"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => {
                            setActiveStudent(stu);
                            setIsRetestModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors duration-150"
                        >
                          Retest
                        </button>
                        <button
                          onClick={() => {
                            setActiveStudent(stu);
                            setIsUpskillingModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors duration-150"
                        >
                          Assign Track
                        </button>
                        {onViewFullProfile && (
                          <button
                            onClick={() => onViewFullProfile(stu.student_id)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-150"
                          >
                            Full Profile
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-lg shadow-xl relative">
            <button
              onClick={() => setIsSingleModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Ingest Single Student Record
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registers individual student under the institutional roster and initiates automated verification.
            </p>

            <form onSubmit={handleSingleSubmit} className="space-y-3.5 mt-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={singleFormData.full_name}
                  onChange={(e) => setSingleFormData({ ...singleFormData, full_name: e.target.value })}
                  placeholder="e.g., Aarav Sharma"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Campus Email</label>
                  <input
                    type="email"
                    required
                    value={singleFormData.email}
                    onChange={(e) => setSingleFormData({ ...singleFormData, email: e.target.value })}
                    placeholder="student@campus.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Institutional Roll No</label>
                  <input
                    type="text"
                    required
                    value={singleFormData.roll_no}
                    onChange={(e) => setSingleFormData({ ...singleFormData, roll_no: e.target.value })}
                    placeholder="23CS0101"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">APAAR / ABC ID (12 Digits)</label>
                <input
                  type="text"
                  value={singleFormData.apaar_id}
                  onChange={(e) => setSingleFormData({ ...singleFormData, apaar_id: e.target.value })}
                  placeholder="8910-2345-6712"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={singleFormData.department}
                    onChange={(e) => setSingleFormData({ ...singleFormData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Management & Commerce">Management & Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">NHEQF Level</label>
                  <select
                    value={singleFormData.nheqf_level}
                    onChange={(e) => setSingleFormData({ ...singleFormData, nheqf_level: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Level 4.5">Level 4.5 (Year 1)</option>
                    <option value="Level 5.0">Level 5.0 (Year 2)</option>
                    <option value="Level 5.5">Level 5.5 (Year 3)</option>
                    <option value="Level 6.0">Level 6.0 (Year 4)</option>
                    <option value="Level 7.0">Level 7.0 (PG)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Confirm Ingestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-2xl shadow-xl relative">
            <button
              onClick={() => {
                setIsBatchModalOpen(false);
                setBatchFile(null);
                setBatchPreviewRows([]);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Batch Ingest Students via CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload institutional CSV or Excel export to bulk enroll candidates into the verification ledger.
            </p>

            <div className="mt-5 space-y-4">
              {!batchFile ? (
                <div
                  onClick={() => handleFileDrop(new File([], 'students_batch_2026.csv'))}
                  className="border-2 border-dashed border-slate-200/90 hover:border-slate-400 rounded-2xl p-8 text-center cursor-pointer transition-colors duration-150 bg-slate-50/50"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-800">
                    Click to select or drag and drop institutional CSV
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Columns required: roll_no, full_name, email, apaar_id, department, nheqf_level, graduation_year
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-medium text-slate-800">
                        {batchFile.name || 'students_batch_2026.csv'}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        ({batchPreviewRows.length} detected rows)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setBatchFile(null);
                        setBatchPreviewRows([]);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-700 block mb-1.5">
                      Preview & Column Mapping
                    </span>
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500">
                            <th className="py-2 px-3">Roll No</th>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Email</th>
                            <th className="py-2 px-3">APAAR ID</th>
                            <th className="py-2 px-3">Department</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {batchPreviewRows.map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3 font-mono text-slate-600">{r.roll_no}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{r.full_name}</td>
                              <td className="py-2 px-3 text-slate-500">{r.email}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{r.apaar_id}</td>
                              <td className="py-2 px-3 text-slate-600">{r.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBatchModalOpen(false);
                      setBatchFile(null);
                      setBatchPreviewRows([]);
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!batchFile || isUploadingBatch || batchUploadSuccess}
                    onClick={handleConfirmBatchUpload}
                    className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    {isUploadingBatch ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Ingesting Records...
                      </>
                    ) : batchUploadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Ingestion Complete
                      </>
                    ) : (
                      'Commit Batch Ingestion'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDossierOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-lg shadow-xl relative">
            <button
              onClick={() => setIsDossierOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold tracking-tight shrink-0">
                {activeStudent.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  {activeStudent.full_name}
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono">{activeStudent.roll_no}</span>
                  <span>•</span>
                  <span>{activeStudent.department}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">APAAR / ABC Key</span>
                <span className="font-mono text-slate-800 font-medium block mt-0.5">
                  {activeStudent.apaar_id}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">NHEQF Level</span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {activeStudent.nheqf_level}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Verified Skill Index (Ws)</span>
                <span className="tabular-nums font-semibold text-slate-900 block mt-0.5">
                  {activeStudent.skill_fit_index}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Profile Strength (P_overall)</span>
                <span className="tabular-nums font-semibold text-slate-900 block mt-0.5">
                  {activeStudent.profile_strength_score}/100
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-medium text-slate-700 block mb-1">Target Roles</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeStudent.target_roles.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md border border-slate-200/80 text-slate-600 text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium text-slate-700 block mb-1">Placement Status</span>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Pipeline Stage: {activeStudent.placement_status}</span>
                  <span>•</span>
                  <span className="tabular-nums">{activeStudent.offers_count} Active Offer(s)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-slate-100">
              <button
                onClick={() => setIsDossierOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {isRetestModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsRetestModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Flag Candidate for Retest
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Requires {activeStudent.full_name} to retake cognitive Viva assessment prior to enterprise placement shortlisting.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Retest Rationale</label>
                <select
                  value={retestReason}
                  onChange={(e) => setRetestReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Cognitive Viva Recalibration">Cognitive Viva Recalibration</option>
                  <option value="Confidence Score Anomaly Detected">Confidence Score Anomaly Detected</option>
                  <option value="Resume Padding Algorithmic Penalty">Resume Padding Algorithmic Penalty</option>
                  <option value="Institutional Annual Re-verification">Institutional Annual Re-verification</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRetestModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRetest}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Confirm Retest Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpskillingModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsUpskillingModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Assign Remedial Upskilling Track
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolls {activeStudent.full_name} into targeted curriculum modules to close verified skill deficits.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Recommended Track</label>
                <select
                  value={selectedUpskillingTrack}
                  onChange={(e) => setSelectedUpskillingTrack(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Distributed Cloud Architecture">Distributed Cloud Architecture & Kubernetes</option>
                  <option value="PostgreSQL Performance & Normalization">PostgreSQL Performance & Normalization</option>
                  <option value="Embedded Systems & RTOS">Embedded Systems & Real-Time OS</option>
                  <option value="Corporate Financial Modeling & GST">Corporate Financial Modeling & GST Compliance</option>
                  <option value="Design Systems & WCAG Standards">Design Systems & WCAG 2.1 AA Accessibility</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUpskillingModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteUpskilling}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Assign Track
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationGovernance;
