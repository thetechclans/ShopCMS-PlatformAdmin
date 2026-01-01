import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  X as XIcon,
  Loader2,
  Crown,
  Award,
  Gem,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  addSubscriptionFeature,
  updateSubscriptionFeature,
  deleteSubscriptionFeature,
  type SubscriptionPlan,
  type CreateSubscriptionPlanInput,
} from '@/lib/api/subscriptions';

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSubscriptionPlanInput & { price_usd?: number | null }>({
    plan_type: 'basic',
    name: '',
    price: 0,
    price_usd: null,
    currency: 'INR',
    period: '/month',
    description: '',
    is_popular: false,
    is_active: true,
    display_order: 0,
  });

  const [newFeature, setNewFeature] = useState('');
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingFeatureText, setEditingFeatureText] = useState('');
  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getAllSubscriptionPlans();
      setPlans(data);
    } catch (error: any) {
      toast.error('Failed to load subscription plans');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      plan_type: 'basic',
      name: '',
      price: 0,
      currency: 'INR',
      period: '/month',
      description: '',
      is_popular: false,
      is_active: true,
      display_order: plans.length,
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_type: plan.plan_type,
      name: plan.name,
      price: plan.price,
      price_usd: plan.price_usd,
      currency: plan.currency,
      period: plan.period,
      description: plan.description,
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      display_order: plan.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, formData);
        toast.success('Subscription plan updated successfully');
      } else {
        await createSubscriptionPlan(formData);
        toast.success('Subscription plan created successfully');
      }
      await fetchPlans();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save subscription plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete the ${planName} plan?`)) return;

    try {
      await deleteSubscriptionPlan(planId);
      toast.success('Subscription plan deleted');
      await fetchPlans();
    } catch (error: any) {
      toast.error('Failed to delete plan');
    }
  };

  const handleAddFeature = async (planId: string) => {
    if (!newFeature.trim()) return;

    try {
      await addSubscriptionFeature(planId, newFeature, true);
      toast.success('Feature added');
      setNewFeature('');
      await fetchPlans();
    } catch (error: any) {
      toast.error('Failed to add feature');
    }
  };

  const handleDeleteFeature = async (featureId: string, planId: string) => {
    try {
      await deleteSubscriptionFeature(featureId);
      toast.success('Feature deleted');
      await fetchPlans();
    } catch (error: any) {
      toast.error('Failed to delete feature');
    }
  };

  const handleEditFeature = (feature: any) => {
    setEditingFeatureId(feature.id);
    setEditingFeatureText(feature.feature_text);
  };

  const handleSaveFeature = async () => {
    if (!editingFeatureId || !editingFeatureText.trim()) return;

    try {
      await updateSubscriptionFeature(editingFeatureId, {
        feature_text: editingFeatureText,
      });
      toast.success('Feature updated');
      setEditingFeatureId(null);
      setEditingFeatureText('');
      await fetchPlans();
    } catch (error: any) {
      toast.error('Failed to update feature');
    }
  };

  const handleDragStart = (featureId: string) => {
    setDraggedFeature(featureId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetFeatureId: string, plan: SubscriptionPlan) => {
    e.preventDefault();
    if (!draggedFeature || draggedFeature === targetFeatureId) {
      setDraggedFeature(null);
      return;
    }

    const features = plan.features || [];
    const draggedIndex = features.findIndex(f => f.id === draggedFeature);
    const targetIndex = features.findIndex(f => f.id === targetFeatureId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    try {
      const draggedItem = features[draggedIndex];
      const targetItem = features[targetIndex];

      await updateSubscriptionFeature(draggedItem.id, {
        display_order: targetItem.display_order,
      });
      await updateSubscriptionFeature(targetItem.id, {
        display_order: draggedItem.display_order,
      });

      toast.success('Feature reordered');
      await fetchPlans();
    } catch (error) {
      toast.error('Failed to reorder features');
    } finally {
      setDraggedFeature(null);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'basic':
        return <Gem className="w-6 h-6 text-gray-500" />;
      case 'silver':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'gold':
        return <Award className="w-6 h-6 text-yellow-500" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getPlanGradient = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 'from-gray-50 to-gray-100';
      case 'silver':
        return 'from-purple-50 to-pink-50';
      case 'gold':
        return 'from-yellow-50 to-orange-50';
      default:
        return 'from-blue-50 to-cyan-50';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Subscription Management
              </h1>
              <p className="text-gray-600">
                Manage subscription plans, pricing, and features
              </p>
            </div>
            <Button
              onClick={handleCreatePlan}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border-2 hover:shadow-xl transition-all duration-300 ${
                plan.is_popular ? 'border-yellow-400 shadow-lg' : 'border-gray-200'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getPlanGradient(
                  plan.plan_type
                )} opacity-30 rounded-lg -z-10`}
              />

              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPlanIcon(plan.plan_type)}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {plan.is_active ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    {plan.price_usd && (
                      <span className="text-xl font-semibold text-green-600">
                        / ${plan.price_usd}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)
                      }
                    >
                      <h4 className="font-semibold text-gray-700">
                        Features ({plan.features?.length || 0})
                      </h4>
                      {expandedPlanId === plan.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>

                    {expandedPlanId === plan.id && (
                      <div className="mt-3 space-y-1 max-h-96 overflow-y-auto">
                        {plan.features
                          ?.sort((a, b) => a.display_order - b.display_order)
                          .map((feature, index) => (
                            <div
                              key={feature.id}
                              draggable
                              onDragStart={() => handleDragStart(feature.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, feature.id, plan)}
                              className={`flex items-center gap-2 text-sm p-2 rounded border transition-all ${
                                draggedFeature === feature.id
                                  ? 'opacity-50 scale-95'
                                  : 'hover:bg-blue-50/50 hover:border-blue-200'
                              } ${editingFeatureId === feature.id ? 'bg-blue-50' : 'bg-white'}`}
                            >
                              <div className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>

                              {editingFeatureId === feature.id ? (
                                <Input
                                  value={editingFeatureText}
                                  onChange={(e) => setEditingFeatureText(e.target.value)}
                                  className="flex-1 h-8"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveFeature();
                                    if (e.key === 'Escape') {
                                      setEditingFeatureId(null);
                                      setEditingFeatureText('');
                                    }
                                  }}
                                />
                              ) : (
                                <span className="flex-1 text-gray-700">{feature.feature_text}</span>
                              )}

                              <div className="flex items-center gap-1">
                                {editingFeatureId === feature.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleSaveFeature}
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingFeatureId(null);
                                        setEditingFeatureText('');
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <XIcon className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditFeature(feature)}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Edit className="w-3 h-3 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteFeature(feature.id, plan.id)}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}

                        {/* Add Feature */}
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                          <Input
                            placeholder="New feature..."
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddFeature(plan.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddFeature(plan.id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? 'Update the subscription plan details'
                  : 'Add a new subscription plan to your platform'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan Type *</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md"
                    value={formData.plan_type}
                    onChange={(e) =>
                      setFormData({ ...formData, plan_type: e.target.value as any })
                    }
                    disabled={!!editingPlan}
                  >
                    <option value="basic">Basic</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>

                <div>
                  <Label>Plan Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., Silver"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (INR) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    placeholder="e.g. 800"
                  />
                </div>

                <div>
                  <Label>Price (USD) - International</Label>
                  <Input
                    type="number"
                    value={formData.price_usd || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price_usd: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    placeholder="e.g. 10"
                  />
                  <p className="text-xs text-gray-500 mt-1">For users outside India</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Period</Label>
                  <Input
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the plan"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_popular: checked })
                    }
                  />
                  <Label>Mark as Popular</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>

                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <XIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSavePlan}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
