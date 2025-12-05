import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Facebook, Twitter, Youtube, Linkedin, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";

interface FooterConfig {
  brand_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  working_hours: string;
  copyright_text: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface QuickLink {
  label: string;
  url: string;
}

const getSocialIcon = (platform: string) => {
  const iconClass = "h-5 w-5";
  switch (platform.toLowerCase()) {
    case "instagram":
      return Instagram;
    case "facebook":
      return Facebook;
    case "twitter":
      return Twitter;
    case "youtube":
      return Youtube;
    case "linkedin":
      return Linkedin;
    default:
      return Instagram;
  }
};

export const PublicFooter = () => {
  const { tenant } = useTenant();
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    if (tenant?.id) {
      loadFooterData();
    }
  }, [tenant?.id]);

  const loadFooterData = async () => {
    if (!tenant?.id) return;
    
    const [configRes, socialRes, quickRes] = await Promise.all([
      supabase
        .from("footer_config")
        .select("brand_name, tagline, address, phone, email, working_hours, copyright_text")
        .eq("tenant_id", tenant.id)
        .eq("is_published", true)
        .single(),
      supabase
        .from("social_links")
        .select("platform, url")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("footer_quick_links")
        .select("label, url")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("display_order"),
    ]);

    if (configRes.data) {
      setConfig(configRes.data);
    }
    if (socialRes.data) {
      setSocialLinks(socialRes.data);
    }
    if (quickRes.data) {
      setQuickLinks(quickRes.data);
    }
  };

  if (!config) return null;

  return (
    <footer className="bg-gradient-to-br from-sidebar to-sidebar-accent border-t border-sidebar-border mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            {config.brand_name && (
              <h3 className="font-bold text-xl text-sidebar-foreground">{config.brand_name}</h3>
            )}
            {config.tagline && (
              <p className="text-sm text-sidebar-foreground/80">{config.tagline}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((link, index) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-sidebar-accent hover:bg-primary transition-colors text-sidebar-foreground hover:text-primary-foreground"
                      aria-label={link.platform}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact Column */}
          {(config.email || config.phone || config.address || config.working_hours) && (
            <div>
              <h4 className="font-semibold mb-4 text-sidebar-primary">Contact Us</h4>
              <div className="space-y-3 text-sm text-sidebar-foreground/80">
                {config.address && (
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-sidebar-primary/70" />
                    <p>{config.address}</p>
                  </div>
                )}
                {config.phone && (
                  <div className="flex gap-2">
                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-sidebar-primary/70" />
                    <a href={`tel:${config.phone}`} className="hover:text-primary transition-colors">
                      {config.phone}
                    </a>
                  </div>
                )}
                {config.email && (
                  <div className="flex gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-sidebar-primary/70" />
                    <a href={`mailto:${config.email}`} className="hover:text-primary transition-colors">
                      {config.email}
                    </a>
                  </div>
                )}
                {config.working_hours && (
                  <div className="flex gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-sidebar-primary/70" />
                    <p>{config.working_hours}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Links Column */}
          {quickLinks.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4 text-sidebar-primary">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {quickLinks.map((link, index) => {
                  const isExternal = link.url.startsWith("http");
                  return (
                    <li key={index}>
                      {isExternal ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sidebar-foreground/80 hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.url}
                          className="text-sidebar-foreground/80 hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Copyright */}
        {config.copyright_text && (
          <div className="mt-8 pt-8 border-t border-sidebar-border text-center text-sm text-sidebar-foreground/70">
            {config.copyright_text}
          </div>
        )}
      </div>
    </footer>
  );
};
