import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  Sparkles,
  Crown,
  Award,
  Gem,
  Loader2,
  FileText,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getTenantRequests,
  approveTenantRequest,
  rejectTenantRequest,
  getTenantRequestStats,
  type TenantRequest,
} from '@/lib/api/tenantRequests';
import { useAuth } from '@/hooks/useAuth';

export default function TenantRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TenantRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TenantRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, searchQuery]);

  const fetchRequests = async () => {
    try {
      const data = await getTenantRequests();
      setRequests(data);
    } catch (error: any) {
      toast.error('Failed to load tenant requests');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getTenantRequestStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.business_name.toLowerCase().includes(query) ||
          req.contact_email.toLowerCase().includes(query) ||
          req.subdomain.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (request: TenantRequest) => {
    if (!user?.id) return;

    try {
      await approveTenantRequest(request.id, user.id);
      toast.success(`Request from ${request.business_name} approved!`, {
        description: 'Tenant will be created shortly.',
      });
      fetchRequests();
      fetchStats();
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !user?.id || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectTenantRequest(selectedRequest.id, user.id, rejectionReason);
      toast.success('Request rejected');
      fetchRequests();
      fetchStats();
      setIsRejectDialogOpen(false);
      setIsDetailsOpen(false);
      setRejectionReason('');
    } catch (error: any) {
      toast.error('Failed to reject request');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
        icon: <Clock className="w-3 h-3" />,
      },
      approved: {
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      rejected: {
        className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        icon: <XCircle className="w-3 h-3" />,
      },
      completed: {
        className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        icon: <CheckCircle className="w-3 h-3" />,
      },
    };

    const variant = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge className={`${variant.className} border-0`}>
        {variant.icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic':
        return <Gem className="w-5 h-5 text-gray-500" />;
      case 'silver':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'gold':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tenant Requests
          </h1>
          <p className="text-gray-600">
            Review and approve subscription requests from customers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, gradient: 'from-blue-500 to-cyan-500', icon: <TrendingUp /> },
            { label: 'Pending', value: stats.pending, gradient: 'from-yellow-500 to-orange-500', icon: <Clock /> },
            { label: 'Approved', value: stats.approved, gradient: 'from-blue-500 to-indigo-500', icon: <CheckCircle /> },
            { label: 'Rejected', value: stats.rejected, gradient: 'from-red-500 to-rose-500', icon: <XCircle /> },
            { label: 'Completed', value: stats.completed, gradient: 'from-green-500 to-emerald-500', icon: <CheckCircle /> },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-3`}>
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by business name, email, or subdomain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                    <TableHead className="font-semibold">Business</TableHead>
                    <TableHead className="font-semibold">Subdomain</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredRequests.map((request, index) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{request.business_name}</p>
                              <p className="text-xs text-gray-500">{request.contact_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-gray-700">{request.subdomain}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{request.contact_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.subscription_plan && (
                            <div className="flex items-center space-x-2">
                              {getPlanIcon(request.subscription_plan.plan_type)}
                              <div>
                                <p className="font-medium text-sm">{request.subscription_plan.name}</p>
                                <p className="text-xs text-gray-500">
                                  {request.subscription_plan.currency} {request.subscription_plan.price}
                                </p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tenant requests found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedRequest && (
              <div>
                <DialogHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selectedRequest.business_name}</DialogTitle>
                      <DialogDescription>
                        Requested on {new Date(selectedRequest.created_at).toLocaleDateString()}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="mt-4">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Subscription Plan */}
                  {selectedRequest.subscription_plan && (
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          {getPlanIcon(selectedRequest.subscription_plan.plan_type)}
                          <span>Selected Plan: {selectedRequest.subscription_plan.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-gray-900">
                          {selectedRequest.subscription_plan.currency} {selectedRequest.subscription_plan.price}
                          <span className="text-base text-gray-600 ml-2">/month</span>
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Business Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                          Business Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Business Name</p>
                          <p className="font-medium">{selectedRequest.business_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Subdomain</p>
                          <p className="font-medium font-mono">{selectedRequest.subdomain}.shopcms.com</p>
                        </div>
                        {selectedRequest.business_description && (
                          <div>
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-gray-700">{selectedRequest.business_description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center">
                          <User className="w-4 h-4 mr-2 text-purple-600" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Contact Person</p>
                          <p className="font-medium">{selectedRequest.contact_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedRequest.contact_email}</p>
                        </div>
                        {selectedRequest.contact_phone && (
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedRequest.contact_phone}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Message */}
                  {selectedRequest.message && (
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
                      <CardHeader>
                        <CardTitle className="text-base">Additional Message</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{selectedRequest.message}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Rejection Reason (if rejected) */}
                  {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-0">
                      <CardHeader>
                        <CardTitle className="text-base text-red-700">Rejection Reason</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{selectedRequest.rejection_reason}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter className="mt-8">
                  {selectedRequest.status === 'pending' && (
                    <div className="flex space-x-3 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        onClick={() => handleApprove(selectedRequest)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Request
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-red-600 to-rose-600"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
