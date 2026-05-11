import UnderDevelopment from './UnderDevelopment.jsx';
import '../assets/styles/profile-portal.css';
import profileImg from '../assets/images/mallam6.webp'
import {
  Trophy,
  GraduationCap,
  TrendingUp,
  Clock4,
  ClipboardList,
  Eye,
  EyeOff,
  Search,
  Filter,
  Settings, 
  UserPlus, 
  Users,
  User,
  ChevronLeft,
  BellRing,
  SearchX,
} from 'lucide-react';

export default function ProfilePortal() {
  return (
    <section className="profile__container">
      <div className="profile__images">
        <div className="profile__picture">
          <img src={profileImg} alt="student's passport" />
        </div>

        <div className="edit-picture">
          <Settings size={16} />
        </div>
      </div>

      <div className="profile__header-info">
        <h4>Abdurrahman Adekunle</h4>

        <p>
          Admission ID:
          <span> ASI00463</span>
        </p>

        <small>SS2 - Science</small>
      </div>

      <div className="profile__main-info">
        <div className="profile__student-details">
          <h5>
            <span className="profile__details-icon"><User size={19}/></span>
            Personal Information
          </h5>

          <div className="profile__details">
            <div>
              <span className="profile__details-icon"><Settings size={18}/></span>

              <div>
                <small>Date of Birth</small>
                <p>15 August 2011</p>
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><User size={18}/></span>

              <div>
                <small>Gender</small>
                <p>Male</p>
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><Filter size={18}/></span>

              <div>
                <small>Home Address</small>
                <p>15, Iyana Ajia Road, Ibadan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile__guardian-details">
          <h5>
            <span className="profile__details-icon"><User size={19}/></span>
            Guardian Details
          </h5>

          <div className="profile__details">
            <div>
              <span className="profile__details-icon"><User size={18}/></span>

              <div>
                <small>Guardian Name</small>
                <p>Mr. Abdurrazaq</p>
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><BellRing size={18}/></span>

              <div>
                <small>Contact Number</small>
                <p>08132145677</p>
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><Clock4 size={18}/></span>

              <div>
                <small>Whatsapp Number</small>
                <p>09014457562</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}