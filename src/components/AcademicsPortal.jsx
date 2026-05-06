import { useState, useEffect } from 'react';
import { getUserRole, register } from '../api/auth';
import { getSettings, updateSettings } from '../api/settings';
import { getAllClasses } from '../api/classes';
import { getNextStudentUsername, getAllStudents, getStudentById, updateStudentApproval, deleteStudent } from '../api/students';
import { getAllStaff, getStaffById, updateStaffApproval, deleteStaff } from '../api/staff';
import UnderDevelopment from './UnderDevelopment.jsx';
import '../assets/styles/academics-portal.css';
import {AcademicsModules} from '../data.js';
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
  ChevronLeft,
  BellRing
} from 'lucide-react';

export default function AcademicsPortal() {
  const [role, setRole] = useState(null);
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'approve', 'disapprove', 'delete'
  const [activeModule, setActiveModule] = useState(null);

  // Student form state
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
  const [studentMessage, setStudentMessage] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentSubmitting, setStudentSubmitting] = useState(false);

  // Student search and filter state
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [studentFilterClass, setStudentFilterClass] = useState('');
  const [studentFilterStatus, setStudentFilterStatus] = useState('');
  const [showStudentFilters, setShowStudentFilters] = useState(false);

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole);
    
    if (userRole === 'admin') {
      fetchStaff();
      fetchStudents();
      fetchClassOptions();
      fetchNextStudentUsername();
    }
  }, []);

  const fetchClassOptions = async () => {
    try {
      const response = await getAllClasses();
      if (response.success && Array.isArray(response.classes)) {
        const classNames = response.classes.map((cls) => cls.class).filter(Boolean);
        setClassOptions([...new Set(classNames)]);
        const departments = [...new Set(response.classes.map((cls) => cls.department).filter(Boolean))];
        setDepartmentOptions(departments);
      }
    } catch (error) {
      console.error('Error fetching class options:', error);
    }
  };

  const handleStudentInputChange = (field, value) => {
    if (field === 'username') {
      return;
    }
    
    setStudentForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate password when lastName or username changes
      if (field === 'lastName' || field === 'username') {
        const lastName = field === 'lastName' ? value : prev.lastName;
        const username = field === 'username' ? value : prev.username;
        
        if (lastName && username) {
          const firstFourOfLastName = lastName.slice(0, 4).toLowerCase();
          const lastThreeOfUsername = username.slice(-3).toLowerCase();
          updated.password = firstFourOfLastName + lastThreeOfUsername;
        }
      }
      
      return updated;
    });
  };

  const fetchNextStudentUsername = async () => {
    try {
      const response = await getNextStudentUsername();
      if (response.success && response.nextUsername) {
        setStudentForm((prev) => ({ ...prev, username: response.nextUsername }));
      }
    } catch (error) {
      console.error('Error fetching next student username:', error);
    }
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    setStudentMessage('');
    setStudentError('');

    const { firstName, lastName, username, password, class: studentClass } = studentForm;

    if (!firstName || !lastName || !username || !password || !studentClass) {
      setStudentError('First name, last name, username, password, and class are required.');
      return;
    }

    try {
      setStudentSubmitting(true);
      const email = username.includes('@') ? username : `${username}@attanzeel.edu.ng`;
      const payload = {
        firstName: firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase(),
        lastName: lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1).toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        email,
        role: 'student',
        admissionNumber: username.trim().toUpperCase(),
        class: studentClass,
        department: studentForm.department || '',
      };

      const response = await register(payload);
      if (response.success) {
        setStudentMessage('Student added successfully.');
        setStudentForm({ firstName: '', lastName: '', username: '', password: '', class: '', department: '' });
        await fetchNextStudentUsername();
      }
    } catch (error) {
      setStudentError(typeof error === 'string' ? error : error.response?.data?.message || 'Could not add student.');
      console.error('Error adding student:', error);
    } finally {
      setStudentSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const staffData = await getAllStaff();
      setStaff(staffData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await getAllStudents();
      if (response.success && Array.isArray(response.students)) {
        setStudents(response.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleViewStaff = async (staffId) => {
    try {
      const staffData = await getStaffById(staffId);
      setSelectedStaff(staffData);
      setModalType('view');
      setShowModal(true);
    } catch (err) {
      setError(err);
    }
  };

  const handleApproveClick = (staffData) => {
    setSelectedStaff(staffData);
    setModalType('approve');
    setShowModal(true);
  };

  const handleDisapproveClick = (staffData) => {
    setSelectedStaff(staffData);
    setModalType('disapprove');
    setShowModal(true);
  };

  const handleDeleteClick = (staffData) => {
    setSelectedStaff(staffData);
    setModalType('delete');
    setShowModal(true);
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

  const handleViewStudent = async (studentId) => {
    try {
      const studentData = await getStudentById(studentId);
      if (studentData.success) {
        setSelectedStudent(studentData.student);
        setModalType('view');
        setShowModal(true);
      }
    } catch (err) {
      setError(err);
    }
  };

  const handleApproveStudentClick = (studentData) => {
    setSelectedStudent(studentData);
    setModalType('approve');
    setShowModal(true);
  };

  const handleDisapproveStudentClick = (studentData) => {
    setSelectedStudent(studentData);
    setModalType('disapprove');
    setShowModal(true);
  };

  const handleDeleteStudentClick = (studentData) => {
    setSelectedStudent(studentData);
    setModalType('delete');
    setShowModal(true);
  };

  const handleConfirmStudentApproval = async (isApproved) => {
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

  const handleConfirmStudentDelete = async () => {
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

  // Filter students based on search query and filters
  const getFilteredStudents = () => {
    return students.filter((student) => {
      // Search filter
      const searchLower = studentSearchQuery.toLowerCase();
      const matchesSearch = !studentSearchQuery || 
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.username.toLowerCase().includes(searchLower) ||
        student.class.toLowerCase().includes(searchLower);

      // Class filter
      const matchesClass = !studentFilterClass || student.class === studentFilterClass;

      // Status filter
      const matchesStatus = !studentFilterStatus || 
        (studentFilterStatus === 'active' && student.isActive) ||
        (studentFilterStatus === 'inactive' && !student.isActive);

      return matchesSearch && matchesClass && matchesStatus;
    });
  };

  const AcademicsSettings = () => {
    const [settings, setSettings] = useState({
      currentTerm: 'First Term',
      currentSession: '2025/2026',
    });
    const [tempSettings, setTempSettings] = useState({
      currentTerm: 'First Term',
      currentSession: '2025/2026',
    });
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

    const handleEditClick = () => {
      setEditMode(true);
    };

    const handleCancel = () => {
      setEditMode(false);
      setTempSettings(settings);
      setMessage('');
    };

    const handleSave = async () => {
      try {
        setUpdating(true);
        const token = localStorage.getItem('token');
        const response = await updateSettings(
          tempSettings.currentTerm,
          tempSettings.currentSession,
          token
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
        <div className="settings__card">
          <h3>Academic Settings</h3>
          {message && (
            <div className="message-alert">
              {message}
            </div>
          )}

          {!editMode ? (
            <div className="settings-display">
              <div className="settings-info">
                <p><strong>Current Term:</strong> {settings.currentTerm}</p>
                <p><strong>Current Session:</strong> {settings.currentSession}</p>
              </div>
              <button className="btn-edit" onClick={handleEditClick}>
                Edit
              </button>
            </div>
          ) : (
            <div className="settings-edit">
              <div className="form-group">
                <label>Current Term:</label>
                <select
                  value={tempSettings.currentTerm}
                  onChange={(e) => setTempSettings({ ...tempSettings, currentTerm: e.target.value })}
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>

              <div className="form-group">
                <label>Current Session:</label>
                <input
                  type="text"
                  value={tempSettings.currentSession}
                  onChange={(e) => setTempSettings({ ...tempSettings, currentSession: e.target.value })}
                  placeholder="e.g., 2025/2026"
                />
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
  };

  const AddNewStudent = () => {
    return (
      <div className="student-form-section">
        <h3>Add New Student</h3>
        {studentMessage && (
          <div className="success-alert">
            {studentMessage}
          </div>
        )}
        {studentError && (
          <div className="error-alert">
            {studentError}
          </div>
        )}
        <form className="student-form" onSubmit={handleAddStudent}>
          <div className="form-row">
            <label className="form-label">
              First Name *
              <input
                type="text"
                value={studentForm.firstName}
                onChange={(e) => handleStudentInputChange('firstName', e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              Last Name *
              <input
                type="text"
                value={studentForm.lastName}
                onChange={(e) => handleStudentInputChange('lastName', e.target.value)}
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
                  onChange={(e) => handleStudentInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
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
                onChange={(e) => handleStudentInputChange('class', e.target.value)}
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
                onChange={(e) => handleStudentInputChange('department', e.target.value)}
              >
                <option value="">Select department (optional)</option>
                {departmentOptions.map((departmentOption) => (
                  <option key={departmentOption} value={departmentOption}>{departmentOption}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={studentSubmitting}
          >
            {studentSubmitting ? 'Adding student...' : 'Add Student'}
          </button>
        </form>
      </div>
    )
  }

  const StaffManagement = () => {
    return (
      loading && staff.length === 0 ? (
        <div className="loading">Loading staff...</div>
      ) : (
        <div className="staff-container">
          {staff.length === 0 ? (
            <p>No staff members found.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>{staffMember.firstName} {staffMember.lastName}</td>
                    <td>{staffMember.title}</td>
                    <td>
                      <span className={`status-badge ${staffMember.isActive ? 'approved' : 'pending'}`}>
                        {staffMember.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-small btn-view"
                        onClick={() => handleViewStaff(staffMember.id)}
                      >
                        View
                      </button>
                      {!staffMember.isActive ? (
                        <button
                          className="btn-small btn-approve"
                          onClick={() => handleApproveClick(staffMember)}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="btn-small btn-disapprove"
                          onClick={() => handleDisapproveClick(staffMember)}
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleDeleteClick(staffMember)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )
    )
  }

  const StudentsManagement = () => {
    return (
      loading && students.length === 0 ? (
        <div className="loading">Loading students...</div>
      ) : (
        <div className="staff-container">
          {getFilteredStudents().length === 0 ? (
            <p>No students found.</p>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredStudents().map((student) => (
                  <tr key={student.id}>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.username}</td>
                    <td>{student.class}</td>
                    <td>
                      <span className={`status-badge ${student.isActive ? 'approved' : 'pending'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-small btn-view"
                        onClick={() => handleViewStudent(student.id)}
                      >
                        View
                      </button>
                      {!student.isActive ? (
                        <button
                          className="btn-small btn-approve"
                          onClick={() => handleApproveStudentClick(student)}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          className="btn-small btn-disapprove"
                          onClick={() => handleDisapproveStudentClick(student)}
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleDeleteStudentClick(student)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )
    )
  }

  if (role !== 'admin') {
    return <UnderDevelopment section="Academics" />;
  }



  const renderModuleContent = () => {
    switch (activeModule) {
      case 'settings': return <div className="module-placeholder"><AcademicsSettings/></div>;
      case 'add_student': return <div className="module-placeholder"><AddNewStudent/></div>;
      case 'staff': return <div className="module-placeholder"><StaffManagement/></div>;
      case 'students': return <div className="module-placeholder"><StudentsManagement/></div>;
      default: return null;
    }
  };

  return (
    <>
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
                <div className="nav-card__icon">
                  <module.icon size={activeModule ? 20 : 32} strokeWidth={1.5} />
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
            <div className="workspace-container">
              {renderModuleContent()}
            </div>
          </main>
        )}
      </div>

      


    <div className="academics-modals">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}


      {showModal && (
        <div className="modal-overlay" onClick={() => !loading && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === 'view' && selectedStaff && (
              <>
                <h3>Staff Details</h3>
                <div className="modal-body">
                  <p><strong>Name:</strong> {selectedStaff.firstName} {selectedStaff.lastName}</p>
                  <p><strong>Title:</strong> {selectedStaff.title}</p>
                  <p><strong>Email:</strong> {selectedStaff.email}</p>
                  <p><strong>Username:</strong> {selectedStaff.username}</p>
                  <p><strong>Classes:</strong> {selectedStaff.classes || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedStaff.isActive ? 'Active' : 'Inactive'}</p>
                  <p><strong>Active:</strong> {selectedStaff.isActive ? 'Yes' : 'No'}</p>
                  <p><strong>Registered:</strong> {new Date(selectedStaff.createdAt).toLocaleDateString()}</p>
                </div>
              </>
            )}

            {modalType === 'view' && selectedStudent && (
              <>
                <h3>Student Details</h3>
                <div className="modal-body">
                  <p><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                  <p><strong>Username:</strong> {selectedStudent.username}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Class:</strong> {selectedStudent.class}</p>
                  <p><strong>Department:</strong> {selectedStudent.department || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedStudent.isActive ? 'Active' : 'Inactive'}</p>
                  <p><strong>Registered:</strong> {new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                </div>
              </>
            )}

            {modalType === 'approve' && selectedStaff && (
              <>
                <h3>Activate Staff Member</h3>
                <div className="modal-body">
                  <p>Are you sure you want to activate <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>?</p>
                </div>
              </>
            )}

            {modalType === 'approve' && selectedStudent && (
              <>
                <h3>Activate Student</h3>
                <div className="modal-body">
                  <p>Are you sure you want to activate <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>?</p>
                </div>
              </>
            )}

            {modalType === 'disapprove' && selectedStaff && (
              <>
                <h3>Deactivate Staff Member</h3>
                <div className="modal-body">
                  <p>Are you sure you want to deactivate <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>?</p>
                </div>
              </>
            )}

            {modalType === 'disapprove' && selectedStudent && (
              <>
                <h3>Deactivate Student</h3>
                <div className="modal-body">
                  <p>Are you sure you want to deactivate <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>?</p>
                </div>
              </>
            )}

            {modalType === 'delete' && selectedStaff && (
              <>
                <h3>Delete Staff Member</h3>
                <div className="modal-body">
                  <p>Are you sure you want to delete <strong>{selectedStaff.firstName} {selectedStaff.lastName}</strong>? This action cannot be undone.</p>
                </div>
              </>
            )}

            {modalType === 'delete' && selectedStudent && (
              <>
                <h3>Delete Student</h3>
                <div className="modal-body">
                  <p>Are you sure you want to delete <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>? This action cannot be undone.</p>
                </div>
              </>
            )}

            <div className="modal-footer">
              {modalType === 'view' ? (
                <button className="btn-primary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              ) : modalType === 'approve' ? (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-approve"
                    onClick={() => selectedStaff ? handleConfirmApproval(true) : handleConfirmStudentApproval(true)}
                    disabled={loading}
                  >
                    {loading ? 'Activating...' : 'Activate'}
                  </button>
                </>
              ) : modalType === 'disapprove' ? (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-disapprove"
                    onClick={() => selectedStaff ? handleConfirmApproval(false) : handleConfirmStudentApproval(false)}
                    disabled={loading}
                  >
                    {loading ? 'Deactivating...' : 'Deactivate'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-delete"
                    onClick={() => selectedStaff ? handleConfirmDelete() : handleConfirmStudentDelete()}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>


    </>
  );


}