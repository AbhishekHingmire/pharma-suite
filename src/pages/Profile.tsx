import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { User, Phone, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Profile() {
  const { user, login } = useAuthStore();
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [pendingMobile, setPendingMobile] = useState('');

  const handleSendOtp = () => {
    if (!pendingMobile || pendingMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    
    // Simulate OTP sending
    setIsOtpSent(true);
    toast.success('OTP sent to your mobile number');
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // Simulate OTP verification (in real app, this would be API call)
    if (otp === '123456') {
      // Update user mobile
      if (user) {
        const updatedUser = { ...user, mobile: pendingMobile };
        login(updatedUser);
        setMobile(pendingMobile);
      }
      
      toast.success('Mobile number updated successfully');
      setIsOtpModalOpen(false);
      setOtp('');
      setIsOtpSent(false);
      setPendingMobile('');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleUpdateMobile = () => {
    setPendingMobile(mobile);
    setIsOtpModalOpen(true);
    setIsOtpSent(false);
    setOtp('');
  };

  const handleCancelUpdate = () => {
    setMobile(user?.mobile || '');
    setIsOtpModalOpen(false);
    setOtp('');
    setIsOtpSent(false);
    setPendingMobile('');
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-2">Profile Information</h2>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={user?.name} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact admin to change your name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                value={user?.role} 
                disabled 
                className="bg-muted capitalize"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
                <Button
                  onClick={handleUpdateMobile}
                  disabled={mobile === user?.mobile || !mobile || mobile.length !== 10}
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                OTP verification required to update mobile number
              </p>
            </div>
          </div>
        </Card>

        {/* OTP Verification Modal */}
        <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Mobile Number</DialogTitle>
              <DialogDescription>
                Enter the OTP sent to {pendingMobile} to update your mobile number
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {!isOtpSent ? (
                <>
                  <div className="space-y-2">
                    <Label>New Mobile Number</Label>
                    <Input
                      value={pendingMobile}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button onClick={handleSendOtp} className="w-full">
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Use OTP: 123456 for testing
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleVerifyOtp} className="flex-1">
                      Verify OTP
                    </Button>
                    <Button onClick={handleSendOtp} variant="outline">
                      Resend OTP
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCancelUpdate} 
                    variant="ghost" 
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
