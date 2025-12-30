import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Globe, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitTenantRequest, checkSubdomainAvailability } from '@/lib/api/tenantRequests';
import type { SubscriptionPlan } from '@/lib/api/subscriptions';

const formSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be less than 63 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  contact_name: z.string().min(2, 'Name must be at least 2 characters'),
  contact_email: z.string().email('Please enter a valid email address'),
  contact_phone: z.string().optional(),
  business_description: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TenantRequestFormProps {
  selectedPlan: SubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenantRequestForm({ selectedPlan, open, onOpenChange }: TenantRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: '',
      subdomain: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      business_description: '',
      message: '',
    },
  });

  const checkSubdomain = async (value: string) => {
    if (value.length < 3) return;
    
    setSubdomainStatus('checking');
    try {
      const isAvailable = await checkSubdomainAvailability(value);
      setSubdomainStatus(isAvailable ? 'available' : 'taken');
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainStatus('idle');
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (subdomainStatus === 'taken') {
      toast.error('This subdomain is already taken');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTenantRequest({
        requested_plan_id: selectedPlan.id,
        ...values,
      });
      
      setIsSuccess(true);
      toast.success('Request submitted successfully!', {
        description: 'We will review your request and get back to you soon.',
      });
      
      setTimeout(() => {
        onOpenChange(false);
        form.reset();
        setIsSuccess(false);
        setSubdomainStatus('idle');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 text-center max-w-sm">
                Thank you for your interest! We'll review your request and contact you soon.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    selectedPlan.plan_type === 'basic' ? 'from-gray-100 to-gray-200' :
                    selectedPlan.plan_type === 'silver' ? 'from-purple-100 to-pink-100' :
                    'from-yellow-100 to-orange-100'
                  } flex items-center justify-center`}>
                    <Sparkles className={`w-6 h-6 ${
                      selectedPlan.plan_type === 'basic' ? 'text-gray-600' :
                      selectedPlan.plan_type === 'silver' ? 'text-purple-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">
                      Request {selectedPlan.name} Plan
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedPlan.currency} {selectedPlan.price}{selectedPlan.period}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  {/* Business Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Business Information</span>
                    </div>

                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="My Amazing Shop" 
                              className="h-11" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subdomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subdomain *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="myshop"
                                className="h-11 pr-10"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                  field.onChange(value);
                                  checkSubdomain(value);
                                }}
                              />
                              {subdomainStatus === 'checking' && (
                                <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
                              )}
                              {subdomainStatus === 'available' && (
                                <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                              )}
                              {subdomainStatus === 'taken' && (
                                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{field.value || 'yourshop'}.shopcms.com</span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="business_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your business..."
                              className="min-h-[80px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <User className="w-4 h-4 text-purple-600" />
                      <span>Contact Information</span>
                    </div>

                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              className="h-11" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contact_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  className="h-11 pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <Input
                                  type="tel"
                                  placeholder="+91-9876543210"
                                  className="h-11 pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>Additional Message (Optional)</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any specific requirements or questions..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || subdomainStatus === 'taken'}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
