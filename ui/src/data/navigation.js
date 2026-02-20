import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import ClassOutlined from '@mui/icons-material/ClassOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';

const navigation = [
  {
    label: 'Dashboard',
    path: '/',
    icon: DashboardOutlined,
    headerTitle: 'Dashboard Overview',
    breadcrumb: 'Main Dashboard',
    roles: ['super_admin', 'admin', 'student', 'parent'],
  },
  {
    label: 'Teacher Dashboard',
    path: '/teacher-dashboard',
    icon: DashboardOutlined,
    headerTitle: 'Teacher Dashboard',
    breadcrumb: 'Assigned Classes',
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'Students',
    path: '/students',
    icon: GroupOutlined,
    headerTitle: 'Student Management',
    breadcrumb: 'Student List',
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'Teachers',
    path: '/teachers',
    icon: SchoolOutlined,
    headerTitle: 'Teacher Management',
    breadcrumb: 'Teachers Directory',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Classes',
    path: '/classes',
    icon: ClassOutlined,
    headerTitle: 'Class Management',
    breadcrumb: 'Class Structure',
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'Academic Years',
    path: '/academic-years',
    icon: CalendarMonthOutlined,
    headerTitle: 'Academic Year Management',
    breadcrumb: 'Academic Calendar Setup',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Admissions',
    path: '/enrollment',
    icon: HowToRegOutlined,
    headerTitle: 'Admissions & Enrollment',
    breadcrumb: 'Lead to Student',
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'Attendance',
    path: '/attendance',
    icon: FactCheckOutlined,
    headerTitle: 'Attendance',
    breadcrumb: 'Attendance Marking',
    roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'],
  },
  {
    label: 'Fees',
    path: '/fees',
    icon: ReceiptLongOutlined,
    headerTitle: 'Fee Details',
    breadcrumb: 'Fee History',
    roles: ['super_admin', 'admin', 'student', 'parent'],
  },
  {
    label: 'Notices',
    path: '/notices',
    icon: CampaignOutlined,
    headerTitle: 'Notices',
    breadcrumb: 'Notice Board',
    roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'],
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: PersonOutlineOutlined,
    headerTitle: 'Profile',
    breadcrumb: 'Profile & Security',
    roles: ['super_admin', 'admin', 'teacher', 'student', 'parent'],
  },
];

export default navigation;
