import React, { useState } from 'react';
import {
  Video,
  Upload,
  Play,
  Trash2,
  CheckCircle2,
  Plus,
  Eye,
  Clock,
  BookOpen,
  ExternalLink,
  X
} from 'lucide-react';

const initialLectures = [
  {
    id: 'lec-1',
    title: 'Advanced Distributed Systems & Fault Tolerance',
    courseCode: 'CS701',
    courseName: 'Cloud & Distributed Computing',
    instructor: 'Dr. Aarav Sharma',
    duration: '45 mins',
    views: 342,
    status: 'Published',
    uploadDate: 'Sep 10, 2026',
    format: 'Video (MP4)',
    url: 'https://cdn.example.edu/lectures/cs701-distributed.mp4',
    synopsis: 'Covers Paxos consensus, Raft protocol, Byzantine fault models, and vector clock synchronizations.'
  },
  {
    id: 'lec-2',
    title: 'PostgreSQL Query Planning & B-Tree Index Tuning',
    courseCode: 'CS502',
    courseName: 'Database Engineering',
    instructor: 'Prof. Neha Gupta',
    duration: '60 mins',
    views: 512,
    status: 'Published',
    uploadDate: 'Sep 05, 2026',
    format: 'Video (MP4)',
    url: 'https://cdn.example.edu/lectures/cs502-btree.mp4',
    synopsis: 'Detailed deep-dive into EXPLAIN ANALYZE, cost-based optimizer, sequential scans vs index scans.'
  },
  {
    id: 'lec-3',
    title: 'Microservices Communication & gRPC Architectures',
    courseCode: 'CS603',
    courseName: 'Enterprise Software Architecture',
    instructor: 'Dr. Marcus Vance',
    duration: '50 mins',
    views: 189,
    status: 'Draft',
    uploadDate: 'Aug 28, 2026',
    format: 'Link',
    url: 'https://youtu.be/example-grpc',
    synopsis: 'Protobuf serialization, HTTP/2 multiplexing, bidirectional streaming, and latency benchmarks.'
  }
];

const CourseLectures = () => {
  const [lectures, setLectures] = useState(initialLectures);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeLecturePreview, setActiveLecturePreview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courseCode: '',
    courseName: '',
    instructor: '',
    duration: '',
    videoUrl: '',
    synopsis: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newResource = {
      id: `lec-${Date.now()}`,
      title: formData.title.trim(),
      courseCode: formData.courseCode.trim() || 'CS101',
      courseName: formData.courseName.trim() || 'Core Engineering',
      instructor: formData.instructor.trim() || 'Faculty Instructor',
      duration: formData.duration.trim() || '45 mins',
      views: 0,
      status: 'Published',
      uploadDate: 'Today',
      format: selectedFile ? selectedFile.name.split('.').pop().toUpperCase() : 'Stream',
      url: formData.videoUrl.trim() || '#',
      synopsis: formData.synopsis.trim() || 'Curriculum resource for semester syllabus enrichment.'
    };

    setLectures((prev) => [newResource, ...prev]);
    setFormData({
      title: '',
      courseCode: '',
      courseName: '',
      instructor: '',
      duration: '',
      videoUrl: '',
      synopsis: ''
    });
    setSelectedFile(null);
    setIsDrawerOpen(false);
  };

  const handleDelete = (id) => {
    setLectures((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className="space-y-6 text-slate-800"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Inter, sans-serif'
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Course Lectures & Learning Resources
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dedicated instructional media repository, lecture recordings, and syllabus attachments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Upload New Resource</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12 bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                Published Resources Directory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                High-density registry of active course videos and syllabi.
              </p>
            </div>
            <span className="bg-transparent border border-slate-200/80 text-slate-600 text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md tabular-nums">
              {lectures.length} Total Resources
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-6">Resource Title & Course</th>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Telemetry Views</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {lectures.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-xl shrink-0 mt-0.5">
                          <Video size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 leading-snug truncate max-w-sm">
                            {lec.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lec.courseName} · {lec.uploadDate}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {lec.courseCode}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {lec.instructor}
                    </td>

                    <td className="py-3.5 px-4 tabular-nums text-slate-600 font-medium">
                      {lec.duration}
                    </td>

                    <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-900">
                      {lec.views}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs font-medium text-slate-700">
                        <span
                          className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
                            lec.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        />
                        {lec.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveLecturePreview(lec)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                          title="Preview Resource Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(lec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto border-l border-slate-200 shadow-2xl space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Upload Course Resource
                </h3>
                <p className="text-xs text-slate-500">
                  Provision new instructional recordings and syllabus attachments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 block">Lecture / Topic Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Distributed Consensus Algorithms"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 block">Course Code</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    placeholder="e.g. CS701"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 block">Course Name</label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700 block">Lead Instructor</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Aarav Sharma"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 block">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 50 mins"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 block">Media File Dropzone</label>
                <div className="relative border border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50/80 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="video/*,.pdf,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-full">
                      <Upload size={16} />
                    </div>
                    {selectedFile ? (
                      <p className="font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={13} /> {selectedFile.name}
                      </p>
                    ) : (
                      <>
                        <p className="font-medium text-slate-700">Click or drag instructional stream here</p>
                        <p className="text-[11px] text-slate-400">MP4, MKV, or presentation deck up to 2GB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 block">External Video URL</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 block">Syllabus Synopsis & Objectives</label>
                <textarea
                  rows={3}
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleChange}
                  placeholder="Brief summary of pedagogical concepts covered..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeLecturePreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-2xl max-w-lg w-full p-6 relative">
            <button
              type="button"
              onClick={() => setActiveLecturePreview(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Video size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {activeLecturePreview.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeLecturePreview.courseCode} · {activeLecturePreview.courseName}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Instructor:</span>
                  <span className="font-semibold text-slate-900">{activeLecturePreview.instructor}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Duration:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{activeLecturePreview.duration}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Views:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{activeLecturePreview.views}</span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-1">Syllabus Synopsis</p>
                <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  {activeLecturePreview.synopsis}
                </p>
              </div>

              {activeLecturePreview.url && (
                <div className="pt-2">
                  <a
                    href={activeLecturePreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Launch Resource Stream</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLectures;
