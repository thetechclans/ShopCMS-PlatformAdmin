import { HomePageCarousel } from "@/components/HomePageCarousel";
import { CategorySection } from "@/components/CategorySection";
import { TextSection } from "@/components/TextSection";
import { CategorySectionData } from "@/components/CategorySectionEditor";
import { TextSectionData } from "@/components/TextSectionEditor";
import { PublicNavBar } from "@/components/PublicNavBar";
import { PublicFooter } from "@/components/PublicFooter";
import DynamicHead from "@/components/DynamicHead";
import { Crown, Sparkles, Star } from "lucide-react";

type PageSection = CategorySectionData | TextSectionData;

interface GoldTemplateProps {
  slides: any[];
  categories: any[];
  sections: PageSection[];
  isLoading: boolean;
  themeVariant?: 'dark' | 'light';
}

export const GoldTemplate = ({ 
  slides, 
  categories, 
  sections, 
  isLoading,
  themeVariant = 'light' 
}: GoldTemplateProps) => {
  const isDark = themeVariant === 'dark';
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-amber-50 via-white to-orange-50'}`}>
      <DynamicHead />
      <PublicNavBar />

      {/* Premium Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-0 w-96 h-96 ${isDark ? 'bg-amber-500/5' : 'bg-primary/5'} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 ${isDark ? 'bg-amber-500/5' : 'bg-primary/5'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
      </div>

      <main className="flex-1 relative z-10">
        {/* Premium Hero Section */}
        {slides.length > 0 && (
          <section className="py-12 animate-fade-in">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 justify-center mb-6">
                <Crown className={`w-6 h-6 ${isDark ? 'text-amber-500' : 'text-primary'} animate-pulse`} />
                <h2 className={`text-lg font-bold uppercase tracking-widest ${isDark ? 'text-amber-500' : 'text-primary'}`}>
                  Exclusive Collection
                </h2>
                <Crown className={`w-6 h-6 ${isDark ? 'text-amber-500' : 'text-primary'} animate-pulse`} />
              </div>
              <div className="relative">
                <div className={`absolute -inset-4 ${isDark ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20' : 'bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20'} blur-2xl opacity-50 animate-pulse`} />
                <div className="relative">
                  <HomePageCarousel slides={slides} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Premium Dynamic Sections */}
        {sections.map((section, index) => (
          <div 
            key={index} 
            className="animate-fade-in relative group"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {section.type === "category" && (
              <div className="relative overflow-hidden">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10' : 'bg-gradient-to-r from-primary/10 via-transparent to-primary/10'} pointer-events-none`} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
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
              <div className="relative hover-scale">
                <div className={`absolute -inset-2 ${isDark ? 'bg-gradient-to-r from-amber-500/5 to-orange-500/5' : 'bg-gradient-to-r from-primary/5 to-secondary/5'} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
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

        {/* Premium Default Category Section */}
        {sections.length === 0 && categories.length > 0 && (
          <div className="relative animate-fade-in">
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-amber-500/10 via-transparent to-transparent' : 'bg-gradient-to-b from-primary/10 via-transparent to-transparent'} pointer-events-none`} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <CategorySection categories={categories} />
          </div>
        )}

        {/* Premium Fallback */}
        {!isLoading && sections.length === 0 && slides.length === 0 && categories.length === 0 && (
          <section className="container mx-auto px-4 py-32 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto relative">
              <div className="absolute -inset-10 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-3xl opacity-50 animate-pulse" />
              <div className="relative">
                <div className="inline-flex items-center gap-3 mb-8">
                  <Star className={`w-10 h-10 ${isDark ? 'text-amber-500' : 'text-primary'} animate-pulse`} />
                  <Crown className={`w-12 h-12 ${isDark ? 'text-amber-500' : 'text-primary'} animate-pulse`} style={{ animationDelay: '0.2s' }} />
                  <Star className={`w-10 h-10 ${isDark ? 'text-amber-500' : 'text-primary'} animate-pulse`} style={{ animationDelay: '0.4s' }} />
                </div>
                <h2 className={`text-5xl font-bold mb-4 ${isDark ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 bg-clip-text text-transparent' : 'bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent'}`}>
                  Welcome to Premium Excellence
                </h2>
                <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>
                  An extraordinary experience is being crafted exclusively for you.
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <div className={`h-1 w-32 ${isDark ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' : 'bg-gradient-to-r from-transparent via-primary to-transparent'} rounded-full animate-pulse`} />
                  <Sparkles className={`w-5 h-5 ${isDark ? 'text-amber-500' : 'text-primary'} animate-pulse`} />
                  <div className={`h-1 w-32 ${isDark ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' : 'bg-gradient-to-r from-transparent via-primary to-transparent'} rounded-full animate-pulse`} style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
