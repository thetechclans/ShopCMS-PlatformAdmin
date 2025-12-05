import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";

interface SiteConfig {
  site_title: string | null;
  favicon_url: string | null;
}

const DynamicHead = () => {
  const [config, setConfig] = useState<SiteConfig>({
    site_title: null,
    favicon_url: null,
  });

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    const { data } = await supabase
      .from("public_shop_info")
      .select("site_title, favicon_url")
      .limit(1)
      .single();

    if (data) {
      setConfig(data);
    }
  };

  return (
    <Helmet>
      {config.site_title && <title>{config.site_title}</title>}
      {config.favicon_url && <link rel="icon" href={config.favicon_url} type="image/png" />}
    </Helmet>
  );
};

export default DynamicHead;
