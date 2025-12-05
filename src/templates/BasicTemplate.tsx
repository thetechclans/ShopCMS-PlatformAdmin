import { HomePageCarousel } from "@/components/HomePageCarousel";
import { CategorySection } from "@/components/CategorySection";
import { TextSection } from "@/components/TextSection";
import { CategorySectionData } from "@/components/CategorySectionEditor";
import { TextSectionData } from "@/components/TextSectionEditor";
import { PublicNavBar } from "@/components/PublicNavBar";
import { PublicFooter } from "@/components/PublicFooter";
import DynamicHead from "@/components/DynamicHead";

type PageSection = CategorySectionData | TextSectionData;

interface BasicTemplateProps {
  slides: any[];
  categories: any[];
  sections: PageSection[];
  isLoading: boolean;
}

export const BasicTemplate = ({ slides, categories, sections, isLoading }: BasicTemplateProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHead />
      <PublicNavBar />

      <main className="flex-1">
        {/* Hero Carousel Section */}
        {slides.length > 0 && (
          <section className="py-8">
            <HomePageCarousel slides={slides} isLoading={isLoading} />
          </section>
        )}

        {/* Dynamic Sections */}
        {sections.map((section, index) => (
          <div key={index}>
            {section.type === "category" && (
              <CategorySection
                title={section.title}
                subtitle={section.subtitle}
                titleColor={section.titleColor}
                subtitleColor={section.subtitleColor}
                backgroundColor={section.backgroundColor}
                categories={categories}
              />
            )}
            {section.type === "text" && (
              <TextSection
                content={section.content}
                textColor={section.textColor}
                backgroundColor={section.backgroundColor}
                textAlign={section.textAlign}
                fontSize={section.fontSize}
                fontWeight={section.fontWeight}
              />
            )}
          </div>
        ))}

        {/* Default Category Section */}
        {sections.length === 0 && categories.length > 0 && (
          <CategorySection categories={categories} />
        )}

        {/* Fallback */}
        {!isLoading && sections.length === 0 && slides.length === 0 && categories.length === 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Welcome to Our Shop</h2>
              <p className="text-muted-foreground mb-6">
                Coming soon! Our shop is being set up.
              </p>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
