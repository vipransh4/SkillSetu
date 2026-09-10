import React, { useState } from 'react';
import { User, Lock, Calendar, Eye, EyeOff, GraduationCap, BookOpen, Briefcase, Building, Loader2 } from 'lucide-react';
import Logo from './Logo';
import RightHeroPanel from './RightHeroPanel';

const Register = ({ onRouteChange, onLoginSuccess }) => {
  const [profession, setProfession] = useState('student');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Password strength calculation
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate required fields
    if (!formData.firstname.trim()) newErrors.firstname = 'This field is required';
    if (!formData.lastname.trim()) newErrors.lastname = 'This field is required';
    if (!formData.username.trim()) newErrors.username = 'This field is required';
    
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

    setTimeout(() => {
      setIsLoading(false);
      
      // Pass user and role data to App.js to update state and show dynamic Navbar options
      if (onLoginSuccess) {
        onLoginSuccess({
          username: formData.username,
          firstname: formData.firstname,
          lastname: formData.lastname,
          role: profession, // 'student' | 'academician' | 'industry'
        });
      } else {
        onRouteChange('home');
      }
    }, 1200);
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
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    College / University
                  </label>
                  <div className="relative flex items-center">
                    <Building className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="e.g. Chitkara University"
                      className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all ${
                        errors.college
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                          : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                      }`}
                    />
                  </div>
                  {errors.college && <p className="text-xs font-medium text-red-500">{errors.college}</p>}
                </div>
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