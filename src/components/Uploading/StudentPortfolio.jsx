import React, { useState } from 'react';
import { Plus, Code2, ExternalLink, CheckCircle2, Trash2, Sparkles } from 'lucide-react';
import Navbar from '../Navbar/Navbar';

// Custom inline SVG for GitHub Icon
const GithubIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const initialProjects = [
  {
    id: 'proj-1',
    title: 'EduSpark Interactive Analytics',
    techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
    githubUrl: 'https://github.com/user/eduspark',
    liveUrl: 'https://eduspark-demo.com',
    description: 'Real-time analytics dashboard tracking student engagement metrics across live interactive sessions.',
    status: 'Verified',
  },
  {
    id: 'proj-2',
    title: 'Hospital Patient Queue Scheduler',
    techStack: ['React', 'SQL', 'Express'],
    githubUrl: 'https://github.com/user/medi-queue',
    liveUrl: '',
    description: 'Agile booking algorithm allocating patient queues across regional clinics in real-time.',
    status: 'In Review',
  },
];

const StudentPortfolio = ({onRouteChange}) => {
  const [projects, setProjects] = useState(initialProjects);
  const [skillsList, setSkillsList] = useState(['React', 'JavaScript', 'Node.js', 'CSS', 'Git', 'SQL']);
  const [newSkill, setNewSkill] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    description: '',
  });

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      title: formData.title,
      techStack: formData.techStack ? formData.techStack.split(',').map((s) => s.trim()) : ['React'],
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      description: formData.description,
      status: 'In Review',
    };

    setProjects([newProject, ...projects]);

    setFormData({
      title: '',
      techStack: '',
      githubUrl: '',
      liveUrl: '',
      description: '',
    });
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <>
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 mt-20 min-h-screen">
    <Navbar onRouteChange={onRouteChange}/>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Manage Skills & Portfolio Projects */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Skills Management Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verified Technical Skills</h2>
                <p className="text-xs text-slate-400 mt-0.5">Skills listed here increase your job match scores</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full flex items-center gap-1 border border-emerald-100">
                <CheckCircle2 size={12} /> {skillsList.length} Skills
              </span>
            </div>

            {/* Add Skill Input */}
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill (e.g. TypeScript, Docker)..."
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} /> Add Skill
              </button>
            </form>

            {/* Skill Badges */}
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span
                key={index}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-full flex items-center gap-2 group hover:bg-slate-200 transition-colors"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Project Showcase List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Featured Projects</h2>
                <p className="text-xs text-slate-400 mt-0.5">Projects displayed on your digital credential card</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full border border-blue-100">
                {projects.length} Projects
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {projects.map((proj) => (
                <div
                key={proj.id}
                className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Code2 size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          proj.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                        >
                          <GithubIcon size={16} />
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-0.5 text-[11px] font-medium bg-white text-slate-600 rounded-md border border-slate-200/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Add New Project Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Add New Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">Submit a personal or hackathon project for faculty/industry review</p>
          </div>

          <form onSubmit={handleProjectSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleProjectChange}
                placeholder="e.g. TravelTrek Web Platform"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                required
                />
            </div>

            {/* Tech Stack */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Technologies Used</label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleProjectChange}
                placeholder="e.g. React, Redux, Express, MongoDB (comma separated)"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            {/* GitHub & Live URL Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">GitHub Repository</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleProjectChange}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                  />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Live Demo URL</label>
                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleProjectChange}
                  placeholder="https://my-app.render.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                  />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Project Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleProjectChange}
                placeholder="What problem does this project solve? Mention key engineering achievements."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all resize-y"
                ></textarea>
            </div>

            {/* Verification Tip Box */}
            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-start gap-2.5">
              <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Projects with a working live demo and clear GitHub documentation receive priority verification from partner companies.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-1 w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
              <Plus size={16} />
              <span>Add to Portfolio</span>
            </button>
          </form>
        </div>

      </div>
    </div>
    </>
  );
};

export default StudentPortfolio;