import { HomePageCarousel } from "@/components/HomePageCarousel";
import { CategorySection } from "@/components/CategorySection";
import { TextSection } from "@/components/TextSection";
import { CategorySectionData } from "@/components/CategorySectionEditor";
import { TextSectionData } from "@/components/TextSectionEditor";
import { PublicNavBar } from "@/components/PublicNavBar";
import { PublicFooter } from "@/components/PublicFooter";
import DynamicHead from "@/components/DynamicHead";
import { Sparkles } from "lucide-react";

type PageSection = CategorySectionData | TextSectionData;

interface SilverTemplateProps {
  slides: any[];
  categories: any[];
  sections: PageSection[];
  isLoading: boolean;
}

export const SilverTemplate = ({ slides, categories, sections, isLoading }: SilverTemplateProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-accent/5">
      <DynamicHead />
      <PublicNavBar />

      <main className="flex-1">
        {/* Hero Carousel Section with enhanced animation */}
        {slides.length > 0 && (
          <section className="py-8 animate-fade-in">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Featured
                </h2>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            <HomePageCarousel slides={slides} isLoading={isLoading} />
          </section>
        )}

        {/* Dynamic Sections with staggered animation */}
        {sections.map((section, index) => (
          <div 
            key={index} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {section.type === "category" && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <CategorySection
                  title={section.title}
                  subtitle={section.subtitle}
                  titleColor={section.titleColor}
                  subtitleColor={section.subtitleColor}
                  backgroundColor={section.backgroundColor}
                  categories={categories}
                />
              </div>
            )}
            {section.type === "text" && (
              <div className="hover-scale">
                <TextSection
                  content={section.content}
                  textColor={section.textColor}
                  backgroundColor={section.backgroundColor}
                  textAlign={section.textAlign}
                  fontSize={section.fontSize}
                  fontWeight={section.fontWeight}
                />
              </div>
            )}
          </div>
        ))}

        {/* Default Category Section with gradient overlay */}
        {sections.length === 0 && categories.length > 0 && (
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
            <CategorySection categories={categories} />
          </div>
        )}

        {/* Enhanced Fallback */}
        {!isLoading && sections.length === 0 && slides.length === 0 && categories.length === 0 && (
          <section className="container mx-auto px-4 py-24 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Welcome to Our Shop
                </h2>
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground text-lg mb-8">
                Something amazing is coming soon! Our shop is being carefully crafted.
              </p>
              <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" />
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
