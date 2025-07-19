import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface BatchFormProps {
  onAddBatch: (batch: {
    courseName: string;
    batchCode: string;
    totalSeats: number;
    seatsRemaining: number;
    courseCoordinator: string;
  }) => void;
}

export const BatchForm = ({ onAddBatch }: BatchFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '',
    batchCode: '',
    totalSeats: '',
    seatsRemaining: '',
    courseCoordinator: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseName || !formData.batchCode || !formData.totalSeats || !formData.courseCoordinator) {
      return;
    }

    const totalSeats = parseInt(formData.totalSeats);
    const seatsRemaining = formData.seatsRemaining ? parseInt(formData.seatsRemaining) : totalSeats;

    onAddBatch({
      courseName: formData.courseName,
      batchCode: formData.batchCode.toUpperCase(),
      totalSeats,
      seatsRemaining,
      courseCoordinator: formData.courseCoordinator,
    });

    setFormData({
      courseName: '',
      batchCode: '',
      totalSeats: '',
      seatsRemaining: '',
      courseCoordinator: '',
    });
    setIsOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-48 border-2 border-dashed border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 hover:border-muted-foreground/50 transition-all duration-200"
        variant="outline"
      >
        <div className="flex flex-col items-center gap-2">
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground">Add New Batch</span>
        </div>
      </Button>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Add New Batch</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={formData.courseName}
              onChange={(e) => handleChange('courseName', e.target.value)}
              placeholder="e.g., Digital Marketing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchCode">Batch Code</Label>
            <Input
              id="batchCode"
              value={formData.batchCode}
              onChange={(e) => handleChange('batchCode', e.target.value)}
              placeholder="e.g., DM25"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalSeats">Total Seats</Label>
              <Input
                id="totalSeats"
                type="number"
                min="1"
                value={formData.totalSeats}
                onChange={(e) => handleChange('totalSeats', e.target.value)}
                placeholder="30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatsRemaining">Seats Remaining</Label>
              <Input
                id="seatsRemaining"
                type="number"
                min="0"
                max={formData.totalSeats ? parseInt(formData.totalSeats) : undefined}
                value={formData.seatsRemaining}
                onChange={(e) => handleChange('seatsRemaining', e.target.value)}
                placeholder="Same as total"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseCoordinator">Course Coordinator</Label>
            <Input
              id="courseCoordinator"
              value={formData.courseCoordinator}
              onChange={(e) => handleChange('courseCoordinator', e.target.value)}
              placeholder="e.g., Sarah Johnson"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Add Batch
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};