import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';

const initialJobs = [
  {
    id: 'job-1',
    role: 'Backend Engineering Intern',
    typeDetails: '6-month Internship · posted Sep 1',
    applicants: 214,
    shortlisted: 18,
    status: 'Live',
  },
  {
    id: 'job-2',
    role: 'Product Design Intern',
    typeDetails: '3-month Internship · posted Aug 27',
    applicants: 167,
    shortlisted: 9,
    status: 'Live',
  },
  {
    id: 'job-3',
    role: 'Data Analyst Intern',
    typeDetails: '6-month Internship · posted Aug 10',
    applicants: 341,
    shortlisted: 24,
    status: 'Closed',
  },
];

const Industry = ({onRouteChange}) => {
  const [jobs, setJobs] = useState(initialJobs);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    stipend: '',
    openings: '4',
    skills: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newJob = {
      id: `job-${Date.now()}`,
      role: formData.title,
      typeDetails: `${formData.type} · posted Just now`,
      applicants: 0,
      shortlisted: 0,
      status: 'Live',
    };

    setJobs((prev) => [newJob, ...prev]);

    // Reset Form
    setFormData({
      title: '',
      type: '6-month Internship',
      location: 'Hybrid · Bengaluru',
      stipend: '',
      openings: '4',
      skills: '',
      description: '',
    });
  };

  return (
    <div className="w-full max-w-7xl mt-20 mx-auto p-4 sm:p-6 min-h-screen">
      <Navbar onRouteChange={onRouteChange}/>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Job Postings Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Job Postings</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage internships and full-time roles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-137.5">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-4">Applicants</th>
                  <th className="py-3.5 px-4">Shortlisted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Role Details */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{job.role}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{job.typeDetails}</p>
                    </td>

                    {/* Applicants */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {job.applicants}
                    </td>

                    {/* Shortlisted */}
                    <td className="py-4 px-4 text-slate-600">
                      {job.shortlisted}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Live'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {job.status}
                      </span>
                    </td>

                    {/* Pipeline Action */}
                    <td className="py-4 px-6 text-right">
                      <button className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer">
                        Pipeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Post a New Internship Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Post a New Internship</h2>
            <p className="text-xs text-slate-400 mt-0.5">Reach 8,400+ verified students</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Role Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Role title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. DevOps Engineering Intern"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
                required
              />
            </div>

            {/* Type & Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Type</label>
              <input
                type="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="e.g. Full-Time"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
                required
              />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Location</label>
                <input
                  type="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
                  required
                />
                
              </div>
            </div>

            {/* Stipend & Openings Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Stipend / Salary</label>
                <input
                  type="text"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="e.g. ₹35,000/mo"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Openings</label>
                <input
                  type="number"
                  name="openings"
                  value={formData.openings}
                  onChange={handleChange}
                  placeholder="4"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
                  required
                />
              </div>
            </div>

            {/* Required Skills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Required skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Docker, CI/CD, Linux (comma separated)"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="What will the intern work on?"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all resize-y"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Publish Posting
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Industry;