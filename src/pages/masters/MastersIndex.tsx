import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Building2, Package, Users, Tag } from 'lucide-react';

export default function MastersIndex() {
  const navigate = useNavigate();

  const masterOptions = [
    {
      icon: Building2,
      title: 'Companies',
      description: 'Manage pharmaceutical companies and suppliers',
      path: '/masters/companies',
      color: 'bg-blue-500'
    },
    {
      icon: Package,
      title: 'Products',
      description: 'Manage product catalog and pricing',
      path: '/masters/products',
      color: 'bg-green-500'
    },
    {
      icon: Users,
      title: 'Customers',
      description: 'Manage customer accounts and credit limits',
      path: '/masters/customers',
      color: 'bg-purple-500'
    },
    {
      icon: Tag,
      title: 'Schemes',
      description: 'Configure purchase schemes and discounts',
      path: '/masters/schemes',
      color: 'bg-orange-500'
    }
  ];

  return (
    <DashboardLayout title="Masters">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Master Data Management</h2>
          <p className="text-muted-foreground">
            Configure and manage your core business data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {masterOptions.map((option) => (
            <Card
              key={option.path}
              className="p-6 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(option.path)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${option.color}`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
