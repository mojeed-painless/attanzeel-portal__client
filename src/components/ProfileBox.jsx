import '../assets/styles/profile-box.css';
import profileImg from '../assets/images/mallam6.webp';
import asi00276 from '../assets/images/asi00276.jpg'
import {profile} from '../data.js';
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

export default function ProfileBox({ userInfo, onApprove, onDisapprove, onDelete }) {
  const isActive = userInfo?.isActive;

  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fullName = `${formatName(userInfo.firstName)} ${formatName(userInfo.lastName)}`.trim();

  return (
    <section className="profile-box__container">
      <div className="profile-box__images">
        <div className="profile-box__picture">
          <img src={asi00276} alt="student's passport" />
        </div>
      </div>

      <div className="profile-box__header-info">
        <div className="profile-box__header-left">
            <h5>{fullName}</h5>
            <p>
                Admission ID:
                <span> {userInfo.username}</span>
            </p>
            <small>{userInfo.class} {userInfo.department && `- ${userInfo.department}`}</small>
        </div>

        <div className="profile-box__header-right">
            <p>
                Registered:
                <span> {new Date(userInfo.createdAt).toLocaleDateString()}</span>
            </p>
            <p>
                Status:
                <span> {userInfo.isActive ? 'Active' : 'Inactive'}</span>
            </p>
        </div>
      </div>

      <div className="profile-box__main-info">
        {profile.map((item) => (
            <div key={item.id} className="profile-box__guardian-details">
                <h6>
                    <span className="profile-box__details-icon"><User size={16}/></span>
                    {item.header}
                </h6>

                <div className="profile-box__details">
                    {item.details.map((index) => (
                        <div key={index.id}>
                            <span className="profile-box__details-icon"><User size={16}/></span>

                            <div>
                                <small>{index.title}</small>
                                <p>{index.info}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      <div className="profile-box__actions">
        {!isActive ? (
          <button type="button" className="btn-small btn-approve" onClick={() => onApprove?.(userInfo)}>
            Approve
          </button>
        ) : (
          <button type="button" className="btn-small btn-disapprove" onClick={() => onDisapprove?.(userInfo)}>
            Deactivate
          </button>
        )}
        <button type="button" className="btn-small btn-delete" onClick={() => onDelete?.(userInfo)}>
          Delete
        </button>
      </div>
    </section>
  );
}