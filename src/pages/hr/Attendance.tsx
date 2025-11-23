import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
  Calendar as CalendarIcon, Check, X, Clock, TrendingUp,
  Users, CheckCircle2, XCircle, Coffee, Home, Plus
} from 'lucide-react';
import { getFromStorage, saveToStorage, getNextId } from '@/lib/storage';
import type { User, Attendance, AttendanceStatus } from '@/types';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [markStatus, setMarkStatus] = useState<AttendanceStatus>('present');

  useEffect(() => {
    const empData = getFromStorage<User>('users');
    const attData = getFromStorage<Attendance>('attendance');
    setEmployees(empData);
    setAttendance(attData);
  }, []);

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAtt = attendance.filter(a => a.date === today);
    
    const present = todayAtt.filter(a => a.status === 'present').length;
    const absent = employees.length - todayAtt.filter(a => ['present', 'half-day', 'leave'].includes(a.status)).length;
    const leave = todayAtt.filter(a => a.status === 'leave').length;
    const late = todayAtt.filter(a => a.status === 'present' && a.checkIn && a.checkIn > '09:15').length;

    return { present, absent, leave, late, total: employees.length };
  };

  const stats = getTodayStats();

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendance.filter(a => a.date === dateStr);
  };

  const getEmployeeAttendance = (employeeId: number, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendance.find(a => a.employeeId === employeeId && a.date === dateStr);
  };

  const handleMarkAttendance = (employee: User) => {
    setSelectedEmployee(employee);
    setMarkStatus('present');
    setIsMarkDialogOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedEmployee) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = attendance.find(
      a => a.employeeId === selectedEmployee.id && a.date === dateStr
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (existing) {
      const updated = attendance.map(a =>
        a.employeeId === selectedEmployee.id && a.date === dateStr
          ? { ...a, status: markStatus, checkIn: markStatus === 'present' ? timeStr : undefined }
          : a
      );
      setAttendance(updated);
      saveToStorage('attendance', updated);
    } else {
      const newAtt: Attendance = {
        id: getNextId('attendance'),
        employeeId: selectedEmployee.id,
        date: dateStr,
        status: markStatus,
        checkIn: markStatus === 'present' ? timeStr : undefined,
        markedBy: 'admin',
        createdAt: new Date().toISOString(),
      };
      const updated = [...attendance, newAtt];
      setAttendance(updated);
      saveToStorage('attendance', updated);
    }

    toast.success('Attendance marked successfully!');
    setIsMarkDialogOpen(false);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge className="text-[10px] bg-green-500 hover:bg-green-600">Present</Badge>;
      case 'absent':
        return <Badge className="text-[10px] bg-red-500 hover:bg-red-600">Absent</Badge>;
      case 'half-day':
        return <Badge className="text-[10px] bg-yellow-500 hover:bg-yellow-600">Half Day</Badge>;
      case 'leave':
        return <Badge className="text-[10px] bg-blue-500 hover:bg-blue-600">Leave</Badge>;
      case 'holiday':
        return <Badge className="text-[10px] bg-purple-500 hover:bg-purple-600">Holiday</Badge>;
      case 'week-off':
        return <Badge className="text-[10px] bg-gray-500 hover:bg-gray-600">Week Off</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">-</Badge>;
    }
  };

  const getStatusIcon = (status?: AttendanceStatus) => {
    if (!status) return <Clock className="w-4 h-4 text-gray-400" />;
    switch (status) {
      case 'present': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'half-day': return <Coffee className="w-4 h-4 text-yellow-500" />;
      case 'leave': return <Home className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const todayAttendance = getAttendanceForDate(selectedDate);

  return (
    <DashboardLayout title="Attendance Management">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold mb-1">Attendance</h2>
            <p className="text-xs text-muted-foreground">
              {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedDate.toISOString().split('T')[0]} 
              onValueChange={(val) => setSelectedDate(new Date(val))}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={new Date().toISOString().split('T')[0]} className="text-xs">Today</SelectItem>
                <SelectItem value={new Date(Date.now() - 86400000).toISOString().split('T')[0]} className="text-xs">Yesterday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Total</p>
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
                <p className="text-[10px] text-muted-foreground font-medium">Present</p>
                <p className="text-xl font-bold mt-0.5 text-green-600">{stats.present}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Absent</p>
                <p className="text-xl font-bold mt-0.5 text-red-600">{stats.absent}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">On Leave</p>
                <p className="text-xl font-bold mt-0.5 text-blue-600">{stats.leave}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeView === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('list')}
          >
            Attendance List
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('calendar')}
          >
            Calendar View
          </Button>
        </div>

        {activeView === 'list' && (
          <div className="space-y-3">
            <Card className="p-4">
              <div className="space-y-2">
                {employees.map(employee => {
                  const att = getEmployeeAttendance(employee.id, selectedDate);
                  return (
                    <div
                      key={employee.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 bg-background rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                            {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-semibold">{employee.name}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {employee.employeeCode || `EMP${String(employee.id).padStart(3, '0')}`}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{employee.mobile}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {att ? (
                          <>
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 justify-end">
                                {getStatusBadge(att.status)}
                                {att.checkIn && att.checkIn > '09:15' && att.status === 'present' && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-yellow-50 text-yellow-700 border-yellow-300">
                                    Late
                                  </Badge>
                                )}
                              </div>
                              {att.checkIn && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Check-in: {att.checkIn}
                                </p>
                              )}
                            </div>
                            {getStatusIcon(att.status)}
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="text-[10px]">Not Marked</Badge>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(employee)}
                              className="h-7 text-[10px] gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Mark
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <Card className="col-span-1 lg:col-span-2 p-3">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedMonth(date);
                      setSelectedDate(date); // Also update selected date to show that day's attendance
                    }
                  }}
                  className="rounded-md border w-full scale-90 origin-top"
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click on a date to view attendance
                </p>
              </Card>

              <Card className="col-span-1 lg:col-span-3 p-4 max-h-[500px] overflow-y-auto">
                <h3 className="text-sm font-bold mb-3">
                  Attendance for {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                
                <div className="space-y-2">
                  {employees.map(employee => {
                    const att = getEmployeeAttendance(employee.id, selectedDate);
                    return (
                      <div key={employee.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[10px] font-bold">
                              {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{employee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {att ? (
                            <>
                              {getStatusBadge(att.status)}
                              {att.checkIn && (
                                <span className="text-[10px] text-muted-foreground">
                                  {att.checkIn}
                                </span>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Not Marked</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Dialog */}
      <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Mark Attendance</DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-xs font-bold">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{selectedEmployee.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedEmployee.mobile}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['present', 'absent', 'half-day', 'leave'] as AttendanceStatus[]).map(status => {
                    let colorClass = '';
                    if (markStatus === status) {
                      if (status === 'present') colorClass = 'bg-green-500 hover:bg-green-600';
                      else if (status === 'absent') colorClass = 'bg-red-500 hover:bg-red-600';
                      else if (status === 'half-day') colorClass = 'bg-yellow-500 hover:bg-yellow-600';
                      else if (status === 'leave') colorClass = 'bg-blue-500 hover:bg-blue-600';
                    }
                    return (
                      <Button
                        key={status}
                        variant={markStatus === status ? 'default' : 'outline'}
                        onClick={() => setMarkStatus(status)}
                        className={`h-9 text-xs capitalize ${colorClass}`}
                      >
                        {status.replace('-', ' ')}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsMarkDialogOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button onClick={handleSaveAttendance} className="h-8 text-xs">
                  Save Attendance
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
