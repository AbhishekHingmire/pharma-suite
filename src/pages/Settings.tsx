import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Company Settings</h2>
          <p className="text-muted-foreground">
            Manage your company profile and preferences
          </p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Business Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" defaultValue="RAMESH MEDICALS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="Pune, Maharashtra" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" placeholder="27XXXXX1234X1ZX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="info@rameshmedicals.com" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Banking Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="Bank Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo">Account Number</Label>
              <Input id="accountNo" placeholder="Account Number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input id="ifsc" placeholder="IFSC Code" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input id="invoicePrefix" defaultValue="RM/2025/" />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
