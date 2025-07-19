import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Mail, UserCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'project_lead' | 'tech_lead' | 'finance_lead' | 'design_lead';
  department: 'marketing' | 'tech' | 'finance' | 'design';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { toast } = useToast();

  const [inviteData, setInviteData] = useState({
    email: '',
    full_name: '',
    role: '',
    department: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData.email || !inviteData.full_name || !inviteData.role || !inviteData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll create a dummy password since the user will need to set their own
      const tempPassword = 'TempPassword123!';
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: inviteData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: inviteData.full_name,
          role: inviteData.role,
          department: inviteData.department
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Invited",
        description: `${inviteData.full_name} has been invited successfully.`,
      });

      setInviteData({
        email: '',
        full_name: '',
        role: '',
        department: '',
      });
      setIsInviteOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to invite user.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        toast({
          title: "Error",
          description: "Failed to update user status.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));

      toast({
        title: "User Updated",
        description: `User has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'project_lead': return 'default';
      case 'tech_lead': return 'secondary';
      case 'finance_lead': return 'outline';
      case 'design_lead': return 'success';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-name">Full Name *</Label>
                <Input
                  id="invite-name"
                  value={inviteData.full_name}
                  onChange={(e) => setInviteData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role *</Label>
                  <Select 
                    value={inviteData.role} 
                    onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="project_lead">Project Lead</SelectItem>
                      <SelectItem value="tech_lead">Tech Lead</SelectItem>
                      <SelectItem value="finance_lead">Finance Lead</SelectItem>
                      <SelectItem value="design_lead">Design Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-department">Department *</Label>
                  <Select 
                    value={inviteData.department} 
                    onValueChange={(value) => setInviteData(prev => ({ ...prev, department: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dept" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Inviting..." : "Send Invite"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{user.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{user.department}</p>
                </div>
                <Badge variant={user.is_active ? 'success' : 'outline'}>
                  {user.is_active ? (
                    <>
                      <UserCheck className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={getRoleBadgeVariant(user.role) as any}>
                  {user.role.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(user.created_at)}
                </span>
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Status</span>
                <Switch 
                  checked={user.is_active}
                  onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="col-span-full text-center py-8">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found.</p>
            <p className="text-sm text-muted-foreground mt-2">Invite your first user to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};