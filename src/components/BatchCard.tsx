import { Batch } from '@/types/batch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, UserCheck, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface BatchCardProps {
  batch: Batch;
  onUpdateSeats: (id: string, seatsRemaining: number) => void;
}

export const BatchCard = ({ batch, onUpdateSeats }: BatchCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSeats, setTempSeats] = useState(batch.seatsRemaining);

  const occupancyPercentage = ((batch.totalSeats - batch.seatsRemaining) / batch.totalSeats) * 100;

  const handleSeatUpdate = (change: number) => {
    const newSeats = Math.max(0, Math.min(batch.totalSeats, tempSeats + change));
    setTempSeats(newSeats);
  };

  const handleSave = () => {
    onUpdateSeats(batch.id, tempSeats);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSeats(batch.seatsRemaining);
    setIsEditing(false);
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg border-l-4" 
          style={{ borderLeftColor: batch.status === 'Full' ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{batch.courseName}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">{batch.batchCode}</p>
          </div>
          <Badge variant={batch.status === 'Full' ? 'destructive' : 'success'}>
            {batch.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span className="font-medium">{batch.totalSeats - batch.seatsRemaining}/{batch.totalSeats}</span>
          </div>
          <Progress value={occupancyPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(occupancyPercentage)}% filled</span>
            <span>{batch.seatsRemaining} remaining</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Coordinator:</span>
            <span className="font-medium">{batch.courseCoordinator}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span>{batch.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Seats Remaining:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSeatUpdate(-1)}
                    disabled={tempSeats <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="min-w-[2rem] text-center font-mono">{tempSeats}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSeatUpdate(1)}
                    disabled={tempSeats >= batch.totalSeats}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="flex-1">
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Available Seats:</span>
                <span className="font-bold text-lg">{batch.seatsRemaining}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Update
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};