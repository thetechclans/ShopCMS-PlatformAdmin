import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

interface MenuItem {
  label: string;
  url: string;
}

interface NavBarConfig {
  logo_url: string | null;
  brand_text: string;
  logo_link_to_home: boolean;
  background_color: string;
  text_color: string;
  sticky_scroll: boolean;
}

export const PublicNavBar = () => {
  const { tenant } = useTenant();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [config, setConfig] = useState<NavBarConfig | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadNavBarData();
    }
  }, [tenant?.id]);

  const loadNavBarData = async () => {
    if (!tenant?.id) return;
    
    const [menuRes, configRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_published", true)
        .order("display_order"),
      supabase
        .from("navbar_config")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_published", true)
        .single(),
    ]);

    if (menuRes.data) {
      setMenuItems(menuRes.data);
    }
    if (configRes.data) {
      setConfig(configRes.data);
    }
  };

  const navStyle = config
    ? {
        backgroundColor: config.background_color,
        color: config.text_color,
      }
    : {};

  return (
    <nav
      className={`border-b ${config?.sticky_scroll ? "sticky top-0 z-50" : ""}`}
      style={navStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={config?.logo_link_to_home ? "/" : "#"} className="flex items-center">
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold">{config?.brand_text || "Shop"}</span>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.url}
                className="hover:opacity-80 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/auth"
              className="text-sm opacity-70 hover:opacity-100 transition-opacity ml-4 border-l pl-4"
              style={{ borderColor: config?.text_color || 'currentColor' }}
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.url}
                  className="hover:opacity-80 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/auth"
                className="text-sm opacity-70 hover:opacity-100 transition-opacity pt-4 border-t"
                style={{ borderColor: config?.text_color || 'currentColor' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
