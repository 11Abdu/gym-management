import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { Member, CheckIn } from '@/types';
import { getMembershipStatus } from '@/lib/membership';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Download,
  Activity,
  DollarSign,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export function Reports() {
  const [members, setMembers] = useState<Member[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiringMembers: 0,
    expiredMembers: 0,
    thisMonthCheckIns: 0,
    avgDailyCheckIns: 0,
    revenue: 0,
    newMembersThisMonth: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMembers = database.members.getAll();
    const allCheckIns = database.checkIns.getAll();
    
    setMembers(allMembers);
    setCheckIns(allCheckIns);

    // Calculate stats
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const activeMembers = allMembers.filter(m => getMembershipStatus(m) === 'active');
    const expiringMembers = allMembers.filter(m => getMembershipStatus(m) === 'expiring');
    const expiredMembers = allMembers.filter(m => getMembershipStatus(m) === 'expired');
    
    const thisMonthCheckIns = allCheckIns.filter(c => {
      const checkInDate = new Date(c.date);
      return checkInDate >= monthStart && checkInDate <= monthEnd;
    });

    const newMembersThisMonth = allMembers.filter(m => {
      const joinDate = new Date(m.joinDate);
      return joinDate >= monthStart && joinDate <= monthEnd;
    });

    // Calculate estimated revenue (simplified)
    const revenue = allMembers.reduce((total, member) => {
      const monthlyRate = member.membershipDuration === 1 ? 49 : 
                         member.membershipDuration === 6 ? 42 : 37;
      return total + monthlyRate;
    }, 0);

    setStats({
      totalMembers: allMembers.length,
      activeMembers: activeMembers.length,
      expiringMembers: expiringMembers.length,
      expiredMembers: expiredMembers.length,
      thisMonthCheckIns: thisMonthCheckIns.length,
      avgDailyCheckIns: Math.round(thisMonthCheckIns.length / new Date().getDate()),
      revenue: revenue,
      newMembersThisMonth: newMembersThisMonth.length
    });
  };

  const getCheckInTrend = () => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.date === dateStr);
      return {
        date: format(date, 'MMM dd'),
        checkIns: dayCheckIns.length
      };
    });
  };

  const getMembershipDistribution = () => {
    const distribution = members.reduce((acc, member) => {
      const status = getMembershipStatus(member);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { status: 'Active', count: distribution.active || 0, color: 'bg-green-500' },
      { status: 'Expiring', count: distribution.expiring || 0, color: 'bg-yellow-500' },
      { status: 'Expired', count: distribution.expired || 0, color: 'bg-red-500' }
    ];
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      members: members.length,
      checkIns: checkIns.length
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const checkInTrend = getCheckInTrend();
  const membershipDistribution = getMembershipDistribution();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-gray-600 mt-2">Track your gym's performance and member activity</p>
        </div>
        <Button 
          onClick={exportReport}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
            <p className="text-xs text-gray-500 mt-1">
              +{stats.newMembersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              Estimated monthly recurring
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Check-ins This Month</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.thisMonthCheckIns}</div>
            <p className="text-xs text-gray-500 mt-1">
              ~{stats.avgDailyCheckIns} per day average
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.activeMembers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Check-in Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Check-in Trend (Last 7 Days)</span>
            </CardTitle>
            <CardDescription>Daily check-in activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkInTrend.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max((day.checkIns / Math.max(...checkInTrend.map(d => d.checkIns))) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-medium text-gray-900">{day.checkIns}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Membership Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Membership Status</span>
            </CardTitle>
            <CardDescription>Current member status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {membershipDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <Badge variant="secondary">
                      {stats.totalMembers > 0 ? ((item.count / stats.totalMembers) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Alerts & Notifications</span>
          </CardTitle>
          <CardDescription>Important items requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.expiringMembers > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Memberships Expiring Soon</p>
                    <p className="text-sm text-yellow-700">
                      {stats.expiringMembers} member{stats.expiringMembers !== 1 ? 's' : ''} expiring within 30 days
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  View Members
                </Button>
              </div>
            )}

            {stats.expiredMembers > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Expired Memberships</p>
                    <p className="text-sm text-red-700">
                      {stats.expiredMembers} member{stats.expiredMembers !== 1 ? 's' : ''} with expired memberships
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  View Members
                </Button>
              </div>
            )}

            {stats.expiringMembers === 0 && stats.expiredMembers === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600">All memberships are in good standing!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}