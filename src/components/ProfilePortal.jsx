import { useState, useEffect } from 'react';
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
  Edit,
  Save,
  X,
} from 'lucide-react';

export default function ProfilePortal() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    class: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '15 August 2011',
    gender: 'Male',
    homeAddress: '15, Iyana Ajia Road, Ibadan.',
    guardianName: 'Mr. Abdurrazaq',
    contactNumber: '08132145677',
    whatsappNumber: '09014457562',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          class: user.class || '',
        });
        setEditableData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fullName = `${formatName(userData.firstName)} ${formatName(userData.lastName)}`.trim();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you could add API call to save the data
    console.log('Saving profile data:', editableData);
    setIsEditing(false);
    // Update userData with new values
    setUserData(prev => ({
      ...prev,
      firstName: editableData.firstName,
      lastName: editableData.lastName,
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset editable data to original values
    setEditableData(prev => ({
      ...prev,
      firstName: userData.firstName,
      lastName: userData.lastName,
    }));
  };

  const handleInputChange = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
        {isEditing ? (
          <div className="profile__edit-header">
            <div className="profile__name-inputs">
              <input
                type="text"
                value={editableData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="First Name"
                className="profile__input"
              />
              <input
                type="text"
                value={editableData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Last Name"
                className="profile__input"
              />
            </div>
            <p>
              Admission ID:
              <span> {userData.username}</span>
            </p>
            <small>{userData.class}</small>
          </div>
        ) : (
          <>
            <h4>{fullName || 'Loading...'}</h4>
            <p>
              Admission ID:
              <span> {userData.username}</span>
            </p>
            <small>{userData.class}</small>
          </>
        )}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="profile__input"
                  />
                ) : (
                  <p>{editableData.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><User size={18}/></span>

              <div>
                <small>Gender</small>
                {isEditing ? (
                  <select
                    value={editableData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="profile__input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p>{editableData.gender}</p>
                )}
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><Filter size={18}/></span>

              <div>
                <small>Home Address</small>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.homeAddress}
                    onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                    className="profile__input"
                  />
                ) : (
                  <p>{editableData.homeAddress}</p>
                )}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    className="profile__input"
                  />
                ) : (
                  <p>{editableData.guardianName}</p>
                )}
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><BellRing size={18}/></span>

              <div>
                <small>Contact Number</small>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editableData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className="profile__input"
                  />
                ) : (
                  <p>{editableData.contactNumber}</p>
                )}
              </div>
            </div>

            <div>
              <span className="profile__details-icon"><Clock4 size={18}/></span>

              <div>
                <small>Whatsapp Number</small>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editableData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    className="profile__input"
                  />
                ) : (
                  <p>{editableData.whatsappNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="profile__actions">
        {isEditing ? (
          <div className="profile__edit-actions">
            <button
              type="button"
              className="btn-small btn-save"
              onClick={handleSave}
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              type="button"
              className="btn-small btn-cancel"
              onClick={handleCancel}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-small btn-edit"
            onClick={handleEdit}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        )}
      </div> */}
    </section>
  );
}