import React, { useState } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  Award, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

const mockCourses = [
  {
    id: 1,
    title: "Full-Stack Web Development with React & Node.js",
    category: "Development",
    instructor: "Dr. Ananya Sharma",
    level: "Intermediate",
    duration: "12 Hours",
    modules: 8,
    progress: 65,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    description: "Master modern web architectures, state management with Redux, and RESTful API design."
  },
  {
    id: 2,
    title: "Data Structures & Algorithms Mastery",
    category: "Computer Science",
    instructor: "Prof. Rajesh Verma",
    level: "Beginner to Advanced",
    duration: "20 Hours",
    modules: 14,
    progress: 30,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516116211223-4c7142b2933c?w=600&auto=format&fit=crop&q=80",
    description: "Ace technical coding interviews with deep dives into trees, dynamic programming, and graphs."
  },
  {
    id: 3,
    title: "Applied Machine Learning & AI Fundamentals",
    category: "Data Science",
    instructor: "Dr. Vikram Sethi",
    level: "Intermediate",
    duration: "16 Hours",
    modules: 10,
    progress: 0,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80",
    description: "Learn Python for ML, regression models, neural networks, and computer vision basics."
  },
  {
    id: 4,
    title: "Industry Soft Skills & Interview Preparation",
    category: "Career",
    instructor: "Neha Kapoor (HR Lead)",
    level: "All Levels",
    duration: "6 Hours",
    modules: 5,
    progress: 100,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    description: "Build an ATS-ready resume, practice mock behavioral interviews, and elevate workplace communication."
  }
];

const categories = ["All", "Development", "Computer Science", "Data Science", "Career"];

const Learning = ({ onRouteChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = mockCourses.filter(course => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles size={14} /> Skill Up for Industry
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Curated Learning Pathways
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Access faculty-led lectures, industry certifications, and hands-on technical tracks designed to bridge the gap between classroom theory and real-world tech stacks.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-xs text-slate-400">Skill Tracks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">120+</p>
              <p className="text-xs text-slate-400">Faculty Lectures</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">85%</p>
              <p className="text-xs text-slate-400">Avg. Completion</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Verified</p>
              <p className="text-xs text-slate-400">Certificates</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Course Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {course.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={12} /> {course.duration}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <GraduationCap size={14} className="text-blue-600" /> {course.instructor}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Progress Indicator */}
                  {course.progress > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">Course Progress</span>
                        <span className="text-blue-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {course.modules} Modules
                </span>
                <button 
                  onClick={() => onRouteChange && onRouteChange('opportunities')}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:gap-2 transition-all cursor-pointer"
                >
                  <span>{course.progress === 100 ? "Review Course" : course.progress > 0 ? "Continue" : "Start Track"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Learning;