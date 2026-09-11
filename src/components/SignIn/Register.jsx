import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Calendar, Eye, EyeOff, GraduationCap, BookOpen, Briefcase, Loader2, Mail, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import RightHeroPanel from './RightHeroPanel';
import CollegeAutocomplete from './CollegeAutocomplete';
import authService from '../../api/auth';

const ACADEMIC_DOMAIN_MAP = {
  'chitkara.edu.in': 'Chitkara University',
  'chitkara.edu': 'Chitkara University',
  'iitb.ac.in': 'Indian Institute of Technology Bombay (IIT Bombay)',
  'iitd.ac.in': 'Indian Institute of Technology Delhi (IIT Delhi)',
  'iitm.ac.in': 'Indian Institute of Technology Madras (IIT Madras)',
  'iitk.ac.in': 'Indian Institute of Technology Kanpur (IIT Kanpur)',
  'iitkgp.ac.in': 'Indian Institute of Technology Kharagpur (IIT Kharagpur)',
  'iitr.ac.in': 'Indian Institute of Technology Roorkee (IIT Roorkee)',
  'iitg.ac.in': 'Indian Institute of Technology Guwahati (IIT Guwahati)',
  'iith.ac.in': 'Indian Institute of Technology Hyderabad (IIT Hyderabad)',
  'iitbhu.ac.in': 'Indian Institute of Technology (BHU) Varanasi',
  'iitism.ac.in': 'Indian Institute of Technology (ISM) Dhanbad',
  'iitbbs.ac.in': 'Indian Institute of Technology Bhubaneswar',
  'iitgn.ac.in': 'Indian Institute of Technology Gandhinagar',
  'iitj.ac.in': 'Indian Institute of Technology Jodhpur',
  'iitp.ac.in': 'Indian Institute of Technology Patna',
  'iitrpr.ac.in': 'Indian Institute of Technology Ropar',
  'iitmandi.ac.in': 'Indian Institute of Technology Mandi',
  'iiti.ac.in': 'Indian Institute of Technology Indore',
  'iitpkd.ac.in': 'Indian Institute of Technology Palakkad',
  'iittp.ac.in': 'Indian Institute of Technology Tirupati',
  'iitjammu.ac.in': 'Indian Institute of Technology Jammu',
  'iitdh.ac.in': 'Indian Institute of Technology Dharwad',
  'iitgoa.ac.in': 'Indian Institute of Technology Goa',
  'iitbhilai.ac.in': 'Indian Institute of Technology Bhilai',
  'nitk.edu.in': 'National Institute of Technology Karnataka, Surathkal',
  'nitk.ac.in': 'National Institute of Technology Karnataka, Surathkal',
  'nitt.edu': 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
  'nitw.ac.in': 'National Institute of Technology Warangal (NIT Warangal)',
  'nitrkl.ac.in': 'National Institute of Technology Rourkela',
  'vnit.ac.in': 'Visvesvaraya National Institute of Technology, Nagpur',
  'mnit.ac.in': 'Malaviya National Institute of Technology, Jaipur',
  'mnnit.ac.in': 'Motilal Nehru National Institute of Technology Allahabad',
  'manit.ac.in': 'Maulana Azad National Institute of Technology Bhopal',
  'svnit.ac.in': 'Sardar Vallabhbhai National Institute of Technology Surat',
  'nitc.ac.in': 'National Institute of Technology Calicut',
  'nitdgp.ac.in': 'National Institute of Technology Durgapur',
  'nitkkr.ac.in': 'National Institute of Technology Kurukshetra',
  'nits.ac.in': 'National Institute of Technology Silchar',
  'nitjsr.ac.in': 'National Institute of Technology Jamshedpur',
  'nitp.ac.in': 'National Institute of Technology Patna',
  'nitrr.ac.in': 'National Institute of Technology Raipur',
  'nitsri.ac.in': 'National Institute of Technology Srinagar',
  'nitj.ac.in': 'Dr. B R Ambedkar National Institute of Technology Jalandhar',
  'iiitd.ac.in': 'Indraprastha Institute of Information Technology Delhi (IIIT-Delhi)',
  'iiita.ac.in': 'Indian Institute of Information Technology, Allahabad',
  'iiit.ac.in': 'International Institute of Information Technology, Hyderabad (IIIT-H)',
  'iiitb.ac.in': 'International Institute of Information Technology Bangalore (IIIT-B)',
  'iisc.ac.in': 'Indian Institute of Science (IISc), Bangalore',
  'iisc.ernet.in': 'Indian Institute of Science (IISc), Bangalore',
  'bits-pilani.ac.in': 'Birla Institute of Technology and Science, Pilani (BITS Pilani)',
  'thapar.edu': 'Thapar Institute of Engineering and Technology, Patiala',
  'dtu.ac.in': 'Delhi Technological University (DTU)',
  'nsut.ac.in': 'Netaji Subhas University of Technology (NSUT)',
  'du.ac.in': 'University of Delhi (Delhi University)',
  'jnu.ac.in': 'Jawaharlal Nehru University (JNU), New Delhi',
  'bhu.ac.in': 'Banaras Hindu University (BHU), Varanasi',
  'amu.ac.in': 'Aligarh Muslim University (AMU)',
  'vit.ac.in': 'Vellore Institute of Technology (VIT), Vellore',
  'manipal.edu': 'Manipal Academy of Higher Education (MAHE)',
  'srmist.edu.in': 'SRM Institute of Science and Technology, Chennai',
  'amity.edu': 'Amity University',
  'cuchd.in': 'Chandigarh University',
  'lpu.in': 'Lovely Professional University (LPU)',
  'lpu.co.in': 'Lovely Professional University (LPU)',
  'nift.ac.in': 'National Institute of Fashion Technology (NIFT)',
  'iima.ac.in': 'Indian Institute of Management Ahmedabad (IIM-A)',
  'iimb.ac.in': 'Indian Institute of Management Bangalore (IIM-B)',
  'iimc.ac.in': 'Indian Institute of Management Calcutta (IIM-C)',
  'iiml.ac.in': 'Indian Institute of Management Lucknow (IIM-L)',
  'iimk.ac.in': 'Indian Institute of Management Kozhikode (IIM-K)',
  'iimi.ac.in': 'Indian Institute of Management Indore (IIM-I)',
};

const Register = ({ onRouteChange, onLoginSuccess }) => {
  const [profession, setProfession] = useState('student');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    dob: '',
    college: '',
    year: '',
    department: '',
    qualification: '',
    company: '',
    companytype: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastDetectedDomain = useRef('');

  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) return;
    const parts = formData.email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return;
    const domain = parts[1];

    if (domain === lastDetectedDomain.current) return;

    if (ACADEMIC_DOMAIN_MAP[domain]) {
      lastDetectedDomain.current = domain;
      setFormData((prev) => ({ ...prev, college: ACADEMIC_DOMAIN_MAP[domain] }));
    }
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500 text-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500 text-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500 text-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = {};

    // Validate required fields
    if (!formData.firstname.trim()) newErrors.firstname = 'This field is required';
    if (!formData.lastname.trim()) newErrors.lastname = 'This field is required';
    if (!formData.username.trim()) newErrors.username = 'This field is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'This field is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'This field is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.dob.trim()) newErrors.dob = 'This field is required';

    // Profession specific validations
    if (profession === 'student') {
      if (!formData.college.trim()) newErrors.college = 'This field is required';
      if (!formData.year.trim()) newErrors.year = 'This field is required';
    } else if (profession === 'academician') {
      if (!formData.department.trim()) newErrors.department = 'This field is required';
      if (!formData.qualification.trim()) newErrors.qualification = 'This field is required';
    } else if (profession === 'industry') {
      if (!formData.company.trim()) newErrors.company = 'This field is required';
      if (!formData.companytype.trim()) newErrors.companytype = 'This field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        profession: profession,
        dob: formData.dob,
        college: formData.college,
        year: formData.year,
        department: formData.department,
        qualification: formData.qualification,
        company: formData.company,
        companytype: formData.companytype,
      });

      // Pass user and role data to App.js to update state and show dynamic Navbar options
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        onRouteChange('home');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Unable to connect to Skill Setu backend server. Please verify Django is running.'
          : 'Registration failed. Please review your details and try again.');
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* LEFT: Hero Image Panel */}
      <RightHeroPanel
        title="Your Journey Starts"
        titleHighlight="Here"
        subtitle="Connect with mentors, discover internships, and build your career path."
        stats={[
          { number: '95%', label: 'Placement Rate' },
          { number: '1200+', label: 'Mentors' },
          { number: '50+', label: 'Skill Tracks' },
        ]}
      />

      {/* RIGHT: Form Panel */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-12 lg:w-1/2 xl:p-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-6 my-auto">
          {/* Logo */}
          <Logo />

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create Your Account
            </h1>
            <p className="text-sm text-slate-500">
              Join Skill Setu and start bridging the gap
            </p>
          </div>

          {/* Error Banner */}
          {generalError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  First Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="First name"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      errors.firstname
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                </div>
                {errors.firstname && <p className="text-xs font-medium text-red-500">{errors.firstname}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Last Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Last name"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      errors.lastname
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                </div>
                {errors.lastname && <p className="text-xs font-medium text-red-500">{errors.lastname}</p>}
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                    errors.username
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs font-medium text-red-500">{errors.username}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                    errors.email
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
            </div>


            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                    errors.password
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength Indicator */}
              {formData.password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          bar <= strength.score ? strength.color.split(' ')[0] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${strength.color.split(' ')[1]}`}>
                    {strength.label}
                  </span>
                </div>
              )}
              {errors.password && <p className="text-xs font-medium text-red-500">{errors.password}</p>}
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition-all ${
                    errors.dob
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                  }`}
                />
              </div>
              {errors.dob && <p className="text-xs font-medium text-red-500">{errors.dob}</p>}
            </div>

            {/* Profession Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Profession
              </label>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-200/70 p-1">
                <button
                  type="button"
                  onClick={() => setProfession('student')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                    profession === 'student'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setProfession('academician')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                    profession === 'academician'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Academician
                </button>
                <button
                  type="button"
                  onClick={() => setProfession('industry')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                    profession === 'industry'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Industry
                </button>
              </div>
            </div>

            {/* Dynamic Role Fields */}
            {profession === 'student' && (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
                <CollegeAutocomplete
                  value={formData.college}
                  onChange={(collegeName) => {
                    setFormData((prev) => ({ ...prev, college: collegeName }));
                    if (errors.college) setErrors((prev) => ({ ...prev, college: '' }));
                  }}
                  error={errors.college}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm font-medium text-slate-800 outline-none transition-all ${
                      errors.year
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="pg">Post-Graduate</option>
                  </select>
                  {errors.year && <p className="text-xs font-medium text-red-500">{errors.year}</p>}
                </div>
              </div>
            )}

            {profession === 'academician' && (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      errors.department
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                  {errors.department && <p className="text-xs font-medium text-red-500">{errors.department}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Qualification
                  </label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm font-medium text-slate-800 outline-none transition-all ${
                      errors.qualification
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  >
                    <option value="">Select qualification</option>
                    <option value="phd">PhD</option>
                    <option value="mtech">M.Tech</option>
                    <option value="msc">M.Sc</option>
                    <option value="mba">MBA</option>
                  </select>
                  {errors.qualification && <p className="text-xs font-medium text-red-500">{errors.qualification}</p>}
                </div>
              </div>
            )}

            {profession === 'industry' && (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Infosys, TCS"
                    className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                      errors.company
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  />
                  {errors.company && <p className="text-xs font-medium text-red-500">{errors.company}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Company Type
                  </label>
                  <select
                    name="companytype"
                    value={formData.companytype}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm font-medium text-slate-800 outline-none transition-all ${
                      errors.companytype
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                    }`}
                  >
                    <option value="">Select type</option>
                    <option value="startup">Startup</option>
                    <option value="mnc">MNC</option>
                    <option value="sme">SME</option>
                    <option value="government">Government</option>
                  </select>
                  {errors.companytype && <p className="text-xs font-medium text-red-500">{errors.companytype}</p>}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer mt-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="text-center text-sm font-medium text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onRouteChange('signin')}
              className="font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;