import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/database';
import { Admin } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Shield, 
  Edit,
  Save,
  Eye,
  EyeOff,
  Trash2,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';

export function AdminManagement() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin'
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    const admins = database.admin.getAll();
    setAllAdmins(admins);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }

    // Update admin profile
    if (admin) {
      const updates: Partial<Admin> = {
        name: formData.name,
        email: formData.email
      };
      
      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }

      database.admin.update(admin._id, updates);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }
    
    setIsEditing(false);
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleAddAdmin = () => {
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    const existingAdmin = allAdmins.find(a => a.email === newAdminData.email);
    if (existingAdmin) {
      toast({
        title: "Email Already Exists",
        description: "An admin with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    // Check if trying to create super admin when one already exists
    const existingSuperAdmin = allAdmins.find(a => a.role === 'super_admin');
    if (newAdminData.role === 'super_admin' && existingSuperAdmin) {
      toast({
        title: "Super Admin Already Exists",
        description: "Only one Super Admin is allowed in the system.",
        variant: "destructive",
      });
      return;
    }

    const newAdmin = database.admin.create({
      name: newAdminData.name,
      email: newAdminData.email,
      password: newAdminData.password,
      role: newAdminData.role,
      createdBy: admin?._id
    });

    toast({
      title: "Admin Added",
      description: `${newAdmin.name} has been added as an admin.`,
    });

    setNewAdminData({
      name: '',
      email: '',
      password: '',
      role: 'admin'
    });
    setShowAddAdmin(false);
    loadAdmins();
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (adminId === admin?._id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this admin?')) {
      database.admin.delete(adminId);
      toast({
        title: "Admin Deleted",
        description: "Admin has been successfully deleted.",
      });
      loadAdmins();
    }
  };

  const handleCancel = () => {
    setFormData({
      name: admin?.name || '',
      email: admin?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const isSuperAdmin = admin?.role === 'super_admin';
  const existingSuperAdmin = allAdmins.find(a => a.role === 'super_admin');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 pr-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <span>Admin Management</span>
              </h1>
              <p className="text-gray-600">Manage your admin account settings and team</p>
            </div>
            {isSuperAdmin && (
              <Button 
                onClick={() => setShowAddAdmin(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Admin</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Profile Information</span>
                      </CardTitle>
                      <CardDescription>Update your personal information and credentials</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 btn-light-grey"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Change */}
                  {isEditing && (
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-600">Leave blank to keep current password</p>
                      
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex space-x-4 pt-6 border-t border-gray-200">
                      <Button 
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        className="btn-light-grey"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add New Admin Form */}
              {isSuperAdmin && showAddAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserPlus className="w-5 h-5" />
                      <span>Add New Admin</span>
                    </CardTitle>
                    <CardDescription>Create a new admin account</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newAdminName">Full Name</Label>
                        <Input
                          id="newAdminName"
                          name="name"
                          value={newAdminData.name}
                          onChange={handleNewAdminChange}
                          placeholder="Enter full name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newAdminEmail">Email Address</Label>
                        <Input
                          id="newAdminEmail"
                          name="email"
                          type="email"
                          value={newAdminData.email}
                          onChange={handleNewAdminChange}
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newAdminPassword">Password</Label>
                        <Input
                          id="newAdminPassword"
                          name="password"
                          type="password"
                          value={newAdminData.password}
                          onChange={handleNewAdminChange}
                          placeholder="Enter password"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newAdminRole">Role</Label>
                        <select
                          id="newAdminRole"
                          name="role"
                          value={newAdminData.role}
                          onChange={handleNewAdminChange}
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="admin">Admin</option>
                          {!existingSuperAdmin && (
                            <option value="super_admin">Super Admin</option>
                          )}
                        </select>
                        {existingSuperAdmin && (
                          <p className="text-xs text-gray-500 mt-1">
                            Super Admin role is not available (only one allowed)
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <Button 
                        onClick={handleAddAdmin}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Add Admin
                      </Button>
                      <Button 
                        onClick={() => setShowAddAdmin(false)}
                        className="btn-light-grey"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin List */}
              {isSuperAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Admin Team</span>
                    </CardTitle>
                    <CardDescription>Manage all admin accounts</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {allAdmins.map((adminUser) => (
                        <div key={adminUser._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {adminUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{adminUser.name}</p>
                              <p className="text-sm text-gray-500">{adminUser.email}</p>
                              {adminUser.createdAt && (
                                <p className="text-xs text-gray-400">
                                  Created: {format(new Date(adminUser.createdAt), 'MMM dd, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={adminUser.role === 'super_admin' ? 'default' : 'secondary'}>
                              {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                            {adminUser._id !== admin?._id && (
                              <Button
                                size="sm"
                                onClick={() => handleDeleteAdmin(adminUser._id)}
                                className="btn-light-grey text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Account Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Account Summary</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {admin?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-gray-900">{admin?.name}</h3>
                    <p className="text-sm text-gray-600">{admin?.email}</p>
                    <Badge className={admin?.role === 'super_admin' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                      {admin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Account Type</span>
                      <span className="font-medium text-gray-900">
                        {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Login</span>
                      <span className="font-medium text-gray-900">Today</span>
                    </div>
                    {isSuperAdmin && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Team Size</span>
                        <span className="font-medium text-gray-900">{allAdmins.length} admin{allAdmins.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">System Information</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium text-gray-900">v1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Environment</span>
                    <Badge variant="secondary">Development</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Database</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}