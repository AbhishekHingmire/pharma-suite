import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Clock, MapPin, ShoppingCart, Package, DollarSign,
  Phone, Users, CheckCircle2, Calendar, TrendingUp
} from 'lucide-react';
import { getFromStorage } from '@/lib/storage';
import type { User, EmployeeActivity, Attendance, Sale, Purchase } from '@/types';

export default function EmployeeTimelinePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<User | null>(null);
  const [activities, setActivities] = useState<EmployeeActivity[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const empData = getFromStorage<User>('users');
    const actData = getFromStorage<EmployeeActivity>('activities');
    const attData = getFromStorage<Attendance>('attendance');
    const salesData = getFromStorage<Sale>('sales');
    const purchaseData = getFromStorage<Purchase>('purchases');

    const emp = empData.find(e => e.id === Number(employeeId));
    setEmployee(emp || null);
    
    if (emp) {
      const empActivities = actData.filter(a => a.employeeId === emp.id);
      setActivities(empActivities);
      
      const empAttendance = attData.filter(a => a.employeeId === emp.id);
      setAttendance(empAttendance);

      const empSales = salesData.filter(s => s.createdBy === emp.id);
      setSales(empSales);

      const empPurchases = purchaseData.filter(p => p.createdBy === emp.id);
      setPurchases(empPurchases);
    }
  }, [employeeId]);

  const getFilteredActivities = () => {
    const now = new Date();
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const diffTime = now.getTime() - activityDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (viewMode === 'today') return diffDays === 0;
      if (viewMode === 'week') return diffDays <= 7;
      if (viewMode === 'month') return diffDays <= 30;
      return true;
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'purchase': return <Package className="w-4 h-4 text-blue-600" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case 'visit': return <MapPin className="w-4 h-4 text-purple-600" />;
      case 'call': return <Phone className="w-4 h-4 text-orange-600" />;
      case 'meeting': return <Users className="w-4 h-4 text-pink-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-50 border-green-200 text-green-800';
      case 'purchase': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'payment': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'visit': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'call': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'meeting': return 'bg-pink-50 border-pink-200 text-pink-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthSales = sales.filter(s => new Date(s.date) >= monthStart);
    const monthPurchases = purchases.filter(p => new Date(p.date) >= monthStart);
    const monthAttendance = attendance.filter(a => new Date(a.date) >= monthStart);
    const monthActivities = activities.filter(a => new Date(a.date) >= monthStart);

    const salesValue = monthSales.reduce((sum, s) => sum + s.total, 0);
    const purchaseValue = monthPurchases.reduce((sum, p) => sum + p.total, 0);
    const presentDays = monthAttendance.filter(a => a.status === 'present').length;
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    return {
      sales: { count: monthSales.length, value: salesValue },
      purchases: { count: monthPurchases.length, value: purchaseValue },
      attendance: { present: presentDays, total: totalDays, percentage: Math.round((presentDays / totalDays) * 100) },
      activities: monthActivities.length,
    };
  };

  const stats = getMonthlyStats();
  const filteredActivities = getFilteredActivities();

  if (!employee) {
    return (
      <DashboardLayout title="Employee Timeline">
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Employee not found</p>
          <Button onClick={() => navigate('/masters/employees')} variant="outline" size="sm" className="mt-4">
            Back to Employees
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employee Timeline">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/masters/employees')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                  {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-base font-bold">{employee.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {employee.employeeCode} • {employee.mobile}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('today')}
            >
              Today
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              This Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              This Month
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Sales</p>
                <p className="text-lg font-bold mt-0.5">{stats.sales.count}</p>
                <p className="text-[10px] text-green-600 font-medium mt-0.5">
                  ₹{(stats.sales.value / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Purchases</p>
                <p className="text-lg font-bold mt-0.5">{stats.purchases.count}</p>
                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                  ₹{(stats.purchases.value / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Attendance</p>
                <p className="text-lg font-bold mt-0.5">{stats.attendance.present}/{stats.attendance.total}</p>
                <p className="text-[10px] text-purple-600 font-medium mt-0.5">
                  {stats.attendance.percentage}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Activities</p>
                <p className="text-lg font-bold mt-0.5">{stats.activities}</p>
                <p className="text-[10px] text-orange-600 font-medium mt-0.5">
                  This Month
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-4">Activity Timeline</h3>
          
          {filteredActivities.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="space-y-3 relative before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-[2px] before:bg-border">
                {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3 relative">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold mb-0.5">{activity.title}</h4>
                          {activity.description && (
                            <p className="text-[10px] opacity-80">{activity.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize flex-shrink-0">
                          {activity.type}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-[10px] opacity-70">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </span>
                        {activity.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activities found for this period</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
