import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseBatches } from '@/hooks/useSupabaseBatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Users, Minus, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BatchManagement = () => {
  const { profile, canManageBatches } = useAuth();
  const { batches, createBatch, updateBatch, isLoading } = useSupabaseBatches();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_capacity: '',
    department: '',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.max_capacity || !formData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const success = await createBatch({
      name: formData.name,
      description: formData.description || undefined,
      max_capacity: parseInt(formData.max_capacity),
      department: formData.department as 'marketing' | 'tech' | 'finance' | 'design',
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });

    if (success) {
      setFormData({
        name: '',
        description: '',
        max_capacity: '',
        department: '',
        start_date: '',
        end_date: '',
      });
      setIsCreateOpen(false);
    }
  };

  const handleUpdateEnrollment = async (batchId: string, change: number) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const newCount = Math.max(0, Math.min(batch.max_capacity, batch.current_count + change));
    const newStatus = newCount === batch.max_capacity ? 'full' : 'open';

    await updateBatch(batchId, { 
      current_count: newCount,
      status: newStatus 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'full': return 'destructive';
      case 'closed': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Batch Management</h2>
        {canManageBatches() && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Batch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Digital Marketing 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the batch"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_capacity">Max Capacity *</Label>
                    <Input
                      id="max_capacity"
                      type="number"
                      min="1"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: e.target.value }))}
                      placeholder="30"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creating..." : "Create Batch"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => {
          const enrollmentPercentage = (batch.current_count / batch.max_capacity) * 100;
          const isEditing = editingBatch === batch.id;

          return (
            <Card key={batch.id} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{batch.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{batch.department}</p>
                  </div>
                  <Badge variant={getStatusColor(batch.status) as any}>
                    {batch.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {batch.description && (
                  <p className="text-sm text-muted-foreground">{batch.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Enrollment</span>
                    <span className="font-medium">{batch.current_count}/{batch.max_capacity}</span>
                  </div>
                  <Progress value={enrollmentPercentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(enrollmentPercentage)}% filled</span>
                    <span>{batch.max_capacity - batch.current_count} remaining</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Start:</span>
                    <span>{formatDate(batch.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">End:</span>
                    <span>{formatDate(batch.end_date)}</span>
                  </div>
                </div>

                {canManageBatches() && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateEnrollment(batch.id, -1)}
                          disabled={batch.current_count <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{batch.current_count}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateEnrollment(batch.id, 1)}
                          disabled={batch.current_count >= batch.max_capacity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Updated {formatDate(batch.updated_at)}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {batches.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No batches found.</p>
            {canManageBatches() && (
              <p className="text-sm text-muted-foreground mt-2">Create your first batch to get started.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};