import { useState, useEffect, useRef } from 'react';
import UnderDevelopment from './UnderDevelopment.jsx';
import '../assets/styles/profile-portal.css';
import { updateProfile, getProfile } from '../api/auth.js';
import profileImg from '../assets/images/mallam6.webp'
import asi00276 from '../assets/images/asi00276.jpg'
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
  const fileInputRef = useRef(null);
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    class: '',
  });

  const [profilePicture, setProfilePicture] = useState(asi00276);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await getProfile();
        const user = response.user;
        
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          class: user.class || '',
        });
        
        if (user.profilePicture) {
          setProfilePicture(user.profilePicture);
        }
        
        setEditableData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || 'Male',
          homeAddress: user.homeAddress || '',
          guardianName: user.guardianName || '',
          contactNumber: user.contactNumber || '',
          whatsappNumber: user.whatsappNumber || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to localStorage on error
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
          } catch (err) {
            console.error('Error parsing stored user data:', err);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fullName = `${formatName(userData.firstName)} ${formatName(userData.lastName)}`.trim();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateProfile({
        firstName: editableData.firstName,
        lastName: editableData.lastName,
        dateOfBirth: editableData.dateOfBirth,
        gender: editableData.gender,
        homeAddress: editableData.homeAddress,
        guardianName: editableData.guardianName,
        contactNumber: editableData.contactNumber,
        whatsappNumber: editableData.whatsappNumber,
        profilePicture: profilePicture,
      });
      
      // Update userData with new values
      setUserData(prev => ({
        ...prev,
        firstName: editableData.firstName,
        lastName: editableData.lastName,
      }));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const handleEditPictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result;
        if (imageData) {
          setProfilePicture(imageData);
          console.log('Profile picture selected. Click Save to upload to server.');
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
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
          <img src={profilePicture} alt="student's passport" />
        </div>

        {isEditing && (
          <div className="edit-picture" onClick={handleEditPictureClick}>
            <Settings size={16} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
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

      <div className="profile__actions">
        {isEditing ? (
          <div className="profile__edit-actions">
            <button
              type="button"
              className="profile__btn-small profile__btn-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="profile__btn-small profile__btn-cancel"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="profile__btn-small profile__btn-edit"
            onClick={handleEdit}
            disabled={isLoading}
          >
            <Edit size={16} />
            {isLoading ? 'Loading...' : 'Edit Profile'}
          </button>
        )}
      </div>
    </section>
  );
}
