import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Store, Globe, Zap } from "lucide-react";

const PlatformHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Build Your Online Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A powerful multi-tenant CMS platform that lets you create and manage beautiful e-commerce stores with your own custom domain.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/platform/admin">Platform Admin</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Store Management</h3>
            <p className="text-muted-foreground">
              Create and manage products, categories, and pages with our intuitive dashboard.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Domains</h3>
            <p className="text-muted-foreground">
              Connect your own domain name and build your brand identity.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Tenant Ready</h3>
            <p className="text-muted-foreground">
              Each store is completely isolated with its own data and customizations.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t">
        <p className="text-center text-muted-foreground">
          © 2024 Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PlatformHome;