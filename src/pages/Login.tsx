import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { initializeDemoData } from '@/lib/demo-data';
import { toast } from 'sonner';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleDemoLogin = (role: 'admin' | 'staff') => {
    initializeDemoData();
    
    const user = {
      id: role === 'admin' ? 1 : 2,
      name: role === 'admin' ? 'Admin User' : 'Staff User',
      mobile: role === 'admin' ? '9999999999' : '8888888888',
      role,
      token: 'demo-token-' + role,
    };
    
    login(user);
    toast.success(`Logged in as ${role === 'admin' ? 'Admin' : 'Staff'}`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">SchemeWise</h1>
            <p className="text-muted-foreground">Pharma Distribution Management</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border border-input rounded-lg bg-muted text-sm">
                  +91
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                  className="flex-1"
                />
              </div>
            </div>

            <Button className="w-full" size="lg" disabled>
              Send OTP
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Demo Access</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleDemoLogin('admin')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Login as Admin
              </Button>
              <Button
                onClick={() => handleDemoLogin('staff')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Login as Staff
              </Button>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
