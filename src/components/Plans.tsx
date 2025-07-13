import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check,
  Star,
  Users,
  Calendar
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  duration: number; // in months
  price: number;
  features: string[];
  isPopular?: boolean;
  description: string;
}

export function Plans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      name: 'Basic',
      duration: 1,
      price: 49,
      description: 'Perfect for beginners',
      features: [
        'Access to gym equipment',
        'Locker room access',
        'Basic fitness assessment',
        'Mobile app access'
      ]
    },
    {
      id: '2',
      name: 'Premium',
      duration: 6,
      price: 249,
      description: 'Most popular choice',
      isPopular: true,
      features: [
        'All Basic features',
        'Group fitness classes',
        'Personal trainer consultation',
        'Nutrition guidance',
        'Priority booking',
        'Guest passes (2/month)'
      ]
    },
    {
      id: '3',
      name: 'Elite',
      duration: 12,
      price: 449,
      description: 'Ultimate fitness experience',
      features: [
        'All Premium features',
        'Unlimited personal training',
        'Massage therapy sessions',
        'VIP locker room',
        'Meal planning service',
        'Guest passes (5/month)',
        '24/7 gym access'
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 1,
    price: 0,
    description: '',
    features: ['']
  });

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlan: Plan = {
      id: editingPlan ? editingPlan.id : Date.now().toString(),
      name: formData.name,
      duration: formData.duration,
      price: formData.price,
      description: formData.description,
      features: formData.features.filter(f => f.trim() !== '')
    };

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? newPlan : p));
      toast({
        title: "Plan Updated",
        description: `${newPlan.name} plan has been updated successfully.`,
      });
    } else {
      setPlans(prev => [...prev, newPlan]);
      toast({
        title: "Plan Created",
        description: `${newPlan.name} plan has been created successfully.`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration: 1,
      price: 0,
      description: '',
      features: ['']
    });
    setShowAddForm(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration: plan.duration,
      price: plan.price,
      description: plan.description,
      features: [...plan.features, '']
    });
    setShowAddForm(true);
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(prev => prev.filter(p => p.id !== planId));
      toast({
        title: "Plan Deleted",
        description: "Plan has been deleted successfully.",
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <span>Membership Plans</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your gym membership plans and pricing</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</CardTitle>
            <CardDescription>
              {editingPlan ? 'Update the plan details below' : 'Fill in the details for the new membership plan'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Premium"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the plan"
                  required
                />
              </div>

              <div>
                <Label>Features</Label>
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Enter feature"
                        className="flex-1"
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddFeature}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Most Popular</span>
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
                <span className="text-gray-500">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>${(plan.price / plan.duration).toFixed(0)}/mo</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center space-x-1"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(plan.id)}
                  className="flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plans created yet</h3>
          <p className="text-gray-500 mb-4">Create your first membership plan to get started.</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
        </div>
      )}
    </div>
  );
}