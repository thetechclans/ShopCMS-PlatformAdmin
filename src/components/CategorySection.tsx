import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface CategorySectionProps {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  backgroundColor?: string;
  categories?: Category[];
}

export const CategorySection = ({
  title = "Shop by Category",
  subtitle = "Browse our collection",
  titleColor = "hsl(var(--foreground))",
  subtitleColor = "hsl(var(--muted-foreground))",
  backgroundColor = "transparent",
  categories: propCategories,
}: CategorySectionProps) => {
  const navigate = useNavigate();
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  const categories = propCategories ?? localCategories;

  useEffect(() => {
    if (!propCategories) {
      fetchCategories();
    }
  }, [propCategories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setLocalCategories(data);
    }
  };

  return (
    <section className="py-12" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: titleColor }}>
            {title}
          </h2>
          <p className="text-lg" style={{ color: subtitleColor }}>
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/category/${category.slug}`)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-center">{category.name}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No categories available. Add categories in the Categories section.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
