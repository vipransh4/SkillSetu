import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import i1 from '../../assets/1.png';
import i2 from '../../assets/2.png';
import i3 from '../../assets/3.png';
import i4 from '../../assets/4.png';

const defaultSlides = [
  { id: 1, image: i1, label: 'Get Started', route: 'signin' },
  { id: 3, image: i3, label: 'Start Learning', route: 'learning' },
  { id: 2, image: i2, label: 'View Opportunities', route: 'opportunities' },
  { id: 4, image: i4, label: 'Explore Assessment', route: 'assessment' },
];

const Home = ({ slides = defaultSlides, interval = 6000, onRouteChange }) => {
  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = ((page % slides.length) + slides.length) % slides.length;
  const currentSlide = slides[imageIndex];

  const paginate = (newDirection) => {
    setPage(([p]) => [p + newDirection, newDirection]);
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), interval);
    return () => clearInterval(timer);
  }, [interval]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-900">
      <div className="relative w-full h-full flex-1 overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.label}
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-16 left-8 sm:left-16 z-20">
              <button
                onClick={() => onRouteChange(currentSlide.route)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer group"
              >
                <span>{currentSlide.label}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => paginate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all backdrop-blur-sm cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => paginate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all backdrop-blur-sm cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setPage([index, index > imageIndex ? 1 : -1])}
              className={`h-3 rounded-full transition-all cursor-pointer ${index === imageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75 w-3'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;