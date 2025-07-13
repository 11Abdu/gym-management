import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/database';
import { Member, CheckIn } from '@/types';
import { getMembershipStatus, getDaysUntilExpiry } from '@/lib/membership';
import { checkAndSendExpirationReminders } from '@/lib/email';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Dumbbell,
  Mail,
  QrCode,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiringMembers: 0,
    todayCheckIns: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMembers = database.members.getAll();
    const today = format(new Date(), 'yyyy-MM-dd');
    const checkIns = database.checkIns.getByDate(today);
    
    setMembers(allMembers);
    setTodayCheckIns(checkIns);
    
    const activeMembers = allMembers.filter(member => getMembershipStatus(member) === 'active');
    const expiringMembers = allMembers.filter(member => {
      const status = getMembershipStatus(member);
      return status === 'expiring' || (status === 'expired' && getDaysUntilExpiry(member) >= -7);
    });
    
    setStats({
      totalMembers: allMembers.length,
      activeMembers: activeMembers.length,
      expiringMembers: expiringMembers.length,
      todayCheckIns: checkIns.length
    });
  };

  const handleSendExpirationReminders = async () => {
    try {
      await checkAndSendExpirationReminders(members);
      toast({
        title: "Reminders Sent",
        description: "Expiration reminders have been sent to eligible members.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send expiration reminders.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (member: Member) => {
    const status = getMembershipStatus(member);
    const days = getDaysUntilExpiry(member);
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expires in {days} days</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
    }
  };

  const recentMembers = members.slice(-5).reverse();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 pr-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {admin?.name}!</h1>
            <p className="text-gray-600">Here's what's happening at FitZone Gym today</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
              <p className="text-xs text-gray-500 mt-1">Registered members</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeMembers}</div>
              <p className="text-xs text-gray-500 mt-1">With valid memberships</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.expiringMembers}</div>
              <p className="text-xs text-gray-500 mt-1">Need renewal</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Check-ins</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.todayCheckIns}</div>
              <p className="text-xs text-gray-500 mt-1">Members visited today</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-6 gap-3">
          <Button 
            onClick={() => onNavigate('add-member')}
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 flex flex-col items-center justify-center space-y-1"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-xs">Add Member</span>
          </Button>
          
          <Button 
            onClick={() => onNavigate('members')}
            className="h-14 flex flex-col items-center justify-center space-y-1 btn-light-grey"
          >
            <Users className="w-4 h-4" />
            <span className="text-xs">Members</span>
          </Button>
          
          <Button 
            onClick={() => onNavigate('plans')}
            className="h-14 flex flex-col items-center justify-center space-y-1 btn-light-grey"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Plans</span>
          </Button>
          
          <Button 
            onClick={() => onNavigate('checkin')}
            className="h-14 flex flex-col items-center justify-center space-y-1 btn-light-grey"
          >
            <QrCode className="w-4 h-4" />
            <span className="text-xs">QR Scanner</span>
          </Button>
          
          <Button 
            onClick={() => onNavigate('reports')}
            className="h-14 flex flex-col items-center justify-center space-y-1 btn-light-grey"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Reports</span>
          </Button>
          
          <Button 
            onClick={handleSendExpirationReminders}
            className="h-14 flex flex-col items-center justify-center space-y-1 btn-light-grey"
          >
            <Mail className="w-4 h-4" />
            <span className="text-xs">Reminders</span>
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Recent Members */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Recent Members</span>
              </CardTitle>
              <CardDescription>Latest member registrations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {recentMembers.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(member)}
                  </div>
                ))}
                {recentMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No members yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Check-ins */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Today's Activity</span>
              </CardTitle>
              <CardDescription>Members who checked in today</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {todayCheckIns.slice(0, 8).map((checkIn) => (
                  <div key={checkIn._id} className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{checkIn.memberName}</p>
                        <p className="text-xs text-gray-500">
                          Check-in: {format(new Date(checkIn.checkInTime), 'HH:mm')}
                          {checkIn.checkOutTime && (
                            <span> • Check-out: {format(new Date(checkIn.checkOutTime), 'HH:mm')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant={checkIn.checkOutTime ? "secondary" : "default"}>
                      {checkIn.checkOutTime ? "Completed" : "Active"}
                    </Badge>
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