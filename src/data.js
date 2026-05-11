
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
      BookmarkCheck,
      ScanEye,
      FolderInput,
      FolderSymlink,
      Hourglass,
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


export const ResultsModules = [
  { id: 'check_result', 
    title: 'Result Checker', 
    desc: "Click here to check and download student's Results.", 
    color: '#2563eb', 
    icon: ScanEye 
  },
  { id: 'input_result', 
    title: 'Input Results', 
    desc: "Input and store all available student's Results.", 
    color: '#f59e0b', 
    icon: FolderSymlink 
  },
  { id: 'pending_result', 
    title: 'Pending Results', 
    desc: "Review all submitted results to approve or reject.", 
    color: '#10b981', 
    icon: Hourglass 
  },
]




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




export const profile = [
  {
    id: 'student',
    header: 'Personal Information',
    details: [
      {
        id: 1,
        title: 'Date of Birth',
        info: '0 Month 0000',
      },
      {
        id: 2,
        title: 'Gender',
        info: 'Male',
      },
      {
        id: 3,
        title: 'Home Address',
        info: '15, Iyana Ajia Road, Ibadan.',
      },
    ]
  },
  {
    id: 'guardian',
    header: 'Guardian Details',
    details: [
      {
        id: 1,
        title: 'Guardian Name',
        info: 'Mr. Abdurrazaq',
      },
      {
        id: 2,
        title: 'Contact Numbe',
        info: '08132145677',
      },
      {
        id: 3,
        title: 'Whatsapp Number',
        info: '09014457562',
      },
    ]
  },

] 