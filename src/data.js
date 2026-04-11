
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









export const grades = [
    {
        id: 1,
        score: '75% - 100%',
        remark: 'Excellent'
    },
    {
        id: 2,
        score: '66% - 74%',
        remark: 'Very Good'
    },
    {
        id: 3,
        score: '55% - 64%',
        remark: 'Good'
    },
    {
        id: 4,
        score: '50% - 54%',
        remark: 'Average'
    },
    {
        id: 5,
        score: 'less than 50',
        remark: 'Below Average'
    }
]