import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { Member, CheckIn } from '@/types';
import { getMembershipStatus, getDaysUntilExpiry, formatMembershipDuration } from '@/lib/membership';
import { generateMemberQRCode } from '@/lib/qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  QrCode, 
  Edit,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

interface MemberDetailsProps {
  memberId: string;
}

export function MemberDetails({ memberId }: MemberDetailsProps) {
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [memberCheckIns, setMemberCheckIns] = useState<CheckIn[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      const memberData = database.members.getById(memberId);
      if (!memberData) {
        toast({
          title: "Member Not Found",
          description: "The requested member could not be found.",
          variant: "destructive",
        });
        // onNavigate('members');
        return;
      }

      setMember(memberData);
      
      // Load check-ins for this member
      const checkIns = database.checkIns.getByMember(memberData.memberId);
      setMemberCheckIns(checkIns.slice(-10).reverse()); // Show last 10 check-ins
      
      // Generate QR code
      const qrUrl = await generateMemberQRCode(memberData.memberId);
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load member data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading member details...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  const membershipStatus = getMembershipStatus(member);
  const daysUntilExpiry = getDaysUntilExpiry(member);

  const getStatusBadge = () => {
    switch (membershipStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expires in {daysUntilExpiry} days</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired {Math.abs(daysUntilExpiry)} days ago</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (membershipStatus) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expiring':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              // onClick={() => onNavigate('members')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Members</span>
            </Button>
            <div className="flex items-center space-x-3">
              {member.photo ? (
                <img 
                  src={member.photo} 
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h1>
            </div>
          </div>
          <Button 
            onClick={() => {}}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Member</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Personal Information</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    {getStatusBadge()}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{member.firstName} {member.lastName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member ID</label>
                    <p className="text-gray-900 font-mono">{member.memberId}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{member.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{format(new Date(member.dateOfBirth), 'MMM dd, yyyy')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Join Date</label>
                    <p className="text-gray-900">{format(new Date(member.joinDate), 'MMM dd, yyyy')}</p>
                  </div>
                  
                  {member.lastCheckIn && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Visit</label>
                      <p className="text-gray-900">{format(new Date(member.lastCheckIn), 'MMM dd, yyyy - HH:mm')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Membership Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Membership Information</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {member.membershipPlan && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plan</label>
                      <p className="text-gray-900 font-medium">{member.membershipPlan}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-gray-900">{formatMembershipDuration(member.membershipDuration)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-gray-900">{format(new Date(member.startDate), 'MMM dd, yyyy')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-gray-900">{format(new Date(member.endDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {member.membershipPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price Paid</label>
                      <p className="text-gray-900 font-medium">${member.membershipPrice}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge()}</div>
                  </div>
                  
                  {membershipStatus === 'expiring' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Membership expires in {daysUntilExpiry} days
                      </p>
                    </div>
                  )}
                  
                  {membershipStatus === 'expired' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Membership expired {Math.abs(daysUntilExpiry)} days ago
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {member.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-900 whitespace-pre-wrap">{member.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* QR Code & Recent Activity */}
          <div className="space-y-6">
            {/* Member Photo & QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Member Profile</span>
                </CardTitle>
                <CardDescription>
                  Photo and QR code for gym access
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                {/* Member Photo */}
                {member.photo && (
                  <div className="flex justify-center">
                    <img 
                      src={member.photo} 
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  </div>
                )}
                
                {/* QR Code */}
                {qrCodeUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={qrCodeUrl} 
                      alt="Member QR Code" 
                      className="mx-auto border border-gray-200 rounded-lg"
                    />
                    <p className="text-sm text-gray-600">
                      Member ID: {member.memberId}
                    </p>
                  </div>
                ) : (
                  <div className="py-8">
                    <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Generating QR code...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Check-ins</span>
                </CardTitle>
                <CardDescription>
                  Last 10 gym visits
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {memberCheckIns.map((checkIn) => (
                    <div key={checkIn._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(checkIn.date), 'MMM dd, yyyy')}
                        </span>
                        <Badge variant={checkIn.checkOutTime ? "secondary" : "default"}>
                          {checkIn.checkOutTime ? "Completed" : "Active"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>In: {format(new Date(checkIn.checkInTime), 'HH:mm')}</span>
                        </div>
                        {checkIn.checkOutTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Out: {format(new Date(checkIn.checkOutTime), 'HH:mm')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {memberCheckIns.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No check-ins yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}