// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { 
//   Store, 
//   Globe, 
//   Zap, 
//   Sparkles, 
//   Brain, 
//   Rocket,
//   Shield,
//   BarChart,
//   Cpu,
//   Users,
//   CheckCircle,
//   ChevronRight,
//   Star,
//   TrendingUp,
//   Infinity
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";

// const PlatformHome = () => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [scrollY, setScrollY] = useState(0);
//   const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
//   const [activeFeature, setActiveFeature] = useState(0);

//   useEffect(() => {
//     const handleScroll = () => setScrollY(window.scrollY);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const subscriptionPlans = [
//     {
//       name: "Starter",
//       price: "$29",
//       period: "/month",
//       description: "Perfect for small businesses",
//       features: [
//         "Up to 100 products",
//         "1 custom domain",
//         "Basic analytics",
//         "24/7 support",
//         "AI-powered SEO"
//       ],
//       popular: false,
//       color: "border-blue-200"
//     },
//     {
//       name: "Professional",
//       price: "$79",
//       period: "/month",
//       description: "For growing businesses",
//       features: [
//         "Unlimited products",
//         "3 custom domains",
//         "Advanced analytics",
//         "Priority support",
//         "AI store optimization",
//         "Multi-language support"
//       ],
//       popular: true,
//       color: "border-purple-300"
//     },
//     {
//       name: "Enterprise",
//       price: "$199",
//       period: "/month",
//       description: "For large scale operations",
//       features: [
//         "Everything in Professional",
//         "Custom AI models",
//         "Dedicated infrastructure",
//         "White-label solution",
//         "SLA 99.9% uptime",
//         "Custom integrations"
//       ],
//       popular: false,
//       color: "border-emerald-300"
//     }
//   ];

//   const features = [
//     {
//       icon: <Brain className="w-8 h-8" />,
//       title: "AI-Powered Store Builder",
//       description: "Generate product descriptions, optimize pricing, and create content with our AI assistant",
//       gradient: "from-purple-500 to-pink-500"
//     },
//     {
//       icon: <Cpu className="w-8 h-8" />,
//       title: "Smart Analytics",
//       description: "Real-time insights powered by machine learning to boost your sales",
//       gradient: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: <Users className="w-8 h-8" />,
//       title: "Multi-Tenant Architecture",
//       description: "Complete data isolation with shared platform efficiency",
//       gradient: "from-green-500 to-emerald-500"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
//       {/* Animated Background */}
//       <div className="fixed inset-0 -z-10">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//         <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Hero Section */}
//       <motion.div
//         ref={heroRef}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: heroInView ? 1 : 0.5, y: heroInView ? 0 : 20 }}
//         transition={{ duration: 0.6 }}
//         className="container mx-auto px-4 py-24 relative"
//       >
//         <div className="text-center max-w-6xl mx-auto">
//           <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 hover:scale-105 transition-transform">
//             <Sparkles className="w-4 h-4 mr-2" />
//             AI-Powered E-commerce Platform
//           </Badge>

//           <h1 className="text-6xl md:text-8xl font-bold mb-8 relative">
//             <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
//               Build Future
//             </span>
//             <br />
//             <span className="relative">
//               Ready Stores
//               <motion.div
//                 animate={{ x: [0, 10, 0] }}
//                 transition={{ repeat: Infinity, duration: 2 }}
//                 className="absolute -top-4 -right-6"
//               >
//                 <Rocket className="w-12 h-12 text-primary animate-float" />
//               </motion.div>
//             </span>
//           </h1>

//           <p className="text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
//             The world's first <span className="font-semibold text-primary">AI-native</span> multi-tenant CMS. 
//             Create intelligent e-commerce stores with your own domain in minutes.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Button asChild size="xl" className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all duration-300">
//                 <Link to="/auth" className="flex items-center">
//                   Start Free Trial <ChevronRight className="ml-2 w-5 h-5" />
//                 </Link>
//               </Button>
//             </motion.div>

//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Button 
//                 asChild 
//                 variant="outline" 
//                 size="xl"
//                 className="px-8 py-6 text-lg rounded-full border-2 hover:border-primary hover:bg-primary/5"
//               >
//                 <Link to="/platform/admin" className="flex items-center">
//                   <Shield className="mr-2 w-5 h-5" />
//                   Platform Dashboard
//                 </Link>
//               </Button>
//             </motion.div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
//             {[
//               { value: "10K+", label: "Active Stores", icon: <Store /> },
//               { value: "99.9%", label: "Uptime", icon: <Zap /> },
//               { value: "50+", label: "Countries", icon: <Globe /> },
//               { value: "24/7", label: "AI Support", icon: <Brain /> }
//             ].map((stat, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
//                   {stat.value}
//                 </div>
//                 <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Features Section */}
//       <div className="container mx-auto px-4 py-20">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-bold mb-6">
//             Why Choose Our <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">AI Platform</span>
//           </h2>
//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             Experience the future of e-commerce with cutting-edge AI features
//           </p>
//         </div>

//         <Tabs defaultValue="ai" className="max-w-6xl mx-auto">
//           <TabsList className="grid w-full grid-cols-3 mb-12">
//             <TabsTrigger value="ai" className="text-lg">🤖 AI Features</TabsTrigger>
//             <TabsTrigger value="multi" className="text-lg">🏢 Multi-Tenant</TabsTrigger>
//             <TabsTrigger value="analytics" className="text-lg">📈 Analytics</TabsTrigger>
//           </TabsList>

//           <TabsContent value="ai" className="space-y-6">
//             <div className="grid md:grid-cols-3 gap-8">
//               {features.map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   viewport={{ once: true }}
//                   onHoverStart={() => setActiveFeature(index)}
//                   className="relative group"
//                 >
//                   <Card className="h-full border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
//                     <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
//                     <CardHeader>
//                       <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-4 text-white`}>
//                         {feature.icon}
//                       </div>
//                       <CardTitle className="text-2xl">{feature.title}</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-muted-foreground">{feature.description}</p>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               ))}
//             </div>
//           </TabsContent>

//           <TabsContent value="multi" className="text-center">
//             <Card className="border-2">
//               <CardContent className="pt-6">
//                 <div className="grid md:grid-cols-2 gap-8 items-center">
//                   <div className="text-left">
//                     <h3 className="text-3xl font-bold mb-4">True Multi-Tenant Architecture</h3>
//                     <ul className="space-y-3">
//                       <li className="flex items-center">
//                         <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
//                         <span>Complete data isolation</span>
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
//                         <span>Custom domains per tenant</span>
//                       </li>
//                       <li className="flex items-center">
//                         <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
//                         <span>Individual subscription plans</span>
//                       </li>
//                     </ul>
//                   </div>
//                   <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
//                     <div className="relative h-64">
//                       {/* Visual representation of multi-tenant architecture */}
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="w-32 h-32 rounded-full bg-blue-200/50 animate-pulse" />
//                       </div>
//                       {[0, 120, 240].map((angle) => (
//                         <div
//                           key={angle}
//                           className="absolute w-24 h-24 rounded-xl bg-white shadow-lg border transform"
//                           style={{
//                             transform: `rotate(${angle}deg) translateX(120px) rotate(-${angle}deg)`,
//                           }}
//                         >
//                           <Store className="w-8 h-8 m-auto mt-4 text-primary" />
//                           <div className="text-xs text-center mt-2">Store</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Subscription Plans Section */}
//       <div className="container mx-auto px-4 py-20">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-bold mb-6">
//             Choose Your <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Plan</span>
//           </h2>
//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             Flexible subscription plans for every stage of your business growth
//           </p>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {subscriptionPlans.map((plan, index) => (
//             <motion.div
//               key={plan.name}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               viewport={{ once: true }}
//               className="relative"
//             >
//               {plan.popular && (
//                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                   <Badge className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
//                     <Star className="w-4 h-4 mr-2" />
//                     Most Popular
//                   </Badge>
//                 </div>
//               )}

//               <Card className={`h-full border-2 ${plan.color} hover:shadow-2xl transition-all duration-300 ${plan.popular ? 'scale-105' : ''}`}>
//                 <CardHeader>
//                   <CardTitle className="text-3xl">{plan.name}</CardTitle>
//                   <CardDescription>{plan.description}</CardDescription>
//                   <div className="mt-4">
//                     <span className="text-5xl font-bold">{plan.price}</span>
//                     <span className="text-muted-foreground">{plan.period}</span>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-3">
//                     {plan.features.map((feature, idx) => (
//                       <li key={idx} className="flex items-center">
//                         <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
//                         <span>{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </CardContent>
//                 <CardFooter>
//                   <Button 
//                     asChild 
//                     className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}`}
//                     size="lg"
//                   >
//                     <Link to="/auth">
//                       Get Started
//                       {plan.popular && <Rocket className="ml-2 w-4 h-4" />}
//                     </Link>
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </motion.div>
//           ))}
//         </div>

//         {/* Custom Plan Option */}
//         <div className="mt-16 max-w-4xl mx-auto">
//           <Card className="border-2 border-dashed hover:border-solid transition-all duration-300">
//             <CardContent className="p-8">
//               <div className="flex flex-col md:flex-row items-center justify-between">
//                 <div>
//                   <h3 className="text-2xl font-bold">Need a Custom Plan?</h3>
//                   <p className="text-muted-foreground mt-2">
//                     Enterprise-grade solutions with dedicated support and custom AI models
//                   </p>
//                 </div>
//                 <Button asChild variant="outline" size="lg" className="mt-4 md:mt-0">
//                   <Link to="/contact">
//                     Contact Sales
//                     <ChevronRight className="ml-2 w-4 h-4" />
//                   </Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* AI Demo Section */}
//       <div className="container mx-auto px-4 py-20">
//         <Card className="max-w-6xl mx-auto border-2 overflow-hidden">
//           <CardContent className="p-0">
//             <div className="md:flex">
//               <div className="md:w-1/2 p-12 bg-gradient-to-br from-blue-50 to-purple-50">
//                 <h3 className="text-3xl font-bold mb-6">
//                   <Sparkles className="inline-block w-8 h-8 mr-3 text-primary" />
//                   Try Our AI Assistant
//                 </h3>
//                 <p className="text-muted-foreground mb-8">
//                   Generate a product description instantly using our AI
//                 </p>
//                 <div className="space-y-4">
//                   <input 
//                     type="text" 
//                     placeholder="Enter a product name..." 
//                     className="w-full px-4 py-3 rounded-lg border"
//                   />
//                   <Button className="w-full bg-gradient-to-r from-primary to-purple-600">
//                     <Brain className="mr-2 w-5 h-5" />
//                     Generate with AI
//                   </Button>
//                 </div>
//               </div>
//               <div className="md:w-1/2 p-12 bg-white">
//                 <div className="h-64 border-2 border-dashed rounded-lg flex items-center justify-center">
//                   <div className="text-center">
//                     <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//                     <p className="text-muted-foreground">
//                       AI-generated content will appear here
//                     </p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
//                     <span className="text-sm">85% AI accuracy rate</span>
//                   </div>
//                   <Badge variant="outline">Beta</Badge>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Footer */}
//       <footer className="container mx-auto px-4 py-12 border-t bg-white/50 backdrop-blur-sm">
//         <div className="grid md:grid-cols-4 gap-8">
//           <div>
//             <div className="flex items-center mb-4">
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-600 mr-3"></div>
//               <span className="text-2xl font-bold">StoreAI</span>
//             </div>
//             <p className="text-muted-foreground">
//               The future of e-commerce, powered by AI
//             </p>
//           </div>

//           {['Product', 'Platform', 'Resources', 'Company'].map((section) => (
//             <div key={section}>
//               <h4 className="font-semibold mb-4">{section}</h4>
//               <ul className="space-y-2 text-muted-foreground">
//                 {Array.from({ length: 4 }).map((_, i) => (
//                   <li key={i}>
//                     <Link to="#" className="hover:text-primary transition-colors">
//                       Link {i + 1}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         <div className="mt-12 pt-8 border-t text-center">
//           <p className="text-muted-foreground">
//             © 2024 StoreAI Platform. All rights reserved.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default PlatformHome;


// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { 
//   ShoppingCart,
//   Layout,
//   Image,
//   FileText,
//   Settings,
//   Users,
//   Globe,
//   Zap,
//   Sparkles,
//   Brain,
//   Shield,
//   CheckCircle,
//   ChevronRight,
//   Star,
//   Grid3X3,
//   Menu,
//   FolderTree,
//   Package,
//   Tag,
//   Smartphone,
//   MessageCircle,
//   Clock,
//   MapPin,
//   Mail,
//   Phone,
//   Facebook,
//   Instagram,
//   Twitter,
//   Youtube,
//   Share2,
//   ShoppingBag,
//   BarChart,
//   Cpu,
//   Palette,
//   Layers,
//   Sliders,
//   X,
//   ExternalLink,
//   TrendingUp,
//   Server,
//   Database,
//   ShieldCheck,
//   BadgeCheck,
//   Crown,
//   Gem,
//   Award,
//   ArrowRight
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// const PlatformHome = () => {
//   const [scrollY, setScrollY] = useState(0);
//   const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
//   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
//   const [showPlanModal, setShowPlanModal] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => setScrollY(window.scrollY);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Based on PDF document features
//   const coreFeatures = [
//     {
//       icon: <Layout className="w-8 h-8" />,
//       title: "Home Page Builder",
//       description: "Build and customize your shop's homepage with drag & drop sections",
//       color: "from-blue-500 to-cyan-500",
//       bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
//       details: [
//         "Edit Menu, Navbar, Carousel, Footer",
//         "Add Category/Text sections",
//         "Real-time preview",
//         "Publish/Draft mode"
//       ]
//     },
//     {
//       icon: <Image className="w-8 h-8" />,
//       title: "Hero Carousel Editor",
//       description: "Create stunning product showcases with image carousels",
//       color: "from-purple-500 to-pink-500",
//       bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
//       details: [
//         "Add/remove slides",
//         "Re-order slides",
//         "Upload multiple images",
//         "Set active/inactive status"
//       ]
//     },
//     {
//       icon: <ShoppingBag className="w-8 h-8" />,
//       title: "Product Management",
//       description: "Complete product catalog with categories and variants",
//       color: "from-green-500 to-emerald-500",
//       bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
//       details: [
//         "Add main + 3 gallery images",
//         "YouTube video integration",
//         "Product attributes",
//         "WhatsApp integration"
//       ]
//     },
//     {
//       icon: <FolderTree className="w-8 h-8" />,
//       title: "Category Management",
//       description: "Organize products with categories and subcategories",
//       color: "from-orange-500 to-red-500",
//       bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
//       details: [
//         "Add name & description",
//         "Category images",
//         "Publish immediately or later",
//         "Product count tracking"
//       ]
//     },
//     {
//       icon: <Menu className="w-8 h-8" />,
//       title: "Navigation Editor",
//       description: "Customize navigation bar with logo and menu items",
//       color: "from-indigo-500 to-blue-500",
//       bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
//       details: [
//         "Upload logo image (3MB max)",
//         "Brand text fallback",
//         "Background/text colors",
//         "Sticky on scroll option"
//       ]
//     },
//     {
//       icon: <FileText className="w-8 h-8" />,
//       title: "Static Pages",
//       description: "Create custom pages for your shop content",
//       color: "from-pink-500 to-rose-500",
//       bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
//       details: [
//         "Home page with carousel",
//         "Custom menu integration",
//         "Multiple page templates",
//         "SEO-friendly URLs"
//       ]
//     }
//   ];

//   const pricingPlans = [
//     {
//       id: "silver",
//       name: "Silver",
//       price: "$29",
//       period: "/month",
//       description: "Perfect for small shops & startups",
//       icon: <Gem className="w-10 h-10 text-gray-400" />,
//       color: "border-gray-300",
//       buttonColor: "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
//       gradientBg: "from-gray-50 via-gray-100 to-gray-200",
//       popular: false,
//       features: [
//         { text: "Up to 50 products", included: true },
//         { text: "15 categories limit", included: true },
//         { text: "3 carousel slides", included: true },
//         { text: "20 static pages", included: true },
//         { text: "1 custom domain", included: true },
//         { text: "Email support", included: true },
//         { text: "Basic analytics", included: true },
//         { text: "Mobile responsive design", included: true },
//         { text: "WhatsApp integration", included: false },
//         { text: "Priority support", included: false },
//         { text: "Advanced analytics", included: false },
//         { text: "Custom branding", included: false }
//       ],
//       buttonText: "Start Silver Plan"
//     },
//     {
//       id: "gold",
//       name: "Gold",
//       price: "$79",
//       period: "/month",
//       description: "Best for growing businesses",
//       icon: <Crown className="w-10 h-10 text-yellow-500" />,
//       color: "border-yellow-400",
//       buttonColor: "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
//       gradientBg: "from-yellow-50 via-orange-50 to-amber-50",
//       popular: true,
//       features: [
//         { text: "Unlimited products", included: true },
//         { text: "Unlimited categories", included: true },
//         { text: "10 carousel slides", included: true },
//         { text: "50 static pages", included: true },
//         { text: "3 custom domains", included: true },
//         { text: "Priority email & chat support", included: true },
//         { text: "Advanced analytics", included: true },
//         { text: "WhatsApp integration", included: true },
//         { text: "Multi-language support", included: true },
//         { text: "Custom branding", included: true },
//         { text: "API access", included: false },
//         { text: "Custom integrations", included: false }
//       ],
//       buttonText: "Start Gold Plan"
//     },
//     {
//       id: "platinum",
//       name: "Platinum",
//       price: "$199",
//       period: "/month",
//       description: "Enterprise-grade solution",
//       icon: <Award className="w-10 h-10 text-blue-500" />,
//       color: "border-blue-400",
//       buttonColor: "from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
//       gradientBg: "from-blue-50 via-indigo-50 to-purple-50",
//       popular: false,
//       features: [
//         { text: "Everything in Gold", included: true },
//         { text: "Unlimited everything", included: true },
//         { text: "White-label solution", included: true },
//         { text: "Dedicated account manager", included: true },
//         { text: "Custom AI models", included: true },
//         { text: "API access", included: true },
//         { text: "Custom integrations", included: true },
//         { text: "99.9% SLA uptime", included: true },
//         { text: "Advanced security", included: true },
//         { text: "Custom workflows", included: true },
//         { text: "Training & onboarding", included: true },
//         { text: "24/7 phone support", included: true }
//       ],
//       buttonText: "Contact Sales"
//     }
//   ];

//   const stats = [
//     { value: "5,000+", label: "Stores Created", icon: <ShoppingCart />, color: "from-blue-500 to-cyan-500" },
//     { value: "98%", label: "Satisfaction Rate", icon: <Sparkles />, color: "from-purple-500 to-pink-500" },
//     { value: "24/7", label: "Support Available", icon: <ShieldCheck />, color: "from-green-500 to-emerald-500" },
//     { value: "1,200+", label: "Happy Customers", icon: <Users />, color: "from-orange-500 to-red-500" }
//   ];


//   const howItWorks = [
//     {
//       step: "1",
//       title: "Sign Up & Choose Template",
//       description: "Create your account and select from our beautiful templates",
//       icon: "🎯"
//     },
//     {
//       step: "2",
//       title: "Customize Your Shop",
//       description: "Use our visual editor to design your perfect store",
//       icon: "🎨"
//     },
//     {
//       step: "3",
//       title: "Add Products",
//       description: "Upload products, set prices, and organize categories",
//       icon: "📦"
//     },
//     {
//       step: "4",
//       title: "Go Live",
//       description: "Publish your store and start selling immediately",
//       icon: "🚀"
//     }
//   ];
//   const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan);

//   return (
//     <div className="min-h-screen bg-white overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="fixed inset-0 -z-10 overflow-hidden">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//         <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
//       </div>

//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
//                 <ShoppingCart className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Shop CMS</h1>
//                 <p className="text-xs text-gray-500">Build your online shop in minutes</p>
//               </div>
//             </div>

//             <nav className="hidden md:flex items-center space-x-6">
//               <Link to="#features" className="text-gray-600 hover:text-blue-600 font-medium">Features</Link>
//               <Link to="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</Link>
//               <Link to="#dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
//               <Link to="/platform/admin" className="text-gray-600 hover:text-blue-600 font-medium">Admin</Link>
//             </nav>

//             <div className="flex items-center space-x-4">
//               <Button asChild variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
//                 <Link to="/platform/admin">
//                   <Settings className="w-4 h-4 mr-2" />
//                   Admin Login
//                 </Link>
//               </Button>
//               <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg">
//                 <Link to="/auth">
//                   Start Free Trial
//                   <ChevronRight className="w-4 h-4 ml-2" />
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 -z-10"></div>
//         <div className="container mx-auto px-4 py-16 md:py-24">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//             >
//               <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0">
//                 <Sparkles className="w-4 h-4 mr-2" />
//                 No Coding Required
//               </Badge>

//               <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//                 Build Your Online Shop
//                 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
//                   In Minutes, Not Days
//                 </span>
//               </h1>

//               <p className="text-lg text-gray-600 mb-8 leading-relaxed">
//                 The complete e-commerce CMS solution with everything you need to launch and manage your online store.
//                 From homepage builder to product management - all in one platform.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-105 transition-transform">
//                   <Link to="/auth">
//                     Start 14-Day Free Trial
//                     <ChevronRight className="ml-2 w-5 h-5" />
//                   </Link>
//                 </Button>

//                 <Button asChild variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50">
//                   <Link to="#pricing">
//                     <TrendingUp className="mr-2 w-5 h-5" />
//                     View Pricing
//                   </Link>
//                 </Button>
//               </div>

//               <div className="mt-8 flex items-center space-x-6 text-sm">
//                 <div className="flex items-center">
//                   <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
//                   <span className="text-gray-600">No credit card required</span>
//                 </div>
//                 <div className="flex items-center">
//                   <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
//                   <span className="text-gray-600">Full-featured trial</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Store Preview */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="relative"
//             >
//               <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
//                 {/* Browser Bar */}
//                 <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-3 flex items-center justify-between border-b">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
//                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
//                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
//                   </div>
//                   <div className="text-sm text-gray-600 font-medium">yourstore.shopcms.com</div>
//                   <div className="w-6"></div>
//                 </div>

//                 {/* Store Content */}
//                 <div className="p-6 bg-gradient-to-br from-white to-gray-50">
//                   {/* Navigation */}
//                   <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-sm border">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
//                         <ShoppingCart className="w-6 h-6 text-white" />
//                       </div>
//                       <span className="font-bold text-gray-800">Sunware Shop</span>
//                     </div>
//                     <div className="hidden md:flex space-x-6">
//                       <span className="text-gray-700 font-medium">Home</span>
//                       <span className="text-gray-700 font-medium">Products</span>
//                       <span className="text-gray-700 font-medium">Categories</span>
//                       <span className="text-gray-700 font-medium">Contact</span>
//                     </div>
//                     <div className="relative">
//                       <ShoppingCart className="w-6 h-6 text-gray-700" />
//                       <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</div>
//                     </div>
//                   </div>

//                   {/* Hero Carousel */}
//                   <div className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8 text-center border">
//                     <h3 className="text-2xl font-bold mb-3 text-gray-800">Featured Products</h3>
//                     <p className="text-gray-600 mb-6">Discover our best collection</p>
//                     <div className="flex justify-center space-x-2">
//                       {[1, 2, 3].map((i) => (
//                         <div key={i} className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'}`}></div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Categories */}
//                   <div className="grid grid-cols-3 gap-4 mb-8">
//                     {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'].map((cat, i) => (
//                       <div key={cat} className="text-center p-4 bg-white border rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
//                         <div className={`w-12 h-12 rounded-full mx-auto mb-3 ${
//                           i === 0 ? 'bg-gradient-to-r from-blue-100 to-cyan-100' :
//                           i === 1 ? 'bg-gradient-to-r from-purple-100 to-pink-100' :
//                           i === 2 ? 'bg-gradient-to-r from-green-100 to-emerald-100' :
//                           i === 3 ? 'bg-gradient-to-r from-pink-100 to-rose-100' :
//                           i === 4 ? 'bg-gradient-to-r from-orange-100 to-red-100' :
//                           'bg-gradient-to-r from-indigo-100 to-blue-100'
//                         }`}></div>
//                         <div className="text-sm font-medium text-gray-700">{cat}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Floating Elements */}
//               <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
//               <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full blur-xl"></div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-12 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {stats.map((stat, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 viewport={{ once: true }}
//                 className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
//                   {stat.value}
//                 </div>
//                 <div className="text-gray-600">{stat.label}</div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 bg-gradient-to-b from-white to-blue-50/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               Complete <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Shop Management</span> Platform
//             </h2>
//             <p className="text-gray-600 max-w-3xl mx-auto">
//               Everything you need to build, customize, and manage your online store
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {coreFeatures.map((feature, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 viewport={{ once: true }}
//               >
//                 <Card className={`h-full border-0 shadow-lg hover:shadow-xl transition-shadow ${feature.bgColor}`}>
//                   <CardHeader>
//                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-4 text-white mb-4`}>
//                       {feature.icon}
//                     </div>
//                     <CardTitle className="text-xl">{feature.title}</CardTitle>
//                     <CardDescription className="text-gray-600">{feature.description}</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <ul className="space-y-3">
//                       {feature.details.map((detail, idx) => (
//                         <li key={idx} className="flex items-center text-sm">
//                           <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${feature.color} mr-3`}></div>
//                           <span className="text-gray-700">{detail}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="py-20 bg-gradient-to-b from-blue-50/30 to-purple-50/30">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               Simple, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transparent</span> Pricing
//             </h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Choose the perfect plan for your business. All plans include 14-day free trial.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {pricingPlans.map((plan, index) => (
//               <motion.div
//                 key={plan.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.2 }}
//                 viewport={{ once: true }}
//                 className="relative"
//                 onClick={() => {
//                   setSelectedPlan(plan.id);
//                   setShowPlanModal(true);
//                 }}
//               >
//                 {plan.popular && (
//                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
//                     <Badge className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
//                       <Star className="w-4 h-4 mr-2" />
//                       Most Popular
//                     </Badge>
//                   </div>
//                 )}

//                 <Card className={`h-full border-2 ${plan.color} hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${plan.popular ? 'shadow-xl' : 'shadow-lg'}`}>
//                   <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradientBg} opacity-50 -z-10 rounded-lg`} />

//                   <CardHeader className="text-center pb-6 pt-8">
//                     <div className="flex justify-center mb-4">
//                       <div className={`p-4 rounded-2xl bg-gradient-to-br ${plan.gradientBg} border`}>
//                         {plan.icon}
//                       </div>
//                     </div>
//                     <CardTitle className="text-3xl">{plan.name}</CardTitle>
//                     <CardDescription className="text-base">{plan.description}</CardDescription>
//                     <div className="mt-6">
//                       <span className="text-5xl font-bold">{plan.price}</span>
//                       <span className="text-gray-600 text-lg ml-2">{plan.period}</span>
//                     </div>
//                   </CardHeader>

//                   <CardContent className="pt-0">
//                     <div className="border-t pt-6">
//                       <h4 className="font-semibold mb-4 text-gray-700 text-center">Key Features:</h4>
//                       <ul className="space-y-3">
//                         {plan.features.slice(0, 6).map((feature, idx) => (
//                           <li key={idx} className="flex items-center">
//                             {feature.included ? (
//                               <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
//                             ) : (
//                               <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
//                             )}
//                             <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
//                               {feature.text}
//                             </span>
//                           </li>
//                         ))}
//                       </ul>
//                       <div className="mt-4 text-center">
//                         <Button variant="link" className="text-blue-600 hover:text-blue-700">
//                           View All Features →
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>

//                   <CardFooter className="pt-0">
//                     <Button 
//                       className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${plan.buttonColor} text-white`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedPlan(plan.id);
//                         setShowPlanModal(true);
//                       }}
//                     >
//                       {plan.buttonText}
//                       <ExternalLink className="ml-2 w-5 h-5" />
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Plan Modal */}
//       <AnimatePresence>
//         {showPlanModal && selectedPlanData && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
//             >
//               <Card className="border-0 shadow-2xl">
//                 <div className={`absolute inset-0 bg-gradient-to-br ${selectedPlanData.gradientBg} opacity-20 rounded-lg -z-10`} />

//                 <CardHeader className="relative">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="absolute right-4 top-4"
//                     onClick={() => setShowPlanModal(false)}
//                   >
//                     <X className="w-5 h-5" />
//                   </Button>

//                   <div className="text-center pt-8">
//                     <div className="flex justify-center mb-6">
//                       <div className={`p-6 rounded-3xl bg-gradient-to-br ${selectedPlanData.gradientBg} border shadow-lg`}>
//                         {selectedPlanData.icon}
//                       </div>
//                     </div>
//                     <CardTitle className="text-4xl mb-2">{selectedPlanData.name} Plan</CardTitle>
//                     <CardDescription className="text-xl">{selectedPlanData.description}</CardDescription>
//                     <div className="mt-6">
//                       <span className="text-6xl font-bold">{selectedPlanData.price}</span>
//                       <span className="text-2xl text-gray-600 ml-2">{selectedPlanData.period}</span>
//                     </div>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="px-8">
//                   <div className="grid md:grid-cols-2 gap-8">
//                     <div>
//                       <h3 className="text-xl font-bold mb-6 text-gray-800">Features Included</h3>
//                       <div className="space-y-4">
//                         {selectedPlanData.features.map((feature, idx) => (
//                           <div key={idx} className="flex items-start">
//                             {feature.included ? (
//                               <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
//                                 <CheckCircle className="w-4 h-4 text-green-600" />
//                               </div>
//                             ) : (
//                               <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
//                                 <X className="w-4 h-4 text-gray-400" />
//                               </div>
//                             )}
//                             <span className={`${feature.included ? 'text-gray-800' : 'text-gray-400'}`}>
//                               {feature.text}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="text-xl font-bold mb-6 text-gray-800">Plan Benefits</h3>
//                       <div className="space-y-6">
//                         <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
//                           <h4 className="font-bold mb-2 text-gray-800">Perfect For</h4>
//                           <p className="text-gray-600">
//                             {selectedPlanData.name === 'Silver' 
//                               ? 'Small businesses, startups, and individual entrepreneurs'
//                               : selectedPlanData.name === 'Gold'
//                               ? 'Growing businesses with expanding product catalogs'
//                               : 'Enterprise businesses requiring custom solutions'
//                             }
//                           </p>
//                         </div>

//                         <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
//                           <h4 className="font-bold mb-2 text-gray-800">Support</h4>
//                           <p className="text-gray-600">
//                             {selectedPlanData.name === 'Silver' 
//                               ? 'Email support with 48-hour response time'
//                               : selectedPlanData.name === 'Gold'
//                               ? 'Priority email & chat support with 24-hour response'
//                               : 'Dedicated account manager with 24/7 phone support'
//                             }
//                           </p>
//                         </div>

//                         <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
//                           <h4 className="font-bold mb-2 text-gray-800">Free Trial</h4>
//                           <p className="text-gray-600">
//                             All plans include a 14-day free trial with full access to all features.
//                             No credit card required to start.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>

//                 <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center px-8 pb-8">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     className="px-8 py-6 text-lg"
//                     onClick={() => setShowPlanModal(false)}
//                   >
//                     Back to Plans
//                   </Button>
//                   <Button
//                     size="lg"
//                     className={`px-8 py-6 text-lg bg-gradient-to-r ${selectedPlanData.buttonColor} text-white`}
//                     asChild
//                   >
//                     <Link to={selectedPlanData.name === 'Platinum' ? "/contact" : "/auth"}>
//                       {selectedPlanData.name === 'Platinum' ? 'Contact Sales Team' : 'Start Free Trial'}
//                       <ChevronRight className="ml-2 w-5 h-5" />
//                     </Link>
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>


//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
//             {howItWorks.map((step, index) => (
//               <motion.div
//                 key={step.step}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 viewport={{ once: true }}
//                 className="relative"
//               >
//                 <Card className="h-full border hover:shadow-lg transition-shadow">
//                   <CardHeader>
//                     <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
//                       {step.step}
//                     </div>
//                     <div className="text-4xl mb-4">{step.icon}</div>
//                     <CardTitle className="text-xl">{step.title}</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-gray-600">{step.description}</p>
//                   </CardContent>
//                 </Card>

//                 {index < howItWorks.length - 1 && (
//                   <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-16 border-t-2 border-dashed border-gray-300"></div>
//                 )}
//               </motion.div>
//             ))}
//           </div>

//           <div className="text-center mt-12">
//             <Button asChild size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600">
//               <Link to="/auth">
//                 Start Your Free Trial
//                 <ArrowRight className="ml-2 w-5 h-5" />
//               </Link>
//             </Button>
//           </div>

//       {/* Footer */}


//        <footer className="bg-gray-900 text-white py-12">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-4 gap-8">
//             <div>
//               <div className="flex items-center mb-4">
//                 <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
//                   <ShoppingCart className="w-6 h-6" />
//                 </div>
//                 <span className="text-2xl font-bold">Shop CMS</span>
//               </div>
//               <p className="text-gray-400">
//                 Build your online shop in minutes. No coding required.
//               </p>
//             </div>

//             {[
//               {
//                 title: 'Product',
//                 links: ['Features', 'Pricing', 'Demo', 'API']
//               },
//               {
//                 title: 'Resources',
//                 links: ['Documentation', 'Tutorials', 'Blog', 'Support']
//               },
//               {
//                 title: 'Company',
//                 links: ['About Us', 'Contact', 'Terms', 'Privacy']
//               }
//             ].map((section) => (
//               <div key={section.title}>
//                 <h4 className="font-semibold mb-4 text-lg">{section.title}</h4>
//                 <ul className="space-y-3 text-gray-400">
//                   {section.links.map((link) => (
//                     <li key={link}>
//                       <Link to="#" className="hover:text-white transition-colors">
//                         {link}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>

//           <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
//             <p>© 2024 Shop CMS. All rights reserved.</p>
//             <p className="mt-2 text-sm">Build your online shop in minutes</p>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// };

// export default PlatformHome;




import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getActiveSubscriptionPlans, type SubscriptionPlan } from "@/lib/api/subscriptions";
import { TenantRequestForm } from "@/components/tenant/TenantRequestForm";
import { toast } from "sonner";
import { 
  ShoppingCart,
  Layout,
  Image,
  FileText,
  Settings,
  Users,
  Zap,
  Sparkles,
  CheckCircle,
  ChevronRight,
  Star,
  Menu,
  FolderTree,
  Package,
  Smartphone,
  ShoppingBag,
  ShieldCheck,
  Crown,
  Gem,
  Award,
  X,
  ExternalLink,
  TrendingUp,
  Clock,
  Store,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PlatformHome = () => {
  const [scrollY, setScrollY] = useState(0);
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch active subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getActiveSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (error: any) {
        console.error('Error fetching subscription plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Based on PDF document features
  const coreFeatures = [
    {
      icon: <Layout className="w-8 h-8" />,
      title: "Home Page Builder",
      description: "Build and customize your shop's homepage with drag & drop sections",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      details: [
        "Edit Menu, Navbar, Carousel, Footer",
        "Add Category/Text sections",
        "Real-time preview",
        "Publish/Draft mode"
      ]
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Hero Carousel Editor",
      description: "Create stunning product showcases with image carousels",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      details: [
        "Add/remove slides",
        "Re-order slides",
        "Upload multiple images",
        "Set active/inactive status"
      ]
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Product Management",
      description: "Complete product catalog with categories and variants",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      details: [
        "Add main + 3 gallery images",
        "YouTube video integration",
        "Product attributes",
        "WhatsApp integration"
      ]
    },
    {
      icon: <FolderTree className="w-8 h-8" />,
      title: "Category Management",
      description: "Organize products with categories and subcategories",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      details: [
        "Add name & description",
        "Category images",
        "Publish immediately or later",
        "Product count tracking"
      ]
    },
    {
      icon: <Menu className="w-8 h-8" />,
      title: "Navigation Editor",
      description: "Customize navigation bar with logo and menu items",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      details: [
        "Upload logo image (3MB max)",
        "Brand text fallback",
        "Background/text colors",
        "Sticky on scroll option"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Static Pages",
      description: "Create custom pages for your shop content",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      details: [
        "Home page with carousel",
        "Custom menu integration",
        "Multiple page templates",
        "SEO-friendly URLs"
      ]
    }
  ];

  // Helper function to get plan styling based on plan_type
  const getPlanStyling = (plan_type: string) => {
    switch (plan_type) {
      case 'basic':
        return {
          icon: <Gem className="w-10 h-10 text-gray-500" />,
          color: "border-gray-300",
          buttonColor: "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
          gradientBg: "from-gray-50 via-gray-100 to-gray-200"
        };
      case 'silver':
        return {
          icon: <Crown className="w-10 h-10 text-purple-500" />,
          color: "border-purple-300",
          buttonColor: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
          gradientBg: "from-purple-50 via-pink-50 to-rose-50"
        };
      case 'gold':
        return {
          icon: <Award className="w-10 h-10 text-yellow-500" />,
          color: "border-yellow-400",
          buttonColor: "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
          gradientBg: "from-yellow-50 via-orange-50 to-amber-50"
        };
      default:
        return {
          icon: <Gem className="w-10 h-10 text-gray-400" />,
          color: "border-gray-300",
          buttonColor: "from-gray-600 to-gray-700",
          gradientBg: "from-gray-50 via-gray-100 to-gray-200"
        };
    }
  };

  const stats = [
    { value: "5,000+", label: "Stores Created", icon: <ShoppingCart />, color: "from-blue-500 to-cyan-500" },
    { value: "98%", label: "Satisfaction Rate", icon: <Sparkles />, color: "from-purple-500 to-pink-500" },
    { value: "24/7", label: "Support Available", icon: <ShieldCheck />, color: "from-green-500 to-emerald-500" },
    { value: "1,200+", label: "Happy Customers", icon: <Users />, color: "from-orange-500 to-red-500" }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up & Choose Template",
      description: "Create your account and select from our beautiful templates",
      icon: "🎯"
    },
    {
      step: "2",
      title: "Customize Your Shop",
      description: "Use our visual editor to design your perfect store",
      icon: "🎨"
    },
    {
      step: "3",
      title: "Add Products",
      description: "Upload products, set prices, and organize categories",
      icon: "📦"
    },
    {
      step: "4",
      title: "Go Live",
      description: "Publish your store and start selling immediately",
      icon: "🚀"
    }
  ];


  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shop CMS</h1>
                <p className="text-xs text-gray-500">Build your online shop in minutes</p>
              </div>
            </div>

            {/* <nav className="hidden md:flex items-center space-x-6">
              <Link to="#features" className="text-gray-600 hover:text-blue-600 font-medium">Features</Link>
              <Link to="#pricing" className="text-gray-600 hover:text-blue-600 font-medium">Pricing</Link>
              <Link to="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium">How It Works</Link>
              <Link to="/platform/admin" className="text-gray-600 hover:text-blue-600 font-medium">Admin</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Link to="/platform/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg">
                <Link to="/auth">
                  Start Free Trial
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div> */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 -z-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0">
                <Sparkles className="w-4 h-4 mr-2" />
                No Coding Required
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Build Your Online Shop
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  In Minutes, Not Days
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                The complete e-commerce CMS solution with everything you need to launch and manage your online store.
                From homepage builder to product management - all in one platform.
              </p>

              {/* <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-105 transition-transform">
                  <Link to="/auth">
                    Start 14-Day Free Trial
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  <Link to="#pricing">
                    <TrendingUp className="mr-2 w-5 h-5" />
                    View Pricing
                  </Link>
                </Button>
              </div> */}

              <div className="mt-8 flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Full-featured Work</span>
                </div>
              </div>
            </motion.div>

            {/* Store Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden transform hover:scale-[1.02] transition-all duration-500 relative">
                {/* Golden Border Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/10 via-yellow-300/5 to-amber-400/10 pointer-events-none"></div>

                {/* Royal Crown Badge */}
                <div className="absolute -top-4 -right-4 z-10">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl rotate-12">
                      <Crown className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute inset-0 animate-ping bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full opacity-20"></div>
                  </div>
                </div>

                {/* Browser Bar - Enhanced */}
                <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 px-5 py-3.5 flex items-center justify-between border-b border-white/20 relative">
                  {/* Browser Dots with Glow */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg shadow-red-400/30"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/30"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-400/30"></div>
                  </div>

                  {/* Domain with Glow Text */}
                  <div className="text-sm font-medium text-white/90 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    demo-store.shopcms.in
                  </div>

                  {/* Live Badge */}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-white/90">LIVE</span>
                  </div>
                </div>

                {/* Store Content */}
                <div className="p-6 bg-gradient-to-br from-white via-white to-gray-50">
                  {/* Simple Navigation */}
                  <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-gray-800">TechMart</span>
                    </div>

                    <div className="hidden md:flex space-x-6">
                      {['Home', 'Shop', 'Categories', 'About'].map((item) => (
                        <span key={item} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer font-medium transition-colors">
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner */}
                  <div className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="text-white">
                        <p className="text-xs font-medium text-blue-200 mb-1">🎉 New Arrivals</p>
                        <h3 className="text-xl font-bold mb-1">Summer Sale</h3>
                        <p className="text-sm text-blue-100 mb-3">Up to 40% off on selected items</p>
                        <button className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                          Shop Now
                        </button>
                      </div>
                      <div className="hidden sm:block text-right">
                        <div className="text-4xl font-bold text-white/90">40%</div>
                        <div className="text-sm text-blue-200">OFF</div>
                      </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full"></div>
                  </div>

                  {/* Featured Products Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-800">Featured Products</h4>
                      <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium">View All →</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {/* Product 1 */}
                      <div className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                        <div className="relative h-28 bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
                            <Clock className="w-8 h-8 text-white" />
                          </div>
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">-20%</span>
                          <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-red-500 text-sm">♥</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-500 mb-1">Watches</p>
                          <h5 className="text-sm font-semibold text-gray-800 mb-1 truncate">Premium Chronograph</h5>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★★</div>
                            <span className="text-xs text-gray-400 ml-1">(128)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-bold text-gray-900">₹2,499</span>
                              <span className="text-xs text-gray-400 line-through ml-1">₹3,199</span>
                            </div>
                            <button className="w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                              <span className="text-white text-lg font-light">+</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product 2 */}
                      <div className="group bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                        <div className="relative h-28 bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-white" />
                          </div>
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">New</span>
                          <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-red-500 text-sm">♥</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-500 mb-1">Fashion</p>
                          <h5 className="text-sm font-semibold text-gray-800 mb-1 truncate">Designer Collection</h5>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                            <span className="text-xs text-gray-400 ml-1">(87)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-bold text-gray-900">₹1,899</span>
                            </div>
                            <button className="w-7 h-7 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors">
                              <span className="text-white text-lg font-light">+</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product 3 */}
                      <div className="group bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                        <div className="relative h-28 bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg flex items-center justify-center">
                            <Gem className="w-8 h-8 text-white" />
                          </div>
                          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Hot</span>
                          <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-red-500 text-sm">♥</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-500 mb-1">Jewelry</p>
                          <h5 className="text-sm font-semibold text-gray-800 mb-1 truncate">Diamond Pendant</h5>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★★</div>
                            <span className="text-xs text-gray-400 ml-1">(256)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-bold text-gray-900">₹4,999</span>
                              <span className="text-xs text-gray-400 line-through ml-1">₹5,999</span>
                            </div>
                            <button className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-colors">
                              <span className="text-white text-lg font-light">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories Row */}
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    {[
                      { name: 'Electronics', icon: <Smartphone className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
                      { name: 'Fashion', icon: <ShoppingBag className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
                      { name: 'Jewelry', icon: <Gem className="w-4 h-4" />, color: 'from-amber-500 to-yellow-500' },
                      { name: 'Home', icon: <Store className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
                    ].map((cat) => (
                      <div key={cat.name} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full cursor-pointer transition-colors border border-gray-200">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${cat.color} flex items-center justify-center text-white`}>
                          {cat.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Platform Badge */}
                  <div className="text-center">
                    <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-200/50 text-white font-medium">
                      <Globe className="w-4 h-4 mr-2" />
                      Powered by ShopCMS Platform
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Enhanced */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
              <div className="absolute top-1/3 -left-10 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-12 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Shop Management</span> Platform
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, customize, and manage your online store
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full border-0 shadow-lg hover:shadow-xl transition-shadow ${feature.bgColor}`}>
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-4 text-white mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${feature.color} mr-3`}></div>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your business. All plans include
              {/* 14-day free trial. */}
            </p>
          </div>

          {isLoadingPlans ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[500px] animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {subscriptionPlans.map((plan, index) => {
                const styling = getPlanStyling(plan.plan_type);
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="relative"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowRequestForm(true);
                    }}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                          <Star className="w-4 h-4 mr-2" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <Card className={`h-full border-2 ${styling.color} hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${plan.is_popular ? 'shadow-xl' : 'shadow-lg'}`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${styling.gradientBg} opacity-50 -z-10 rounded-lg`} />
                      
                      <CardHeader className="text-center pb-6 pt-8">
                        <div className="flex justify-center mb-4">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${styling.gradientBg} border`}>
                            {styling.icon}
                          </div>
                        </div>
                        <CardTitle className="text-3xl">{plan.name}</CardTitle>
                        <CardDescription className="text-base">{plan.description}</CardDescription>
                        <div className="mt-6">
                          <span className="text-5xl font-bold">₹{plan.price}</span>
                          <span className="text-gray-600 text-lg ml-2">{plan.period}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-4 text-gray-700 text-center">Key Features:</h4>
                          <ul className="space-y-3">
                            {plan.features
                              ?.sort((a, b) => a.display_order - b.display_order)
                              .slice(0, expandedPlanId === plan.id ? undefined : 6)
                              .map((feature, idx) => (
                                <li key={idx} className="flex items-center">
                                  {feature.is_included ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                  ) : (
                                    <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm ${feature.is_included ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {feature.feature_text}
                                  </span>
                                </li>
                              ))}
                          </ul>
                          {(plan.features?.length || 0) > 6 && (
                            <div className="mt-4 text-center">
                              <Button 
                                variant="link" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id);
                                }}
                              >
                                {expandedPlanId === plan.id 
                                  ? 'Show less' 
                                  : `+${(plan.features?.length || 0) - 6} more features`
                                }
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-0">
                        <Button 
                          className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${styling.buttonColor} text-white`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan);
                            setShowRequestForm(true);
                          }}
                        >
                          Request This Plan
                          <ExternalLink className="ml-2 w-5 h-5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tenant Request Form Modal */}
      {selectedPlan && (
        <TenantRequestForm
          selectedPlan={selectedPlan}
          open={showRequestForm}
          onOpenChange={setShowRequestForm}
        />
      )}

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">4 Simple Steps</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              From signup to selling - we've made it incredibly simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="h-full border hover:shadow-lg transition-shadow bg-white">
                  <CardHeader>
                    <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>

                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-16 border-t-2 border-dashed border-gray-300"></div>
                )}
              </motion.div>
            ))}
          </div>

          {/* <div className="text-center mt-12">
            <Button asChild size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg">
              <Link to="/auth">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div> */}
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Shop CMS</h3>
                  <p className="text-sm text-gray-400">Build your online shop in minutes</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The complete e-commerce CMS solution for businesses of all sizes.
                Start selling online today with our powerful platform.
              </p>
              {/* <div className="flex space-x-4">
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Button>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div> */}
            </div>

            {[
              // {
              //   title: 'Product',
              //   links: ['Features', 'Pricing', 'Demo', 'API']
              // },
              // {
              //   title: 'Resources',
              //   links: ['Documentation', 'Tutorials', 'Blog', 'Support']
              // },
              // {
              //   title: 'Company',
              //   links: ['About Us', 'Contact', 'Terms', 'Privacy']
              // }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link to="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Shop CMS. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Build your online shop in minutes • No coding required
              {/* • 14-day free trial */}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlatformHome;

