import { User, Attendance, EmployeeActivity, LeaveRequest, LeaveBalance } from '@/types';
import { saveToStorage } from './storage';

export function initializeHRDemoData() {
  // Check if demo data already exists
  const existingUsers = localStorage.getItem('users');
  if (existingUsers && JSON.parse(existingUsers).length > 2) {
    return; // Demo data already exists
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Create demo employees
  const demoEmployees: User[] = [
    {
      id: 1,
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      email: 'ramesh@pharmasuite.com',
      role: 'admin',
      token: 'demo-token-1',
      employeeRole: 'admin',
      employeeCode: 'EMP001',
      department: 'operations',
      status: 'active',
      joiningDate: '2024-01-15',
      workingHours: { start: '09:00', end: '18:00' },
      weeklyOff: [0], // Sunday
    },
    {
      id: 2,
      name: 'Priya Sharma',
      mobile: '9876543211',
      email: 'priya@pharmasuite.com',
      role: 'staff',
      token: 'demo-token-2',
      employeeRole: 'sales-rep',
      employeeCode: 'EMP002',
      department: 'sales',
      status: 'active',
      joiningDate: '2024-03-01',
      workingHours: { start: '09:00', end: '18:00' },
      weeklyOff: [0],
    },
    {
      id: 3,
      name: 'Amit Patel',
      mobile: '9876543212',
      email: 'amit@pharmasuite.com',
      role: 'staff',
      token: 'demo-token-3',
      employeeRole: 'warehouse-manager',
      employeeCode: 'EMP003',
      department: 'warehouse',
      status: 'active',
      joiningDate: '2024-02-10',
      workingHours: { start: '08:00', end: '17:00' },
      weeklyOff: [0],
    },
    {
      id: 4,
      name: 'Sneha Desai',
      mobile: '9876543213',
      email: 'sneha@pharmasuite.com',
      role: 'staff',
      token: 'demo-token-4',
      employeeRole: 'sales-rep',
      employeeCode: 'EMP004',
      department: 'sales',
      status: 'active',
      joiningDate: '2024-04-15',
      workingHours: { start: '09:00', end: '18:00' },
      weeklyOff: [0],
    },
    {
      id: 5,
      name: 'Rajesh Singh',
      mobile: '9876543214',
      email: 'rajesh@pharmasuite.com',
      role: 'staff',
      token: 'demo-token-5',
      employeeRole: 'delivery-executive',
      employeeCode: 'EMP005',
      department: 'warehouse',
      status: 'active',
      joiningDate: '2024-05-01',
      workingHours: { start: '08:00', end: '17:00' },
      weeklyOff: [0],
    },
  ];

  // Create attendance records for last 30 days (instead of 7)
  const attendanceRecords: Attendance[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    demoEmployees.forEach((emp, index) => {
      // Skip Sundays (weekly off)
      if (date.getDay() === 0) {
        attendanceRecords.push({
          id: attendanceRecords.length + 1,
          employeeId: emp.id,
          date: dateStr,
          status: 'week-off',
          markedBy: 'system',
          createdAt: new Date().toISOString(),
        });
        return;
      }

      // 90% present, 5% leave, 5% absent
      const rand = Math.random();
      let status: 'present' | 'leave' | 'absent' = 'present';
      if (rand < 0.05) status = 'absent';
      else if (rand < 0.10) status = 'leave';

      const checkInTime = status === 'present' 
        ? `0${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        : undefined;
      
      const checkOutTime = status === 'present' && checkInTime
        ? `1${7 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        : undefined;

      attendanceRecords.push({
        id: attendanceRecords.length + 1,
        employeeId: emp.id,
        date: dateStr,
        status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours: status === 'present' && checkInTime && checkOutTime 
          ? Math.round((parseInt(checkOutTime.split(':')[0]) - parseInt(checkInTime.split(':')[0])) * 100) / 100
          : undefined,
        markedBy: 'admin',
        createdAt: new Date().toISOString(),
      });
    });
  }

  // Create comprehensive activities for last 30 days
  const activities: EmployeeActivity[] = [];
  let activityId = 1;

  const activityTemplates = [
    // Sales Rep Activities - High activity (3-5 per day)
    { types: ['visit', 'call', 'meeting'], employee: 2, name: 'Priya Sharma', activityLevel: 'high' },
    // Sales Rep - Medium activity (2-3 per day)
    { types: ['visit', 'call', 'meeting'], employee: 4, name: 'Sneha Desai', activityLevel: 'medium' },
    // Warehouse Manager - Medium activity (2-3 per day)
    { types: ['task', 'delivery'], employee: 3, name: 'Amit Patel', activityLevel: 'medium' },
    // Delivery Executive - Low activity (1-2 per day)
    { types: ['delivery', 'task'], employee: 5, name: 'Rajesh Singh', activityLevel: 'low' },
  ];

  const customers = ['Apollo Pharmacy', 'Mediplus Pharmacy', 'Dr. Rajesh Clinic', 'HealthCare Plus', 'City Medical Store', 'Wellness Pharmacy'];
  const locations = ['Andheri, Mumbai', 'Pune Station', 'Bandra West', 'Thane East', 'Vashi, Navi Mumbai', 'Dadar, Mumbai'];
  
  // Generate 180 days (6 months) of activities for realistic long timelines
  for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
    const activityDate = new Date(today.getTime() - dayOffset * 86400000);
    const dateStr = activityDate.toISOString().split('T')[0];
    const isWeekend = activityDate.getDay() === 0; // Sunday

    if (isWeekend) continue; // Skip weekends

    activityTemplates.forEach(({ types, employee, name, activityLevel }) => {
      // Random activity count based on employee's activity level
      let activityCount: number;
      if (activityLevel === 'high') {
        activityCount = Math.floor(Math.random() * 3) + 3; // 3-5 activities
      } else if (activityLevel === 'medium') {
        activityCount = Math.floor(Math.random() * 2) + 2; // 2-3 activities
      } else {
        activityCount = Math.floor(Math.random() * 2) + 1; // 1-2 activities
      }
      
      for (let i = 0; i < activityCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(activityDate);
        timestamp.setHours(hour, minute, 0, 0);

        const customer = customers[Math.floor(Math.random() * customers.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];

        let activity: EmployeeActivity = {
          id: activityId++,
          employeeId: employee,
          employeeName: name,
          date: dateStr,
          timestamp: timestamp.toISOString(),
          type: type as any,
          title: '',
          description: '',
          status: 'completed',
          createdAt: timestamp.toISOString(),
        };

        // Type-specific details
        switch (type) {
          case 'visit':
            activity.title = `Customer Visit - ${customer}`;
            activity.description = `Product demonstration and order discussion. Order value: ₹${(Math.random() * 50000 + 10000).toFixed(0)}`;
            activity.visitDetails = {
              customerName: customer,
              customerType: Math.random() > 0.5 ? 'pharmacy' : 'doctor',
              location: { lat: 18.5204, lng: 73.8567, address: location },
              orderValue: Math.floor(Math.random() * 50000 + 10000),
              feedback: Math.random() > 0.5 ? 'Interested in new products' : 'Satisfied with service',
              nextFollowUp: new Date(activityDate.getTime() + 86400000 * 7).toISOString().split('T')[0],
            };
            break;
          case 'call':
            activity.title = `Follow-up Call - ${customer}`;
            activity.description = Math.random() > 0.5 
              ? 'Discussed pending payment and new order'
              : 'Product inquiry and stock availability check';
            activity.duration = Math.floor(Math.random() * 20) + 5;
            break;
          case 'meeting':
            activity.title = `Team Meeting - Sales Review`;
            activity.description = 'Discussed monthly targets and customer feedback';
            activity.duration = Math.floor(Math.random() * 60) + 30;
            break;
          case 'task':
            activity.title = Math.random() > 0.5 ? 'Stock Verification' : 'Inventory Update';
            activity.description = Math.random() > 0.5 
              ? 'Completed stock audit for high-value items'
              : 'Updated inventory records in system';
            break;
          case 'delivery':
            activity.title = `Delivery - ${customer}`;
            activity.description = `Delivered order to ${location}`;
            activity.deliveryDetails = {
              orderId: Math.floor(Math.random() * 1000) + 1,
              customerName: customer,
              deliveryStatus: 'delivered',
              paymentCollected: Math.floor(Math.random() * 50000 + 10000),
            };
            break;
        }

        activities.push(activity);
      }
    });
  }

  console.log(`Generated ${activities.length} activities for ${activityTemplates.length} employees over 180 days (6 months)`);

  // Create leave balances
  const leaveBalances: LeaveBalance[] = demoEmployees.map(emp => ({
    employeeId: emp.id,
    year: today.getFullYear(),
    casual: { total: 12, used: 2, remaining: 10 },
    sick: { total: 12, used: 1, remaining: 11 },
    earned: { total: 15, used: 0, remaining: 15 },
  }));

  // Save all demo data
  saveToStorage('users', demoEmployees);
  saveToStorage('attendance', attendanceRecords);
  saveToStorage('activities', activities);
  saveToStorage('leaveBalance', leaveBalances);

  console.log('HR Module demo data initialized successfully!');
}
