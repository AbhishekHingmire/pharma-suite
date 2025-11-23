import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Plus, Edit, Trash2, Lock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import { Role, RolePermission, User } from '@/types';
import { useAuthStore } from '@/store/authStore';

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'View dashboard and analytics' },
  { id: 'sales', name: 'Sales', description: 'Manage sales and invoices' },
  { id: 'purchase', name: 'Purchase', description: 'Manage purchases and bills' },
  { id: 'inventory', name: 'Inventory', description: 'View and manage stock' },
  { id: 'payments', name: 'Payments', description: 'Manage payments and receipts' },
  { id: 'reports', name: 'Reports', description: 'View reports and analytics' },
  { id: 'masters', name: 'Masters', description: 'Manage master data (products, customers, etc.)' },
  { id: 'employees', name: 'Employees', description: 'Manage employee data' },
  { id: 'attendance', name: 'Attendance', description: 'Manage attendance records' },
  { id: 'settings', name: 'Settings', description: 'System settings and configuration' },
];

export default function RolesPermissions() {
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: AVAILABLE_MODULES.map(module => ({
      module: module.id,
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    })),
  });

  useEffect(() => {
    loadRoles();
    loadEmployees();
  }, []);

  const loadRoles = () => {
    const storedRoles = getFromStorage<Role>('roles');
    
    // Initialize with default system roles if empty
    if (storedRoles.length === 0) {
      const defaultRoles: Role[] = [
        {
          id: 1,
          name: 'Administrator',
          description: 'Full system access with all permissions',
          permissions: AVAILABLE_MODULES.map(module => ({
            module: module.id,
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
          })),
          isSystem: true,
          createdAt: new Date().toISOString(),
          createdBy: user?.id || 1,
        },
        {
          id: 2,
          name: 'Staff',
          description: 'Basic staff access with limited permissions',
          permissions: [
            { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
            { module: 'sales', canView: true, canCreate: true, canEdit: false, canDelete: false },
            { module: 'inventory', canView: true, canCreate: false, canEdit: false, canDelete: false },
          ],
          isSystem: true,
          createdAt: new Date().toISOString(),
          createdBy: user?.id || 1,
        },
      ];
      saveToStorage('roles', defaultRoles);
      setRoles(defaultRoles);
    } else {
      setRoles(storedRoles);
    }
  };

  const loadEmployees = () => {
    const users = getFromStorage<User>('users');
    setEmployees(users);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: AVAILABLE_MODULES.map(module => ({
        module: module.id,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      })),
    });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be edited');
      return;
    }
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }

    // Check if any employees are using this role
    const employeesUsingRole = employees.filter(emp => emp.customRoleId === roleId);
    if (employeesUsingRole.length > 0) {
      toast.error(`Cannot delete role. ${employeesUsingRole.length} employee(s) are assigned to this role.`);
      return;
    }

    const updatedRoles = roles.filter(r => r.id !== roleId);
    saveToStorage('roles', updatedRoles);
    setRoles(updatedRoles);
    toast.success('Role deleted successfully');
  };

  const handleSaveRole = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Role description is required');
      return;
    }

    const hasAnyPermission = formData.permissions.some(
      p => p.canView || p.canCreate || p.canEdit || p.canDelete
    );

    if (!hasAnyPermission) {
      toast.error('Please grant at least one permission');
      return;
    }

    if (editingRole) {
      // Update existing role
      const updatedRoles = roles.map(role =>
        role.id === editingRole.id
          ? {
              ...role,
              name: formData.name,
              description: formData.description,
              permissions: formData.permissions,
              updatedAt: new Date().toISOString(),
            }
          : role
      );
      saveToStorage('roles', updatedRoles);
      setRoles(updatedRoles);
      toast.success('Role updated successfully');
    } else {
      // Create new role
      const newRole: Role = {
        id: getNextId('roles'),
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        isSystem: false,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 1,
      };
      const updatedRoles = [...roles, newRole];
      saveToStorage('roles', updatedRoles);
      setRoles(updatedRoles);
      toast.success('Role created successfully');
    }

    setIsRoleDialogOpen(false);
  };

  const handlePermissionChange = (moduleId: string, permission: keyof RolePermission, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.module === moduleId ? { ...p, [permission]: value } : p
      ),
    }));
  };

  const handleSelectAllPermissions = (moduleId: string, select: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.module === moduleId
          ? { ...p, canView: select, canCreate: select, canEdit: select, canDelete: select }
          : p
      ),
    }));
  };

  const handleAssignRole = (role: Role) => {
    setSelectedRole(role);
    setIsAssignDialogOpen(true);
  };

  const handleToggleEmployeeRole = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee || !selectedRole) return;

    const updatedEmployees = employees.map(emp =>
      emp.id === employeeId
        ? { ...emp, customRoleId: emp.customRoleId === selectedRole.id ? undefined : selectedRole.id }
        : emp
    );

    saveToStorage('users', updatedEmployees);
    setEmployees(updatedEmployees);
    
    const action = employee.customRoleId === selectedRole.id ? 'removed from' : 'assigned to';
    toast.success(`${employee.name} ${action} ${selectedRole.name}`);
  };

  const getEmployeesWithRole = (roleId: number) => {
    return employees.filter(emp => emp.customRoleId === roleId).length;
  };

  const getPermissionCount = (role: Role) => {
    let count = 0;
    role.permissions.forEach(p => {
      if (p.canView) count++;
      if (p.canCreate) count++;
      if (p.canEdit) count++;
      if (p.canDelete) count++;
    });
    return count;
  };

  return (
    <DashboardLayout title="Roles & Permissions">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Roles & Permissions Management</h2>
            <p className="text-xs text-muted-foreground">
              Create custom roles and assign permissions to control employee access
            </p>
          </div>
          <Button onClick={handleAddRole} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Role
          </Button>
        </div>

        {/* Roles List */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Role Name</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Permissions</TableHead>
                <TableHead className="text-xs">Employees</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No roles found. Create your first role!</p>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium text-xs">{role.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {role.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {getPermissionCount(role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs">{getEmployeesWithRole(role.id)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge className="bg-blue-500 text-[10px]">System</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignRole(role)}
                          className="h-7 px-2"
                        >
                          <Users className="w-3 h-3" />
                        </Button>
                        {!role.isSystem && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                              className="h-7 px-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              className="h-7 px-2 text-red-600 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {role.isSystem && (
                          <div className="h-7 px-2 flex items-center">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Add/Edit Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sales Manager, Warehouse Supervisor"
                  />
                </div>

                <div>
                  <Label htmlFor="roleDescription">Description *</Label>
                  <Input
                    id="roleDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this role's responsibilities"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Module Permissions</Label>
                <div className="border rounded-lg divide-y">
                  {AVAILABLE_MODULES.map((module) => {
                    const permission = formData.permissions.find(p => p.module === module.id);
                    if (!permission) return null;

                    const allSelected = permission.canView && permission.canCreate && 
                                       permission.canEdit && permission.canDelete;

                    return (
                      <div key={module.id} className="p-3 hover:bg-muted/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold">{module.name}</p>
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) => 
                                  handleSelectAllPermissions(module.id, checked === true)
                                }
                                className="h-3 w-3"
                              />
                              <span className="text-[10px] text-muted-foreground">Select All</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id={`${module.id}-view`}
                              checked={permission.canView}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.id, 'canView', checked === true)
                              }
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`${module.id}-view`} className="text-[10px] cursor-pointer">
                              View
                            </Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id={`${module.id}-create`}
                              checked={permission.canCreate}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.id, 'canCreate', checked === true)
                              }
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`${module.id}-create`} className="text-[10px] cursor-pointer">
                              Create
                            </Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id={`${module.id}-edit`}
                              checked={permission.canEdit}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.id, 'canEdit', checked === true)
                              }
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`${module.id}-edit`} className="text-[10px] cursor-pointer">
                              Edit
                            </Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id={`${module.id}-delete`}
                              checked={permission.canDelete}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.id, 'canDelete', checked === true)
                              }
                              className="h-3 w-3"
                            />
                            <Label htmlFor={`${module.id}-delete`} className="text-[10px] cursor-pointer">
                              Delete
                            </Label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole}>
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Role to Employees Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Assign Role: {selectedRole?.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Select employees to assign this role
              </p>
            </DialogHeader>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No employees found</p>
                </div>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={employee.customRoleId === selectedRole?.id}
                        onCheckedChange={() => handleToggleEmployeeRole(employee.id)}
                      />
                      <div>
                        <p className="text-xs font-semibold">{employee.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {employee.employeeCode || `EMP${String(employee.id).padStart(3, '0')}`} • {employee.mobile}
                        </p>
                      </div>
                    </div>
                    {employee.customRoleId && employee.customRoleId !== selectedRole?.id && (
                      <Badge variant="outline" className="text-[10px]">
                        {roles.find(r => r.id === employee.customRoleId)?.name || 'Other Role'}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
