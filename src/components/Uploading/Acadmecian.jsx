import React, { useState } from 'react';
import { Upload, Video, FileText, Play, CheckCircle2, Clock, Trash2, Eye } from 'lucide-react';

const initialLectures = [
  {
    id: 'lec-1',
    title: 'Advanced Web Architecture & Micro-frontends',
    course: 'CSE302 · Web Engineering',
    duration: '45 mins',
    views: 342,
    status: 'Published',
    uploadDate: 'Sep 10, 2026',
    format: 'Video (MP4)',
  },
  {
    id: 'lec-2',
    title: 'Database Normalization & Indexing Performance',
    course: 'CSE201 · DBMS',
    duration: '60 mins',
    views: 512,
    status: 'Published',
    uploadDate: 'Sep 05, 2026',
    format: 'Video (MP4)',
  },
  {
    id: 'lec-3',
    title: 'Introduction to Distributed Systems & Consensus Protocols',
    course: 'CSE405 · Cloud Computing',
    duration: '50 mins',
    views: 189,
    status: 'Draft',
    uploadDate: 'Aug 28, 2026',
    format: 'Video (MKV)',
  },
];

const Acadmecian = ({onRouteChange}) => {
  const [lectures, setLectures] = useState(initialLectures);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    courseCode: 'CSE302 · Web Engineering',
    module: 'Module 3: Scalable Frontend Architecture',
    duration: '',
    videoUrl: '',
    description: '',
    isPublic: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newLecture = {
      id: `lec-${Date.now()}`,
      title: formData.title,
      course: formData.courseCode,
      duration: formData.duration || '40 mins',
      views: 0,
      status: 'Published',
      uploadDate: 'Just now',
      format: selectedFile ? selectedFile.name.split('.').pop().toUpperCase() : 'Video Link',
    };

    setLectures((prev) => [newLecture, ...prev]);

    // Reset Form
    setFormData({
      title: '',
      courseName: '',
      teacherName: '',
      duration: '',
      videoUrl: '',
      description: '',
      isPublic: true,
    });
    setSelectedFile(null);
  };

  const handleDelete = (id) => {
    setLectures((prev) => prev.filter((lec) => lec.id !== id));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Uploaded Lectures Management */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Course Lectures</h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage recorded sessions, slides, and study modules</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full border border-blue-100">
              {lectures.length} Total Uploads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-145">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Lecture Title</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {lectures.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title & Course */}
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5 shrink-0">
                          <Video size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug line-clamp-1">{lec.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{lec.course} · {lec.uploadDate}</p>
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={14} className="text-slate-400" />
                        <span>{lec.duration}</span>
                      </div>
                    </td>

                    {/* Student Views */}
                    <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Eye size={14} className="text-slate-400" />
                        <span>{lec.views}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          lec.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                        }`}>
                        {lec.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer">
                          <Play size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lec.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Upload Lecture Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Upload New Lecture</h2>
            <p className="text-xs text-slate-400 mt-0.5">Publish video lectures and curriculum resources for enrolled students</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Lecture Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Lecture Topic / Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Distributed Consensus & Raft Protocol"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                required
                />
            </div>

            {/* Course & Module Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Course</label>
              <input
                type="text"
                name="Course"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g. Python"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                required
              />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Teacher Name</label>
              <input
                type="text"
                name="TeacherName"
                value={formData.teacherName}
                onChange={handleChange}
                placeholder="e.g. Andrei Neagoi"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                required
              />
              </div>
            </div>

            {/* File Drag & Drop Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Video File (MP4, MKV, WEBM)</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50/80 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
                    <Upload size={20} />
                  </div>
                  {selectedFile ? (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> {selectedFile.name}
                    </p>
                  ) : (
                      <>
                      <p className="text-xs font-semibold text-slate-700">Click to upload or drag video here</p>
                      <p className="text-[11px] text-slate-400">Up to 2GB per video file</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* External Video URL & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Or External Link (YouTube / Drive)</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                  />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Est. Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 45 mins"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
                  />
              </div>
            </div>

            {/* Description & Key Points */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Lecture Summary & Notes</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="What topics are covered in this session? Mention any required prerequisites."
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all resize-y"
                ></textarea>
            </div>

            {/* Access Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Public for all campus students</p>
                <p className="text-[11px] text-slate-400">Allow non-enrolled students to preview this lecture</p>
              </div>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
              <Upload size={16} />
              <span>Publish Lecture</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Acadmecian;