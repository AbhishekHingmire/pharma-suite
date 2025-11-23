import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, Plus, Edit, Trash2, Eye, Search, Filter, 
  UserCircle, Phone, Mail, Calendar, Building2, Target,
  Clock, MapPin, Award, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFromStorage, saveToStorage, getNextId, isBasicHREnabled } from '@/lib/storage';
import type { User, EmployeeRole, Department, Permission } from '@/types';
import { useNavigate } from 'react-router-dom';

const EMPLOYEE_ROLES: { value: EmployeeRole; label: string; dept: Department }[] = [
  { value: 'admin', label: 'Admin / Director', dept: 'operations' },
  { value: 'sales-rep', label: 'Sales Representative', dept: 'sales' },
  { value: 'sales-manager', label: 'Sales Manager', dept: 'sales' },
  { value: 'sales-coordinator', label: 'Sales Coordinator', dept: 'sales' },
  { value: 'warehouse-manager', label: 'Warehouse Manager', dept: 'warehouse' },
  { value: 'warehouse-worker', label: 'Warehouse Worker', dept: 'warehouse' },
  { value: 'delivery-executive', label: 'Delivery Executive', dept: 'warehouse' },
  { value: 'dispatch-coordinator', label: 'Dispatch Coordinator', dept: 'warehouse' },
  { value: 'purchase-manager', label: 'Purchase Manager', dept: 'operations' },
  { value: 'accounts-executive', label: 'Accounts Executive', dept: 'accounts' },
  { value: 'data-entry', label: 'Data Entry Operator', dept: 'operations' },
  { value: 'qc-officer', label: 'Quality Control Officer', dept: 'quality' },
];

const DEPARTMENTS: { value: Department; label: string; color: string }[] = [
  { value: 'sales', label: 'Sales & Marketing', color: 'bg-blue-500' },
  { value: 'warehouse', label: 'Warehouse & Logistics', color: 'bg-green-500' },
  { value: 'operations', label: 'Operations', color: 'bg-purple-500' },
  { value: 'accounts', label: 'Accounts', color: 'bg-orange-500' },
  { value: 'quality', label: 'Quality Control', color: 'bg-pink-500' },
];

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const hrEnabled = isBasicHREnabled(); // Always true for basic tracking

  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    email: string;
    role: 'admin' | 'staff';
    employeeRole: EmployeeRole;
    department: Department;
    status: 'active' | 'inactive' | 'on-leave';
    joiningDate: string;
    address: string;
    emergencyContact: string;
    workingHours: { start: string; end: string };
    weeklyOff: number[];
  }>({
    name: '',
    mobile: '',
    email: '',
    role: 'staff',
    employeeRole: 'sales-rep',
    department: 'sales',
    status: 'active',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    emergencyContact: '',
    workingHours: { start: '09:00', end: '18:00' },
    weeklyOff: [0], // Sunday
  });

  useEffect(() => {
    const data = getFromStorage<User>('users');
    setEmployees(data);
  }, []);

  const generateEmployeeCode = () => {
    const nextId = getNextId('users');
    return `EMP${String(nextId).padStart(3, '0')}`;
  };

  const getRoleBadgeColor = (role: EmployeeRole) => {
    const dept = EMPLOYEE_ROLES.find(r => r.value === role)?.dept;
    const deptColor = DEPARTMENTS.find(d => d.value === dept)?.color;
    return deptColor || 'bg-gray-500';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active': return <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive': return <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'on-leave': return <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">On Leave</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">Active</Badge>;
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.mobile.includes(searchQuery) ||
                         emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStats = () => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const onLeave = employees.filter(e => e.status === 'on-leave').length;
    const byDept = DEPARTMENTS.map(d => ({
      dept: d.label,
      count: employees.filter(e => e.department === d.value).length
    }));
    return { total, active, onLeave, byDept };
  };

  const stats = getStats();

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      role: 'staff',
      employeeRole: 'sales-rep',
      department: 'sales',
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      address: '',
      emergencyContact: '',
      workingHours: { start: '09:00', end: '18:00' },
      weeklyOff: [0],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: User) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      mobile: employee.mobile,
      email: employee.email || '',
      role: employee.role,
      employeeRole: employee.employeeRole || 'sales-rep',
      department: employee.department || 'sales',
      status: employee.status || 'active',
      joiningDate: employee.joiningDate || new Date().toISOString().split('T')[0],
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
      workingHours: employee.workingHours || { start: '09:00', end: '18:00' },
      weeklyOff: employee.weeklyOff || [0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      saveToStorage('users', updated);
      toast.success('Employee deleted successfully!');
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingEmployee) {
      const updated = employees.map(e => e.id === editingEmployee.id
        ? { ...e, ...formData }
        : e
      );
      setEmployees(updated);
      saveToStorage('users', updated);
      toast.success('Employee updated successfully!');
    } else {
      const newEmployee: User = {
        id: getNextId('users'),
        ...formData,
        employeeCode: generateEmployeeCode(),
        token: Math.random().toString(36).substring(7),
      };
      const updated = [...employees, newEmployee];
      setEmployees(updated);
      saveToStorage('users', updated);
      toast.success('Employee added successfully!');
    }

    setIsDialogOpen(false);
  };

  const handleViewTimeline = (employeeId: number) => {
    navigate(`/employees/${employeeId}/timeline`);
  };

  return (
    <DashboardLayout title="Employee Management">
      <div className="space-y-4">
        {/* Header with Stats */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold mb-1">Employees</h2>
            <p className="text-xs text-muted-foreground">
              Manage your team and workforce
            </p>
          </div>
          <Button onClick={handleAdd} size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Total Employees</p>
                <p className="text-xl font-bold mt-0.5">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Active</p>
                <p className="text-xl font-bold mt-0.5 text-green-600">{stats.active}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">On Leave</p>
                <p className="text-xl font-bold mt-0.5 text-yellow-600">{stats.onLeave}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Departments</p>
                <p className="text-xl font-bold mt-0.5">{DEPARTMENTS.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-3">
          <div className="space-y-3">
            {/* Search - Full Width */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, or employee code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs w-full"
              />
            </div>
            
            {/* Filters - 2 Columns on all devices */}
            <div className="grid grid-cols-2 gap-3">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.value} value={dept.value} className="text-xs">
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="active" className="text-xs">Active</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                  <SelectItem value="on-leave" className="text-xs">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEmployees.map(employee => (
            <Card key={employee.id} className="p-2 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-start gap-1.5">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                      {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-0">
                      <h3 className="text-xs font-bold">{employee.name}</h3>
                      {getStatusBadge(employee.status)}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{employee.employeeCode || `EMP${String(employee.id).padStart(3, '0')}`}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-2 pt-2 border-t">
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge className={`text-[10px] ${getRoleBadgeColor(employee.employeeRole || 'sales-rep')}`}>
                    {EMPLOYEE_ROLES.find(r => r.value === employee.employeeRole)?.label || 'Staff'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {DEPARTMENTS.find(d => d.value === employee.department)?.label || 'Operations'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{employee.mobile}</span>
                </div>

                {employee.email && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                )}

                {hrEnabled && employee.joiningDate && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {new Date(employee.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}  
              </div>    

              <div className="flex items-center gap-1 pt-2 border-t">
                {hrEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTimeline(employee.id)}
                    className="flex-1 h-7 text-[10px] gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Timeline
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(employee)}
                  className="flex-1 h-7 text-[10px] gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                  className="h-7 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No employees found</p>
            <Button onClick={handleAdd} variant="outline" size="sm" className="mt-3 h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add First Employee
            </Button>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
              <TabsTrigger value="work" className="text-xs">Work Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Mobile Number *</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit mobile"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete address"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Emergency Contact</Label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Emergency contact number"
                  className="h-8 text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="work" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Employee Role *</Label>
                  <Select
                    value={formData.employeeRole}
                    onValueChange={(value) => {
                      const role = value as EmployeeRole;
                      const dept = EMPLOYEE_ROLES.find(r => r.value === role)?.dept || 'operations';
                      setFormData({ ...formData, employeeRole: role, department: dept });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value} className="text-xs">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept.value} value={dept.value} className="text-xs">
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Joining Date</Label>
                  <Input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs">Active</SelectItem>
                      <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                      <SelectItem value="on-leave" className="text-xs">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Working Hours Start</Label>
                  <Input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, start: e.target.value }
                    })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Working Hours End</Label>
                  <Input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, end: e.target.value }
                    })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-2 justify-end mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button onClick={handleSave} className="h-8 text-xs">
              {editingEmployee ? 'Update' : 'Add'} Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
