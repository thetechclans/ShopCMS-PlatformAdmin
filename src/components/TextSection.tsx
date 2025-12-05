import { SafeHTML } from "./SafeHTML";

interface TextSectionProps {
  content: string;
  textColor?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  fontSize?: "small" | "medium" | "large";
  fontWeight?: "normal" | "semibold" | "bold";
}

export const TextSection = ({
  content,
  textColor = "hsl(var(--foreground))",
  backgroundColor = "transparent",
  textAlign = "left",
  fontSize = "medium",
  fontWeight = "normal",
}: TextSectionProps) => {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  const weightClasses = {
    normal: "font-normal",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <section className="py-8" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <SafeHTML
          html={content}
          className={`${sizeClasses[fontSize]} ${weightClasses[fontWeight]}`}
          style={{ color: textColor, textAlign }}
        />
      </div>
    </section>
  );
};
