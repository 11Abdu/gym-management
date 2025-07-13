import { useState, useEffect,  } from 'react';
import { database } from '@/lib/database';
import { Member, CheckIn } from '@/types';
import { getMembershipStatus } from '@/lib/membership';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  User, 
  Clock,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface QRCheckInProps {
  onNavigate: (page: string) => void;
}

export function QRCheckIn({ onNavigate }: QRCheckInProps) {
  const { toast } = useToast();
  const [manualMemberId, setManualMemberId] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    loadTodayCheckIns();
  }, []);

  const loadTodayCheckIns = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkIns = database.checkIns.getByDate(today);
    setTodayCheckIns(checkIns);
  };

  const handleCheckIn = async (memberId: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const member = database.members.getByMemberId(memberId);
      
      if (!member) {
        toast({
          title: "Member Not Found",
          description: `No member found with ID: ${memberId}`,
          variant: "destructive",
        });
        return;
      }

      const membershipStatus = getMembershipStatus(member);
      
      if (membershipStatus === 'expired') {
        toast({
          title: "Membership Expired",
          description: `${member.firstName} ${member.lastName}'s membership has expired.`,
          variant: "destructive",
        });
        setCurrentMember(member);
        return;
      }

      // Check if member is already checked in today
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingCheckIn = todayCheckIns.find(
        checkIn => checkIn.memberId === member.memberId && !checkIn.checkOutTime
      );

      if (existingCheckIn) {
        // Check out the member
        const updatedCheckIn = database.checkIns.update(existingCheckIn._id, {
          checkOutTime: new Date().toISOString()
        });

        if (updatedCheckIn) {
          setLastCheckIn(updatedCheckIn);
          setCurrentMember(member);
          
          // Update member's last check-in
          database.members.update(member._id, {
            lastCheckIn: new Date().toISOString()
          });

          toast({
            title: "Check-out Successful",
            description: `${member.firstName} ${member.lastName} has been checked out.`,
          });
          
          loadTodayCheckIns();
        }
      } else {
        // Check in the member
        const newCheckIn = database.checkIns.create({
          memberId: member.memberId,
          memberName: `${member.firstName} ${member.lastName}`,
          checkInTime: new Date().toISOString(),
          date: today
        });

        setLastCheckIn(newCheckIn);
        setCurrentMember(member);
        
        // Update member's last check-in
        database.members.update(member._id, {
          lastCheckIn: new Date().toISOString()
        });

        toast({
          title: "Check-in Successful",
          description: `Welcome ${member.firstName} ${member.lastName}!`,
        });
        
        loadTodayCheckIns();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setManualMemberId('');
    }
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMemberId.trim()) {
      handleCheckIn(manualMemberId.trim().toUpperCase());
    }
  };

  const getStatusBadge = (member: Member) => {
    const status = getMembershipStatus(member);
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <QrCode className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">QR Check-in</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Check-in Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Member Check-in</span>
                </CardTitle>
                <CardDescription>
                  Scan QR code or enter member ID manually
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* QR Scanner Placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">QR Code Scanner</p>
                  <p className="text-sm text-gray-500">
                    In a production environment, this would integrate with a camera-based QR scanner
                  </p>
                </div>

                {/* Manual Entry */}
                <div>
                  <form onSubmit={handleManualCheckIn} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or enter Member ID manually:
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          value={manualMemberId}
                          onChange={(e) => setManualMemberId(e.target.value.toUpperCase())}
                          placeholder="Enter Member ID (e.g., GYM001)"
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          disabled={isProcessing || !manualMemberId.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Check In'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Last Check-in Result */}
            {currentMember && lastCheckIn && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-green-800">
                    {lastCheckIn.checkOutTime ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <span>
                      {lastCheckIn.checkOutTime ? 'Check-out' : 'Check-in'} Successful
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Member:</span>
                      <span className="text-sm text-green-700">
                        {currentMember.firstName} {currentMember.lastName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Member ID:</span>
                      <span className="text-sm text-green-700">{currentMember.memberId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Time:</span>
                      <span className="text-sm text-green-700">
                        {format(new Date(lastCheckIn.checkOutTime || lastCheckIn.checkInTime), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Status:</span>
                      {getStatusBadge(currentMember)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expired Member Warning */}
            {currentMember && getMembershipStatus(currentMember) === 'expired' && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span>Membership Expired</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">Member:</span>
                      <span className="text-sm text-red-700">
                        {currentMember.firstName} {currentMember.lastName} ({currentMember.memberId})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">Expired:</span>
                      <span className="text-sm text-red-700">
                        {format(new Date(currentMember.endDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-red-700">
                      Please ask the member to renew their membership before allowing gym access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Today's Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Today's Check-ins</span>
              </CardTitle>
              <CardDescription>
                Members currently in the gym or who visited today
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayCheckIns.map((checkIn) => (
                  <div 
                    key={checkIn._id} 
                    className={`p-3 rounded-lg border ${
                      checkIn.checkOutTime 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {checkIn.memberName}
                        </span>
                      </div>
                      <Badge variant={checkIn.checkOutTime ? "secondary" : "default"}>
                        {checkIn.checkOutTime ? "Left" : "In Gym"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                
                {todayCheckIns.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No check-ins today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}