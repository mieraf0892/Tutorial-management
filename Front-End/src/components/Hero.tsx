import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, ChevronLeft, ChevronRight, Pause, Play as PlayIcon } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import { apiClient } from "@/lib/api";

// Types
interface HomepageStats {
  total_students: number;
  total_courses: number;
  total_tutorials: number;
}

interface HeroSlideStats {
  students: string;
  tutorials: string;
  rating: string;
}

interface HeroSlide {
  id: number;
  image: string;
  tagline: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
}

type Direction = -1 | 0 | 1;

// Animation Variants (moved outside component for better performance)
const slideVariants = {
  enter: (direction: Direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const contentVariants = {
  enter: {
    opacity: 0,
    y: 30,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -30,
  },
};

// Data
const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: hero1,
    tagline: "🚀 Master Web Development",
    title: "Build Modern",
    highlight: "Web Apps",
    subtitle: "From Scratch",
    description: "Learn HTML, CSS, JavaScript, React, and more with hands-on projects and expert guidance.",
  },
  {
    id: 2,
    image: hero2,
    tagline: "🎨 Design Excellence",
    title: "Create Stunning",
    highlight: "UI/UX",
    subtitle: "Designs",
    description: "Master Figma, design systems, and user experience principles to create beautiful interfaces.",
  },
  {
    id: 3,
    image: hero3,
    tagline: "📊 Data Mastery",
    title: "Unlock the Power of",
    highlight: "Data Analytics",
    subtitle: "",
    description: "Transform raw data into actionable insights with Python, SQL, and visualization tools.",
  },
  {
    id: 4,
    image: hero4,
    tagline: "📱 Mobile First",
    title: "Build Native",
    highlight: "Mobile Apps",
    subtitle: "That Shine",
    description: "Create cross-platform mobile applications with React Native and Flutter.",
  },
];

// Progress Bar Component
const ProgressBar = ({ currentSlide, isPaused }: { currentSlide: number; isPaused: boolean }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 100 / 60; // 6000ms / 60 intervals = 100ms per interval
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSlide, isPaused]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10 z-20 overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Slide Indicator Component
const SlideIndicator = ({ 
  slides, 
  currentSlide, 
  goToSlide 
}: { 
  slides: HeroSlide[]; 
  currentSlide: number; 
  goToSlide: (index: number) => void;
}) => (
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
    {slides.map((_, index) => (
      <button
        key={index}
        onClick={() => goToSlide(index)}
        aria-label={`Go to slide ${index + 1}`}
        className="group relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-full"
      >
        <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentSlide
              ? "w-8 bg-primary"
              : "w-2 bg-foreground/30 hover:bg-foreground/50"
          }`}
        />
      </button>
    ))}
  </div>
);

// Navigation Arrow Component
const NavigationArrow = ({ 
  direction, 
  onClick, 
  label 
}: { 
  direction: 'prev' | 'next'; 
  onClick: () => void;
  label: string;
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className={`absolute ${direction === 'prev' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all group focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
    aria-label={label}
  >
    {direction === 'prev' ? (
      <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
    ) : (
      <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
    )}
  </Button>
);

// Main Component
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<Direction>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageError, setImageError] = useState<number | null>(null);
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch homepage stats
  useEffect(() => {
    const fetchHomepageStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        
        const response = await apiClient.get<{
          success: boolean;
          data: HomepageStats;
          message?: string;
        }>('/homepage-stats');
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          console.error('Failed to load statistics:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching homepage stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchHomepageStats();
  }, []);

  // Preload images
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.onerror = () => console.warn(`Failed to load image: ${slide.image}`);
    });
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      } else if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < heroSlides.length) {
          goToSlide(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setImageError(null); // Reset error state
  }, [currentSlide]);

  const handleNextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setImageError(null);
  }, []);

  const handlePrevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setImageError(null);
  }, []);

  // Format stats for display
  const formatStats = (): HeroSlideStats => {
    if (!stats) {
      return {
        students: "50K+",
        tutorials: "200+",
        rating: "4.9★"
      };
    }

    return {
      students: `${Math.floor(stats.total_students / 1000)}K+`,
      tutorials: `${stats.total_tutorials}+`,
      rating: "4.9★" // You can make this dynamic if you have rating data
    };
  };

  const currentSlideData = heroSlides[currentSlide];
  const displayStats = formatStats();

  return (
    <section 
      className="relative min-h-screen overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero carousel"
      role="region"
    >
      {/* Background Image with Animation */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 will-change-transform"
        >
          {imageError === currentSlide ? (
            <div className="w-full h-full bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <h2 className="text-4xl font-bold mb-4">{currentSlideData.title}</h2>
                <p className="text-xl opacity-90">{currentSlideData.description}</p>
              </div>
            </div>
          ) : (
            <img
              src={currentSlideData.image}
              alt={`${currentSlideData.title} ${currentSlideData.highlight} ${currentSlideData.subtitle}`}
              className="w-full h-full object-cover"
              loading={currentSlide === 0 ? "eager" : "lazy"}
              onError={() => setImageError(currentSlide)}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 min-h-screen flex items-center">
        <div className="max-w-2xl py-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6 backdrop-blur-sm border border-primary/20">
                {currentSlideData.tagline}
              </span>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
                {currentSlideData.title}{" "}
                <span className="gradient-text bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {currentSlideData.highlight}
                </span>
                {currentSlideData.subtitle && (
                  <>
                    <br />
                    {currentSlideData.subtitle}
                  </>
                )}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
                {currentSlideData.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button variant="default" size="lg" className="group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Learning Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-foreground/20 hover:bg-foreground/10 hover:border-foreground/30"
                >
                  Browse Tutorials
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 md:gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{displayStats.students}</span> Students
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{displayStats.tutorials}</span> Tutorials
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{displayStats.rating}</span> Rating
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-8 right-8 z-20 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all"
        aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
      >
        {isPaused ? (
          <PlayIcon className="w-5 h-5" />
        ) : (
          <Pause className="w-5 h-5" />
        )}
      </Button>

      {/* Navigation Arrows */}
      <NavigationArrow 
        direction="prev" 
        onClick={handlePrevSlide}
        label="Previous slide"
      />
      <NavigationArrow 
        direction="next" 
        onClick={handleNextSlide}
        label="Next slide"
      />

      {/* Slide Indicators */}
      <SlideIndicator 
        slides={heroSlides}
        currentSlide={currentSlide}
        goToSlide={goToSlide}
      />

      {/* Progress Bar */}
      <ProgressBar 
        currentSlide={currentSlide} 
        isPaused={isPaused} 
      />

      {/* Screen Reader Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentSlide + 1} of {heroSlides.length}: {currentSlideData.title} {currentSlideData.highlight}
      </div>
    </section>
  );
};

export default HeroSection;