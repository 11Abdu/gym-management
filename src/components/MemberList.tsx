import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { Member } from '@/types';
import { getMembershipStatus, getDaysUntilExpiry, formatMembershipDuration } from '@/lib/membership';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Phone,
  Mail,
  Calendar,
  QrCode,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface MemberListProps {
  onNavigate: (page: string, memberId?: string) => void;
}

export function MemberList({ onNavigate }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, filterStatus]);

  const loadMembers = () => {
    const allMembers = database.members.getAll();
    setMembers(allMembers);
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => {
        const status = getMembershipStatus(member);
        return status === filterStatus;
      });
    }

    setFilteredMembers(filtered);
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      const success = database.members.delete(memberId);
      if (success) {
        toast({
          title: "Member Deleted",
          description: "Member has been successfully deleted.",
        });
        loadMembers();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete member.",
          variant: "destructive",
        });
      }
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
        return <Badge variant="destructive">Expired {Math.abs(days)} days ago</Badge>;
    }
  };

  const statusCounts = {
    all: members.length,
    active: members.filter(m => getMembershipStatus(m) === 'active').length,
    expiring: members.filter(m => getMembershipStatus(m) === 'expiring').length,
    expired: members.filter(m => getMembershipStatus(m) === 'expired').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 pr-8 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Manage Members</span>
            </h1>
            <p className="text-gray-600">View and manage all gym members</p>
          </div>
          <Button 
            onClick={() => onNavigate('add-member')}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members by name, email, or member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "ghost"}
                onClick={() => setFilterStatus(status as any)}
                className={`flex items-center space-x-2 ${
                  filterStatus === status 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'btn-light-grey'
                }`}
                size="sm"
              >
                <span className="capitalize">{status}</span>
                <Badge variant="secondary" className="ml-1">{count}</Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
          <Card>
            <CardHeader>
              <CardTitle>Members ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <div key={member._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {member.photo ? (
                            <img 
                              src={member.photo} 
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {member.firstName} {member.lastName}
                            </h3>
                            <span className="text-sm text-gray-500">ID: {member.memberId}</span>
                            {getStatusBadge(member)}
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{member.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatMembershipDuration(member.membershipDuration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Expires: {format(new Date(member.endDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => onNavigate('member-details', member._id)}
                          className="btn-light-grey flex items-center space-x-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => onNavigate('edit-member', member._id)}
                          className="btn-light-grey flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDeleteMember(member._id)}
                          className="btn-light-grey text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters.' 
                      : 'Get started by adding your first member.'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <Button 
                      onClick={() => onNavigate('add-member')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}