import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { Plan } from '@/types';
import { calculateEndDate } from '@/lib/membership';
import { sendWelcomeEmail } from '@/lib/email';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Save, Upload, User, ArrowLeft, Star } from 'lucide-react';
import { format } from 'date-fns';

interface AddMemberProps {
  onNavigate: (page: string) => void;
}

export function AddMember({ onNavigate }: AddMemberProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    membershipDuration: 1,
    membershipPlan: '',
    membershipPrice: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    photo: null as File | null,
    notes: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const activePlans = database.plans.getActive();
    setPlans(activePlans);
    if (activePlans.length > 0) {
      const defaultPlan = activePlans.find(p => p.isPopular) || activePlans[0];
      setSelectedPlan(defaultPlan);
      setFormData(prev => ({
        ...prev,
        membershipDuration: defaultPlan.duration,
        membershipPlan: defaultPlan.name,
        membershipPrice: defaultPlan.price
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'membershipDuration' ? parseInt(value) : value
    }));
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      membershipDuration: plan.duration,
      membershipPlan: plan.name,
      membershipPrice: plan.price
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMemberId = (): string => {
    const prefix = 'GYM';
    // Get all existing member IDs
    const allMembers = database.members.getAll();
    // Extract numbers from IDs like GYM001
    const numbers = allMembers
      .map(m => parseInt(m.memberId.replace(prefix, '')))
      .filter(n => !isNaN(n));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const memberId = generateMemberId();
      const endDate = calculateEndDate(formData.startDate, formData.membershipDuration);
      
      const newMember = database.members.create({
        memberId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        membershipDuration: formData.membershipDuration,
        membershipPlan: formData.membershipPlan,
        membershipPrice: formData.membershipPrice,
        startDate: formData.startDate,
        endDate,
        status: 'active',
        qrCode: memberId,
        joinDate: formData.startDate,
        photo: photoPreview,
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        notes: formData.notes
      });

      await sendWelcomeEmail(newMember);

      toast({
        title: "Member Added Successfully",
        description: `${newMember.firstName} ${newMember.lastName} has been added with ID: ${newMember.memberId}`,
      });

      onNavigate('members');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endDate = calculateEndDate(formData.startDate, formData.membershipDuration);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 pr-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('members')}
              className="flex items-center space-x-2 btn-light-grey"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <UserPlus className="w-6 h-6 text-blue-600" />
                <span>Add New Member</span>
              </h1>
              <p className="text-gray-600">Create a new gym membership account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Member Information</CardTitle>
                  <CardDescription>Fill out the form below to add a new gym member</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {photoPreview ? (
                            <img 
                              src={photoPreview} 
                              alt="Profile preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <Label htmlFor="photo" className="cursor-pointer">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span>Upload Photo</span>
                            </div>
                          </Label>
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Any additional notes about the member..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        onClick={() => onNavigate('members')}
                        className="btn-light-grey"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding Member...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Save className="w-4 h-4" />
                            <span>Add Member</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Plans Selection */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Select Membership Plan</CardTitle>
                  <CardDescription>Choose a plan for the new member</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      onClick={() => handlePlanSelect(plan)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPlan?._id === plan._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        {plan.isPopular && (
                          <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            <Star className="w-3 h-3" />
                            <span>Popular</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">${plan.price}</span>
                        <span className="text-sm text-gray-500">
                          {plan.duration} month{plan.duration > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <p key={index} className="text-xs text-gray-600">• {feature}</p>
                        ))}
                        {plan.features.length > 3 && (
                          <p className="text-xs text-gray-500">+{plan.features.length - 3} more features</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedPlan && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Plan Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Plan:</span>
                          <span className="font-medium">{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedPlan.duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">${selectedPlan.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span>{format(new Date(endDate), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}