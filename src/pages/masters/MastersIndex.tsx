import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Building2, Package, Users, Tag, DollarSign, UserCog } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function MastersIndex() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const masterOptions = [
    {
      icon: Building2,
      title: 'Companies',
      description: 'Manage suppliers and vendors',
      path: '/masters/companies',
      color: 'bg-blue-500',
      roles: ['admin', 'staff']
    },
    {
      icon: Package,
      title: 'Products',
      description: 'Manage inventory items',
      path: '/masters/products',
      color: 'bg-green-500',
      roles: ['admin', 'staff']
    },
    {
      icon: Users,
      title: 'Customers',
      description: 'Manage buyers and accounts',
      path: '/masters/customers',
      color: 'bg-purple-500',
      roles: ['admin', 'staff']
    },
    {
      icon: Tag,
      title: 'Schemes',
      description: 'Configure offers and discounts',
      path: '/masters/schemes',
      color: 'bg-orange-500',
      roles: ['admin']
    },
    {
      icon: DollarSign,
      title: 'Rate Master',
      description: 'Set pricing for customers',
      path: '/masters/rate-master',
      color: 'bg-teal-500',
      roles: ['admin']
    }
  ];

  const filteredOptions = masterOptions.filter(option => 
    option.roles.includes(user?.role || 'staff')
  );

  return (
    <DashboardLayout title="Masters">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-2">Master Data Management</h2>
          <p className="text-muted-foreground">
            Configure and manage your core business data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredOptions.map((option) => (
            <Card
              key={option.path}
              className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => navigate(option.path)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${option.color}`}>
                  <option.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-0.5">{option.title}</h3>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
