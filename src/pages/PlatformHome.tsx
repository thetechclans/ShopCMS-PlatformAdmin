import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Store, 
  Globe, 
  Zap, 
  Sparkles, 
  Brain, 
  Rocket,
  Shield,
  BarChart,
  Cpu,
  Users,
  CheckCircle,
  ChevronRight,
  Star,
  TrendingUp,
  Infinity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PlatformHome = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const subscriptionPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "Up to 100 products",
        "1 custom domain",
        "Basic analytics",
        "24/7 support",
        "AI-powered SEO"
      ],
      popular: false,
      color: "border-blue-200"
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Unlimited products",
        "3 custom domains",
        "Advanced analytics",
        "Priority support",
        "AI store optimization",
        "Multi-language support"
      ],
      popular: true,
      color: "border-purple-300"
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large scale operations",
      features: [
        "Everything in Professional",
        "Custom AI models",
        "Dedicated infrastructure",
        "White-label solution",
        "SLA 99.9% uptime",
        "Custom integrations"
      ],
      popular: false,
      color: "border-emerald-300"
    }
  ];

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Store Builder",
      description: "Generate product descriptions, optimize pricing, and create content with our AI assistant",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "Real-time insights powered by machine learning to boost your sales",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation with shared platform efficiency",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: heroInView ? 1 : 0.5, y: heroInView ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-24 relative"
      >
        <div className="text-center max-w-6xl mx-auto">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered E-commerce Platform
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 relative">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Build Future
            </span>
            <br />
            <span className="relative">
              Ready Stores
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-4 -right-6"
              >
                <Rocket className="w-12 h-12 text-primary animate-float" />
              </motion.div>
            </span>
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            The world's first <span className="font-semibold text-primary">AI-native</span> multi-tenant CMS. 
            Create intelligent e-commerce stores with your own domain in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="xl" className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all duration-300">
                <Link to="/auth" className="flex items-center">
                  Start Free Trial <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                variant="outline" 
                size="xl"
                className="px-8 py-6 text-lg rounded-full border-2 hover:border-primary hover:bg-primary/5"
              >
                <Link to="/platform/admin" className="flex items-center">
                  <Shield className="mr-2 w-5 h-5" />
                  Platform Dashboard
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
            {[
              { value: "10K+", label: "Active Stores", icon: <Store /> },
              { value: "99.9%", label: "Uptime", icon: <Zap /> },
              { value: "50+", label: "Countries", icon: <Globe /> },
              { value: "24/7", label: "AI Support", icon: <Brain /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose Our <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">AI Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of e-commerce with cutting-edge AI features
          </p>
        </div>

        <Tabs defaultValue="ai" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="ai" className="text-lg">🤖 AI Features</TabsTrigger>
            <TabsTrigger value="multi" className="text-lg">🏢 Multi-Tenant</TabsTrigger>
            <TabsTrigger value="analytics" className="text-lg">📈 Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onHoverStart={() => setActiveFeature(index)}
                  className="relative group"
                >
                  <Card className="h-full border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-4 text-white`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="multi" className="text-center">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h3 className="text-3xl font-bold mb-4">True Multi-Tenant Architecture</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Complete data isolation</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Custom domains per tenant</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Individual subscription plans</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                    <div className="relative h-64">
                      {/* Visual representation of multi-tenant architecture */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-blue-200/50 animate-pulse" />
                      </div>
                      {[0, 120, 240].map((angle) => (
                        <div
                          key={angle}
                          className="absolute w-24 h-24 rounded-xl bg-white shadow-lg border transform"
                          style={{
                            transform: `rotate(${angle}deg) translateX(120px) rotate(-${angle}deg)`,
                          }}
                        >
                          <Store className="w-8 h-8 m-auto mt-4 text-primary" />
                          <div className="text-xs text-center mt-2">Store</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Subscription Plans Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Flexible subscription plans for every stage of your business growth
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full border-2 ${plan.color} hover:shadow-2xl transition-all duration-300 ${plan.popular ? 'scale-105' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-3xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}`}
                    size="lg"
                  >
                    <Link to="/auth">
                      Get Started
                      {plan.popular && <Rocket className="ml-2 w-4 h-4" />}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Custom Plan Option */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-2 border-dashed hover:border-solid transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Need a Custom Plan?</h3>
                  <p className="text-muted-foreground mt-2">
                    Enterprise-grade solutions with dedicated support and custom AI models
                  </p>
                </div>
                <Button asChild variant="outline" size="lg" className="mt-4 md:mt-0">
                  <Link to="/contact">
                    Contact Sales
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Demo Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-6xl mx-auto border-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="md:flex">
              <div className="md:w-1/2 p-12 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-3xl font-bold mb-6">
                  <Sparkles className="inline-block w-8 h-8 mr-3 text-primary" />
                  Try Our AI Assistant
                </h3>
                <p className="text-muted-foreground mb-8">
                  Generate a product description instantly using our AI
                </p>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Enter a product name..." 
                    className="w-full px-4 py-3 rounded-lg border"
                  />
                  <Button className="w-full bg-gradient-to-r from-primary to-purple-600">
                    <Brain className="mr-2 w-5 h-5" />
                    Generate with AI
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 p-12 bg-white">
                <div className="h-64 border-2 border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      AI-generated content will appear here
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">85% AI accuracy rate</span>
                  </div>
                  <Badge variant="outline">Beta</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t bg-white/50 backdrop-blur-sm">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 mr-3"></div>
              <span className="text-2xl font-bold">StoreAI</span>
            </div>
            <p className="text-muted-foreground">
              The future of e-commerce, powered by AI
            </p>
          </div>
          
          {['Product', 'Platform', 'Resources', 'Company'].map((section) => (
            <div key={section}>
              <h4 className="font-semibold mb-4">{section}</h4>
              <ul className="space-y-2 text-muted-foreground">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i}>
                    <Link to="#" className="hover:text-primary transition-colors">
                      Link {i + 1}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground">
            © 2024 StoreAI Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PlatformHome;