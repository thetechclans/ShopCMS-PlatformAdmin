import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface CarouselSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
}

interface HomePageCarouselProps {
  autoRotate?: boolean;
  interval?: number;
  slides?: CarouselSlide[];
  isLoading?: boolean;
}

export const HomePageCarousel = ({ 
  autoRotate = true, 
  interval = 5000,
  slides: propSlides,
  isLoading: propIsLoading 
}: HomePageCarouselProps) => {
  const [localSlides, setLocalSlides] = useState<CarouselSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);

  const slides = propSlides ?? localSlides;
  const loading = propIsLoading ?? localLoading;

  useEffect(() => {
    if (!propSlides) {
      fetchSlides();
    }
  }, [propSlides]);

  useEffect(() => {
    if (autoRotate && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoRotate, interval, slides.length]);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setLocalSlides(data);
    }
    setLocalLoading(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-muted animate-pulse rounded-lg" />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-lg group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${currentSlide.image_url})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-3xl">
          {currentSlide.title && (
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {currentSlide.title}
            </h2>
          )}
          {currentSlide.subtitle && (
            <p className="text-lg md:text-xl mb-6">
              {currentSlide.subtitle}
            </p>
          )}
          {currentSlide.cta_label && currentSlide.cta_link && (
            currentSlide.cta_link.startsWith("http") ? (
              <a href={currentSlide.cta_link} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="default">
                  {currentSlide.cta_label}
                </Button>
              </a>
            ) : (
              <Link to={currentSlide.cta_link}>
                <Button size="lg" variant="default">
                  {currentSlide.cta_label}
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
