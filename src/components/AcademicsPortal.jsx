import { useState, useEffect, useMemo } from 'react';
import { getUserRole, register } from '../api/auth';
import { getSettings, updateSettings } from '../api/settings';
import { getAllClasses } from '../api/classes';
import {
  getNextStudentUsername,
  getAllStudents,
  getStudentById,
  updateStudentApproval,
  deleteStudent,
} from '../api/students';
import {
  getAllStaff,
  getStaffById,
  updateStaffApproval,
  deleteStaff,
} from '../api/staff';
import UnderDevelopment from './UnderDevelopment.jsx';
import Bills from './Bills.jsx';
import EmptyState from './EmptyState.jsx';
import LoadingEffect from './LoadingEffect.jsx';
import ProfileBox from './ProfileBox.jsx';
import '../assets/styles/academics-portal.css';
import { AcademicsModules } from '../data.js';
import { Eye, EyeOff, Search, Filter, ChevronLeft, SearchX, X,
  Clock,
  Calendar,
  Edit3,
 } from 'lucide-react';

 import "../assets/styles/bills.css";

function AcademicsSettings() {
  const [settings, setSettings] = useState({
    currentTerm: 'First Term',
    currentSession: '2025/2026',
  });
  const [tempSettings, setTempSettings] = useState(settings);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success) {
          setSettings(response.settings);
          setTempSettings(response.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleEditClick = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setTempSettings(settings);
    setMessage('');
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const response = await updateSettings(
        tempSettings.currentTerm,
        tempSettings.currentSession
      );

      if (response.success) {
        setSettings(response.settings);
        setEditMode(false);
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage(error.response?.data?.message || 'Error updating settings');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="admin__settings-section">
      <div className="settings-card">
        <div className="settings-card__header">
          <div className="settings-card__title-group">
            <h2 className="settings-card__title">Academic Settings</h2>
            <p className="settings-card__subtitle">Manage the active timeline for the institution</p>
            {message && <div className="message-alert">{message}</div>}
          </div>
        
          {!editMode && <button className="btn-edit" onClick={handleEditClick}>
            <Edit3 size={16} /> Edit
          </button>}
        </div>

      {!editMode ? (
        <div className="settings-card__body">
          <div className='info-tile info-tile--blue'>
            <div className="info-tile__icon info-tile__icon--blue">
              <Clock size={20} />
            </div>
            <div className="info-tile__content">
              <label>Current Term</label>
              <span>
                {settings.currentTerm === 'First Term' ? '1st Term' : 
                settings.currentTerm === 'Second Term' ? '2nd Term' : 
                '3rd Term'}
              </span>
            </div>
          </div>

          <div className='info-tile info-tile--green'>
            <div className="info-tile__icon info-tile__icon--green">
              <Calendar size={20} />
            </div>
            <div className="info-tile__content">
              <label>Current Session</label>
              <span>{settings.currentSession}</span>
            </div>
          </div>
        </div>
      ) : (
          <div className="settings-edit">
            <div className="settings-form-group">
              <label>
                Current Term:
                <select
                  value={tempSettings.currentTerm}
                  onChange={(e) => setTempSettings({ ...tempSettings, currentTerm: e.target.value })}
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </label>
            </div>
            <div className="settings-form-group">
              <label>
                Current Session:
                <input
                  type="text"
                  value={tempSettings.currentSession}
                  onChange={(e) => setTempSettings({ ...tempSettings, currentSession: e.target.value })}
                  placeholder="e.g., 2025/2026"
                />
              </label>
            </div>
            <div className="settings-actions">
              <button className="btn-cancel" onClick={handleCancel} disabled={updating}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
      )}
      </div>
    </section>
  );
}

function AddNewStudent() {
  const [classOptions, setClassOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    class: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchClassOptions(), fetchNextStudentUsername()]);
    };
    initialize();
  }, []);

  const fetchClassOptions = async () => {
    try {
      const response = await getAllClasses();
      const payload = response?.classes || response?.data || response;
      const classes = Array.isArray(payload) ? payload : Array.isArray(payload?.classes) ? payload.classes : [];
      const classNames = classes.map((cls) => cls.class).filter(Boolean);
      setClassOptions([...new Set(classNames)]);
      const departments = [...new Set(classes.map((cls) => cls.department).filter(Boolean))];
      setDepartmentOptions(departments);
    } catch (err) {
      console.error('Error fetching class options:', err);
    }
  };

  const fetchNextStudentUsername = async () => {
    try {
      const response = await getNextStudentUsername();
      if (response?.nextUsername) {
        setStudentForm((prev) => ({ ...prev, username: response.nextUsername }));
      }
    } catch (err) {
      console.error('Error fetching next student username:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setStudentForm((prev) => {
      const nextForm = { ...prev, [field]: value };
      if (field === 'lastName' || field === 'username') {
        const lastName = field === 'lastName' ? value : prev.lastName;
        const username = field === 'username' ? value : prev.username;
        if (lastName && username) {
          nextForm.password = lastName.slice(0, 4).toLowerCase() + username.slice(-3).toLowerCase();
        }
      }
      return nextForm;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const { firstName, lastName, username, password, class: studentClass } = studentForm;
    if (!firstName || !lastName || !username || !password || !studentClass) {
      setError('First name, last name, username, password, and class are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        firstName: firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase(),
        lastName: lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1).toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        email: username.includes('@') ? username : `${username}@attanzeel.edu.ng`,
        role: 'student',
        admissionNumber: username.trim().toUpperCase(),
        class: studentClass,
        department: studentForm.department || '',
      };

      const response = await register(payload);
      if (response.success) {
        setMessage('Student added successfully.');
        setStudentForm({ firstName: '', lastName: '', username: '', password: '', class: '', department: '' });
        await fetchNextStudentUsername();
      } else {
        setError(response.message || 'Failed to add student.');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.response?.data?.message || 'Could not add student.');
      console.error('Error adding student:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-form-section">
      <h3>Add New Student</h3>
      {message && <div className="success-alert">{message}</div>}
      {error && <div className="error-alert">{error}</div>}
      <form className="student-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label">
            First Name *
            <input
              type="text"
              value={studentForm.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </label>
          <label className="form-label">
            Last Name *
            <input
              type="text"
              value={studentForm.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label className="form-label">
            Username *
            <input
              type="text"
              value={studentForm.username}
              placeholder={studentForm.username ? '' : 'Loading next username...'}
              readOnly
              required
            />
          </label>
          <label className="form-label">
            Password *
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={studentForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
        </div>
        <div className="form-row">
          <label className="form-label">
            Class *
            <select
              value={studentForm.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              required
            >
              <option value="">Select class</option>
              {classOptions.map((classOption) => (
                <option key={classOption} value={classOption}>{classOption}</option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Department
            <select
              value={studentForm.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
            >
              <option value="">Select department (optional)</option>
              {departmentOptions.map((departmentOption) => (
                <option key={departmentOption} value={departmentOption}>{departmentOption}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Adding student...' : 'Add Student'}
        </button>
      </form>
    </div>
  );
}

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalType, setModalType] = useState('view');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const staffData = await getAllStaff();
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (staffMember, type) => {
    setSelectedStaff(staffMember);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!loading) setShowModal(false);
  };

  const handleConfirmApproval = async (isApproved) => {
    try {
      setLoading(true);
      await updateStaffApproval(selectedStaff.id, isApproved);
      setShowModal(false);
      setError('');
      await fetchStaff();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteStaff(selectedStaff.id);
      setShowModal(false);
      setError('');
      await fetchStaff();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-management-section">
      {loading && staff.length === 0 ? (
        <LoadingEffect message="Loading staff" />
      ) : (
        <>
          {error && <div className="error-alert">{error}</div>}
          {staff.length === 0 ? (
            <EmptyState message="No staff members found." />
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="mobile-view">Title</th>
                  <th className="mobile-view">Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember.id || staffMember._id}>
                    <td>{staffMember.firstName} {staffMember.lastName}</td>
                    <td className="mobile-view">{staffMember.title}</td>
                    <td className="mobile-view">
                      <span className={`status-badge ${staffMember.isActive ? 'approved' : 'pending'}`}>
                        {staffMember.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-small btn-view" onClick={() => openModal(staffMember, 'view')}>
                        View
                      </button>
                      {!staffMember.isActive ? (
                        <button className="btn-small btn-approve mobile-view" onClick={() => openModal(staffMember, 'approve')}>
                          Approve
                        </button>
                      ) : (
                        <button className="btn-small btn-disapprove mobile-view" onClick={() => openModal(staffMember, 'disapprove')}>
                          Deactivate
                        </button>
                      )}
                      <button className="btn-small btn-delete mobile-view" onClick={() => openModal(staffMember, 'delete')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {showModal && selectedStaff && (
        <div className="profile-modal-overlay" onClick={closeModal}>
            {modalType === 'view' ? (
              <div className="modal-box-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-body">
                  <ProfileBox
                    userInfo={selectedStaff}
                    onApprove={() => openModal(selectedStaff, 'approve')}
                    onDisapprove={() => openModal(selectedStaff, 'disapprove')}
                    onDelete={() => openModal(selectedStaff, 'delete')}
                  />
                </div>
                <div className="modal-footer">
                  <button className="box-btn" onClick={closeModal}><X size={16}/></button>
                </div>
              </div>
            ) : (
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h4>{modalType === 'approve' ? 'Activate Staff Member' : modalType === 'disapprove' ? 'Deactivate Staff Member' : 'Delete Staff Member'}</h4>
                <div className="modal-body">
                  <p>
                    Are you sure you want to {modalType === 'approve' ? 'activate' : modalType === 'disapprove' ? 'deactivate' : 'delete'}{' '}
                    <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>?
                  </p>
                  {modalType === 'delete' && <p>This action cannot be undone.</p>}
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button
                    className={`btn-primary ${modalType === 'delete' ? 'btn-delete' : modalType === 'approve' ? 'btn-approve' : 'btn-disapprove'}`}
                    onClick={modalType === 'delete' ? handleConfirmDelete : () => handleConfirmApproval(modalType === 'approve')}
                    disabled={loading}
                  >
                    {loading ? (modalType === 'delete' ? 'Deleting...' : modalType === 'approve' ? 'Activating...' : 'Deactivating...') : modalType === 'delete' ? 'Delete' : modalType === 'approve' ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}
          </div>
      )}
    </div>
  );
}

function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState('view');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeFilter, setActiveFilter] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getAllStudents();
      const payload = response?.students || response?.data || response;
      setStudents(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (student, type) => {
    setSelectedStudent(student);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    if (!loading) setShowModal(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        student.firstName.toLowerCase().includes(search) ||
        student.lastName.toLowerCase().includes(search) ||
        student.username.toLowerCase().includes(search) ||
        student.class.toLowerCase().includes(search);
      const matchesClass = !filterClass || student.class === filterClass;
      const matchesStatus = !filterStatus ||
        (filterStatus === 'active' && student.isActive) ||
        (filterStatus === 'inactive' && !student.isActive);
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, filterClass, filterStatus]);

  const classOptions = useMemo(() => {
    return [...new Set(students.map((student) => student.class).filter(Boolean))];
  }, [students]);

  const handleConfirmApproval = async (isApproved) => {
    try {
      setLoading(true);
      await updateStudentApproval(selectedStudent.id, isApproved);
      setShowModal(false);
      setError('');
      await fetchStudents();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteStudent(selectedStudent.id);
      setShowModal(false);
      setError('');
      await fetchStudents();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-management-section">
      {loading && students.length === 0 ? (
        <LoadingEffect message="Loading students" />
      ) : (
        <>
          <div className="search-filter-container">
            <div className="filter-group">
              <div className="icon-btn" onClick={() => setActiveFilter((prev) => !prev)} title="Toggle filters">
                <Filter size={18} />
              </div>

              <div className={`filter-menu ${activeFilter ? 'active-filter' : ''}`}>
                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                  <option value="">All classes</option>
                  {classOptions.map((classOption) => (
                    <option key={classOption} value={classOption}>{classOption}</option>
                  ))}
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="search-box">
              <label htmlFor='search2'><Search size={18} className='label-search-icon' /></label>
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                name='search2'
              />
            </div>
            
          </div>

          {error && <div className="error-alert">{error}</div>}

          {filteredStudents.length === 0 ? (
            <EmptyState message="No students found." />
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="mobile-view">Username</th>
                  <th className="mobile-view">Class</th>
                  <th className="mobile-view">Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id || student._id}>
                    <td>{student.firstName} {student.lastName}</td>
                    <td className="mobile-view">{student.username}</td>
                    <td className="mobile-view">{student.class}</td>
                    <td className="mobile-view">
                      <span className={`status-badge ${student.isActive ? 'approved' : 'pending'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-small btn-view" onClick={() => openModal(student, 'view')}>
                        View
                      </button>
                      {!student.isActive ? (
                        <button className="btn-small btn-approve mobile-view" onClick={() => openModal(student, 'approve')}>
                          Approve
                        </button>
                      ) : (
                        <button className="btn-small btn-disapprove mobile-view" onClick={() => openModal(student, 'disapprove')}>
                          Deactivate
                        </button>
                      )}
                      <button className="btn-small btn-delete mobile-view" onClick={() => openModal(student, 'delete')}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {showModal && selectedStudent && (
        <div className="profile-modal-overlay" onClick={closeModal}>
          {modalType === 'view' ? (
            <div className="modal-box-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-body">
                  <ProfileBox
                    userInfo={selectedStudent}
                    onApprove={() => openModal(selectedStudent, 'approve')}
                    onDisapprove={() => openModal(selectedStudent, 'disapprove')}
                    onDelete={() => openModal(selectedStudent, 'delete')}
                  />
                </div>

                <div className="modal-footer">
                  <button className="box-btn" onClick={closeModal}><X size={20}/></button>
                </div>
            </div>
            ) : (
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{modalType === 'approve' ? 'Activate Student' : modalType === 'disapprove' ? 'Deactivate Student' : 'Delete Student'}</h3>
                <div className="modal-body">
                  <p>
                    Are you sure you want to {modalType === 'approve' ? 'activate' : modalType === 'disapprove' ? 'deactivate' : 'delete'}{' '}
                    <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>?
                  </p>
                  {modalType === 'delete' && <p>This action cannot be undone.</p>}
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={closeModal} disabled={loading}>
                    Cancel
                  </button>
                  <button
                    className={`btn-primary ${modalType === 'delete' ? 'btn-delete' : modalType === 'approve' ? 'btn-approve' : 'btn-disapprove'}`}
                    onClick={modalType === 'delete' ? handleConfirmDelete : () => handleConfirmApproval(modalType === 'approve')}
                    disabled={loading}
                  >
                    {loading ? (modalType === 'delete' ? 'Deleting...' : modalType === 'approve' ? 'Activating...' : 'Deactivating...') : modalType === 'delete' ? 'Delete' : modalType === 'approve' ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}
          </div>
      )}
    </div>
  );
}

function SchoolBills() {
  const [currentGrade, setCurrentGrade] = useState(null);
  const [showImage, setShowImage] = useState(false);

  const classGroups = [
    "Play Group",
    "Kindergarten",
    "Nursery",
    "Primary 1 - 3",
    "Primary 4 - 5",
    "JSS 1 - 2",
    "JSS 3",
    "SS 1 - 2",
    "SS 3",
  ];


  return (
    <>
      <div className="class-cards">
        {classGroups.map((group) => (
          <button
            key={group}
            className="class-card"
            onClick={() => {setCurrentGrade(group); setShowImage(true);}}
          >
            <span>{group}</span>
            <span className="arrow">→</span>
          </button>
        ))}
      </div>

      {showImage && (
        <div
          className="image-modal"
        >
          <button
            className="close-button"
            onClick={() => setShowImage(false)}
            aria-label="Close"
          >
            ×
          </button>

          <Bills grade={currentGrade}/>
        </div>
      )}
    </>
  );
}

export default function AcademicsPortal() {
  const [role, setRole] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  if (role !== 'admin') {
    return <UnderDevelopment section="Academics" />;
  }

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'settings':
        return <AcademicsSettings />;
      case 'add_student':
        return <AddNewStudent />;
      case 'staff':
        return <StaffManagement />;
      case 'students':
        return <StudentsManagement />;
      case 'bills':
        return <SchoolBills />
      default:
        return null;
    }
  };

  return (
    <div className={`command-center ${activeModule ? 'module-active' : ''}`}>
      <header className="global-header">
        <h1>ACADEMICS MANAGEMENT</h1>
        {activeModule && (
          <button className="back-button" onClick={() => setActiveModule(null)}>
            <ChevronLeft size={16} /> Back
          </button>
        )}
      </header>

      <nav className="navigation-layer">
        <div className="card-grid">
          {AcademicsModules.map((module) => (
            <div
              key={module.id}
              className={`nav-card ${activeModule === module.id ? 'is-active' : ''}`}
              style={{ '--accent': module.color }}
              onClick={() => setActiveModule(module.id)}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && setActiveModule(module.id)}
            >
              {!activeModule && (
                <div className="nav-card__back-icon">
                  <module.icon size={150} strokeWidth={1} />
                </div>
              )}
              <div className="nav-card__icon">
                <module.icon size={activeModule ? 20 : 28} strokeWidth={1.5} />
              </div>
              <div className="nav-card__content">
                <h3>{module.title}</h3>
                {!activeModule && <p>{module.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {activeModule && (
        <main className="module-workspace">
          <div className="workspace-container">{renderModuleContent()}</div>
        </main>
      )}
    </div>
  );
}
