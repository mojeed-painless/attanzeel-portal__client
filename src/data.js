
  import { 
    LayoutDashboard, 
    User, 
    BookMarked,
    ClipboardList, 
    FileCheck, 
    Calendar, 
    BarChart3, 
    Library, 
    CreditCard,
    LogOut,
    GraduationCap, 
    TrendingUp,
    Clock4,
      Settings, 
      UserPlus, 
      Users,
  } from 'lucide-react';

export const toSentenceCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  export const asideNavigation = [
    { name: 'Dashboard', Icon: LayoutDashboard},
    { name: 'Profile', Icon: User},
    { name: 'Academics', Icon: BookMarked},
    { name: 'Assignments', Icon: ClipboardList},
    { name: 'Results', Icon: FileCheck},
    { name: 'Timetable', Icon: Calendar},
    { name: 'Attendance', Icon: BarChart3},
    { name: 'Library', Icon: Library},
    { name: 'Fees', Icon: CreditCard, },
    { name: 'Sign Out', Icon: LogOut,},
  ];





export const AcademicsModules = [
  { id: 'settings', 
    title: 'Academic Settings', 
    desc: 'Configure current term, session, and grading parameters.', 
    color: '#2563eb', 
    icon: Settings 
  },
  { id: 'add_student', 
    title: 'Add New Student', 
    desc: 'Register new students and auto-generate login credentials.', 
    color: '#10b981', 
    icon: UserPlus 
  },
  { id: 'staff', 
    title: 'Staff Management', 
    desc: 'Manage faculty profiles, roles, and status tracking.', 
    color: '#f59e0b', 
    icon: Users 
  },
  { id: 'students', 
    title: 'Student Management', 
    desc: 'Directory of all students with edit, view, and delete controls.', 
    color: '#ef4444', 
    icon: GraduationCap 
  }
];




export const grades = [
    {
        id: 1,
        score: '75 - 100',
        remark: 'Excellent'
    },
    {
        id: 2,
        score: '66 - 74',
        remark: 'Very Good'
    },
    {
        id: 3,
        score: '55 - 64',
        remark: 'Good'
    },
    {
        id: 4,
        score: '50 - 54',
        remark: 'Average'
    },
    {
        id: 5,
        score: '< 50',
        remark: 'Below Average'
    }
]


