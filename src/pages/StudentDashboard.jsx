import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/auth.js';
import navLogo from '../assets/images/atlogo.png';
import { asideNavigation, toSentenceCase } from '../data.js';
import '../assets/styles/dashboard.css';
import profileImage from '../assets/images/mallam6.png';
import DashboardPortal from '../components/DashboardPortal.jsx';
import ProfilePortal from '../components/ProfilePortal.jsx';
import AcademicsPortal from '../components/AcademicsPortal.jsx';
import AssignmentPortal from '../components/AssignmentPortal.jsx';
import TimeTablePortal from '../components/TimeTablePortal.jsx';
import AttendancePortal from '../components/AttendancePortal.jsx';
import LibraryPortal from '../components/LibraryPortal.jsx';
import FeesPortal from '../components/FeesPortal.jsx';
import ResultsPortal from '../components/ResultsPortal.jsx';


  import { 
    Search,
    Bell,
    ChevronDown,
    ChevronUp,
  } from 'lucide-react';


const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeLink, setActiveLink] = useState('Dashboard');
  const [profileDrop, setProfileDrop] = useState(false);

  // Helper function to convert string to sentence case
  // const toSentenceCase = (str) => {
  //   if (!str) return '';
  //   return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  // };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

    function handleLinkClick(name) {
      setActiveLink(name);
    }

  return (

      <div className="portal__container">
        <div className="portal__left">
          <div className="aside__logo">
            <img src={navLogo} alt="At-tanzeel Logo" />
          </div>


          <aside className='portal__aside-container'>
            {asideNavigation.map(({ name, Icon }) => (
              name === 'Sign Out' ?
              <button key={name} 
              className='aside__logout-btn aside__nav-item' 
              onClick={() => setConfirmLogout(true)} 
              >
                <Icon className='aside__nav-icon' />
                <span className='aside__nav-text'>{name}</span>
              </button> 
              
              :

              
              <Link key={name} 
              className={`aside__nav-item ${activeLink === name ? 'active' : ''}`} 
              onClick={() => handleLinkClick(name)} 
              >
                <Icon className='aside__nav-icon' />
                <span className='aside__nav-text'>{name}</span>
              </Link>
            ))}
          </aside>
        </div>

        {confirmLogout && (
          <div className="modal__box">
            <div className="modal__content">
              <p>Are you sure you want to logout?</p>
              <div className="modal__buttons">
                <button 
                  onClick={handleLogout}
                  className="modal__btn"
                  style={{backgroundColor: '#e74c3c'}}
                >
                  Yes, Logout
                </button>
                <button 
                  onClick={() => setConfirmLogout(false)}
                  className="modal__btn"
                  style={{backgroundColor: '#95a5a6'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="portal__right">
          <nav className='portal-nav__container'>
            <div className="portal-nav__left">
              <label htmlFor="search"><Search className='label-icon'/></label>
              <input type="text" name='search' placeholder='Search...'/>
            </div>

            <p>
              {user?.role === 'student' ? 'Student' :
              user?.role === 'staff' ? 'Staff' : 
              'Admin'} Dashboard
            </p>

            <div className="portal-nav__right">
              <span>
                <Bell className='bell-icon'/>
              </span>

              <div className="portal__user-info" onClick={() => setProfileDrop(prev => !prev)}>
                <div className="portal__profile-image">
                  <img src={profileImage} alt="" />
                </div>

                <div className="portal__username">
                  <h6>{toSentenceCase(user?.firstName)} {toSentenceCase(user?.lastName)}</h6>
                  <small>
                    {user?.class} 
                     {user?.class === 'SS 1' || user?.class === 'SS 2' || user?.class === 'SS 3' ? ' - ' : ''} 
                     {user?.class === 'SS 1' || user?.class === 'SS 2' || user?.class === 'SS 3' ? user?.department : ''}
                    </small>
                </div>

                {profileDrop ? <ChevronUp className='chevron-icon'/> : <ChevronDown className='chevron-icon'/>}
              </div>


            </div>
          </nav>

          <main className='main__portal'>
            {activeLink === 'Dashboard' && <DashboardPortal />}
            {activeLink === 'Profile' && <ProfilePortal onGoBack={() => setActiveLink('Dashboard')} />}
            {activeLink === 'Academics' && <AcademicsPortal />}
            {activeLink === 'Assignments' && <AssignmentPortal onGoBack={() => setActiveLink('Dashboard')} />}
            {activeLink === 'Results' && <ResultsPortal onGoBack={() => setActiveLink('Dashboard')} />}
            {activeLink === 'Timetable' && <TimeTablePortal onGoBack={() => setActiveLink('Dashboard')} />}
            {activeLink === 'Attendance' && <AttendancePortal onGoBack={() => setActiveLink('Dashboard')} />}
            {activeLink === 'Library' && <LibraryPortal onGoBack={() => setActiveLink('Dashboard')} />}
            {activeLink === 'Fees' && <FeesPortal onGoBack={() => setActiveLink('Dashboard')} />}
          </main>

        </div>
      </div>
  );
};



export default StudentDashboard;