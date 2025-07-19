import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Bell, ArrowRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Batch Alert System</h1>
                <p className="text-sm text-muted-foreground">Academy Management Platform</p>
              </div>
            </div>
            
            <Link to="/auth">
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Streamline Your <span className="text-primary">Batch Management</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Monitor batch enrollments, receive instant notifications, and manage your academy efficiently with real-time alerts.
        </p>
        <Link to="/auth">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Batch Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track batch capacity, enrollment status, and manage multiple courses across departments.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Instant Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get real-time alerts when batches become full via webhook integrations with Zoho Cliq and other platforms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Role-based access control for admins, project leads, and department coordinators.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
