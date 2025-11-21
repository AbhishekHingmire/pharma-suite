import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSystemSettings, saveSystemSettings } from '@/lib/storage';
import { initializeHRDemoData } from '@/lib/hr-demo-data';
import { useState, useEffect } from 'react';
import { Shield, Users, Activity, Calendar, TrendingUp, Database, Clock } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const currentSettings = getSystemSettings();
    setSettings(currentSettings);
  }, []);

  const handleToggleHR = (enabled: boolean) => {
    const updated = {
      ...settings,
      modules: {
        ...settings.modules,
        hr: {
          ...settings.modules.hr,
          enabled,
        },
      },
      subscription: {
        ...settings.subscription,
        hrModuleActive: enabled,
      },
    };
    setSettings(updated);
    saveSystemSettings(updated);
    
    // Initialize demo data when enabling HR module
    if (enabled) {
      initializeHRDemoData();
      toast.success('HR Module activated with demo data!');
    } else {
      toast.success('HR Module deactivated');
    }
  };

  const handleLoadDemoData = () => {
    initializeHRDemoData();
    toast.success('Demo data loaded successfully!');
    // Reload page to show new data
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  if (!settings) return null;

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl space-y-5">
        <div>
          <h2 className="text-base font-bold mb-1">Settings</h2>
          <p className="text-xs text-muted-foreground">
            Manage your system configuration and preferences
          </p>
        </div>

        {/* Module Management */}
        <Card className="p-5 border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                System Modules
              </h3>
              <p className="text-xs text-muted-foreground">
                Activate or deactivate features based on your subscription
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {settings.subscription.plan === 'professional' ? 'Professional' : settings.subscription.plan}
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Inventory Module */}
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-semibold">Inventory Management</h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Core</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Stock, Purchase, Sales, Payments & Reports
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                  Always Active
                </Badge>
              </div>
            </div>

            {/* Basic HR - Always Active */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Users className="w-3.5 h-3.5 text-green-600" />
                  <h4 className="text-xs font-semibold text-green-800">Basic HR - Activity Tracking</h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-300">
                    Always Active
                  </Badge>
                </div>
                <p className="text-[11px] text-green-700 mb-2">
                  Employee timeline automatically tracks inventory activities
                </p>
                <div className="flex items-center gap-3 text-[10px] text-green-600">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Activity Timeline
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Performance Tracking
                  </span>
                </div>
              </div>
            </div>

            {/* Full HR Module - Subscription */}
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-semibold">Full HR - Attendance & Leave</h4>
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-blue-600">Pro</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Full workforce management: Attendance, Leave, Shift Management
                </p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Attendance
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Leave Management
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Shift Scheduling
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.modules.hr.enabled}
                  onCheckedChange={handleToggleHR}
                />
              </div>
            </div>

            {settings.modules.hr.enabled && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-[11px] text-blue-800 font-medium mb-2">
                  ✨ HR Module is active - Employee timeline automatically tracks inventory activities
                </p>
                <p className="text-[10px] text-blue-600 mb-2">
                  Sales, purchases, and payments are now linked to employees for performance tracking
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDemoData}
                  className="h-7 text-[10px] gap-1 bg-white"
                >
                  <Database className="w-3 h-3" />
                  Load Demo Data
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Company Settings */}
        <Card className="p-4">
          <h3 className="text-xs font-bold mb-3">Business Information</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs">Business Name</Label>
              <Input id="businessName" defaultValue="RAMESH MEDICALS" className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">Address</Label>
              <Input id="address" defaultValue="Pune, Maharashtra" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gstin" className="text-xs">GSTIN</Label>
                <Input id="gstin" placeholder="27XXXXX1234X1ZX" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Phone</Label>
                <Input id="phone" type="tel" defaultValue="+91 9876543210" className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" defaultValue="info@rameshmedicals.com" className="h-8 text-xs" />
            </div>
          </div>
        </Card>

        {/* Banking Details */}
        <Card className="p-4">
          <h3 className="text-xs font-bold mb-3">Banking Details</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
              <Input id="bankName" placeholder="Bank Name" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="accountNo" className="text-xs">Account Number</Label>
                <Input id="accountNo" placeholder="Account Number" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ifsc" className="text-xs">IFSC Code</Label>
                <Input id="ifsc" placeholder="IFSC Code" className="h-8 text-xs" />
              </div>
            </div>
          </div>
        </Card>

        {/* Invoice Settings */}
        <Card className="p-4">
          <h3 className="text-xs font-bold mb-3">Invoice Settings</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="invoicePrefix" className="text-xs">Invoice Prefix</Label>
              <Input id="invoicePrefix" defaultValue="RM/2025/" className="h-8 text-xs" />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} className="flex-1 h-9 text-xs">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
