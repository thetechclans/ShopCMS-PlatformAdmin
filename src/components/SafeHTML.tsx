import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SafeHTML = ({ html, className, style }: SafeHTMLProps) => {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
  });

  return (
    <div 
      className={className} 
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitized }} 
    />
  );
};
