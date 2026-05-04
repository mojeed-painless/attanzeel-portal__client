import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, register } from '../api/auth';
import { getSettings, updateSettings } from '../api/settings';
import { getClassSubjects, getAllClasses } from '../api/classes';
import { getResultsByYearTermClass } from '../api/results';
import { getStudentsByClass, getStudentsByClassAndDepartment } from '../api/students';
import { toSentenceCase } from '../data';
import {
  Trophy,
  GraduationCap,
  TrendingUp,
  Clock4,
  ClipboardList,
  Eye,
  EyeOff,
} from 'lucide-react';


export default function DashboardPortal() {
  const user = getCurrentUser();
  const [settings, setSettings] = useState({
    currentTerm: 'First Term',
    currentSession: '2025/2026',
    totalStudents: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [studentStats, setStudentStats] = useState({
    subjects: '0',
    avgScore: '0%',
    attendance: '0%',
    tasks: '0',
  });
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

  const adminInfoData = [
    { title: 'TOTAL STUDENTS', value: settings.totalStudents ?? '0', IconComponent: GraduationCap, color: '#3B82F6' },
    { title: 'NUMBER OF SUBJECTS', value: '62', IconComponent: TrendingUp, color: '#10B981' },
    { title: 'CURRENT TERM', value: settings.currentTerm, IconComponent: Clock4, color: '#F59E0B' },
    { title: 'ACADEMIC SESSION', value: settings.currentSession, IconComponent: ClipboardList, color: '#F43F5E' },
  ];

  // Fetch settings, student class subjects, and class options on component mount
  useEffect(() => {
    fetchSettings();
    if (user?.role === 'student') {
      fetchStudentSubjects();
    }
    fetchClassOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setStudentForm((prev) => ({ ...prev, [field]: value }));
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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

  const fetchStudentSubjects = async () => {
    if (user?.role !== 'student' || !user?.class) {
      console.warn('Cannot fetch student subjects because user is not a student or user.class is missing', user);
      return;
    }

    try {
      console.log('Fetching subjects for:', user.class, user.department);
      const response = await getClassSubjects(user.class, user.department);
      if (response.success && response.subjectCount != null) {
        console.log('Subjects fetched successfully:', response.subjectCount);
        setStudentStats((prev) => ({
          ...prev,
          subjects: response.subjectCount.toString(),
        }));
      } else {
        console.warn('Unexpected subjects response:', response);
      }
    } catch (error) {
      console.error('Error fetching student subjects:', error.message);
      if (error.response) {
        console.error('API error response:', error.response.data);
      }
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      if (response.success) {
        setSettings(response.settings);
        setTempSettings(response.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Error loading settings');
    }
  };

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
    <>
       <section className="user-info__header">
        <div>
          <h4 className="user-info__name">Welcome back, {user?.role === 'admin' ? toSentenceCase(user?.lastName) : 
             user?.role === 'staff' ? user?.title + ' ' + toSentenceCase(user?.lastName) :
            toSentenceCase(user?.firstName)}!</h4>
          <small>{settings.currentTerm}, {settings.currentSession} Session - {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
        </div>

        {user?.role === 'student' && (
          <div className="user-info__rank">
            <Trophy size={16} className="truphy-icon" />
            <small>Ranked #4 in {user?.class}</small>
          </div>
        )}
        </section>

        <section className="portal__statistics">

        {user?.role === 'student' && (
          <div className="portal__statistics-cards">
          {[
            { title: 'SUBJECTS', value: studentStats.subjects, Icon: GraduationCap, color: '#3B82F6' },
            { title: 'AVG. SCORE', value: studentStats.avgScore, Icon: TrendingUp, color: '#10B981' },
            { title: 'ATTENDANCE', value: studentStats.attendance, Icon: Clock4, color: '#F59E0B' },
            { title: 'TASKS', value: studentStats.tasks, Icon: ClipboardList, color: '#F43F5E' },
          ].map((item) => {
            const { title, value, Icon, color } = item;
            return (
              <div key={title} className="statistics__card">
                <span className='stats-icon' style={{background: color}}>
                  <Icon size={18}/>
                </span>
                <h4>{value}</h4>
                <p>{title}</p>
              </div>
            );
          })}
        </div>)}
















        {/* *********************** ADMIN CODES *********************** */}
       {user?.role === 'admin' && (
         <section className="admin__settings-section">
           <div className="settings__card">
             <h3>Academic Settings</h3>
             {message && (
               <div style={{
                 padding: '10px',
                 marginBottom: '15px',
                 borderRadius: '4px',
                 backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
                 color: message.includes('Error') ? '#721c24' : '#155724',
                 fontSize: '14px'
               }}>
                 {message}
               </div>
             )}
             
             {!editMode ? (
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <p><strong>Current Term:</strong> {settings.currentTerm}</p>
                   <p><strong>Current Session:</strong> {settings.currentSession}</p>
                 </div>
                 <button 
                   onClick={handleEditClick}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: '#3498db',
                     color: 'white',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     fontSize: '14px'
                   }}
                 >
                   Edit
                 </button>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div>
                   <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                     Current Term:
                   </label>
                   <select
                     value={tempSettings.currentTerm}
                     onChange={(e) => setTempSettings({ ...tempSettings, currentTerm: e.target.value })}
                     style={{
                       width: '100%',
                       padding: '8px',
                       border: '1px solid #ddd',
                       borderRadius: '4px',
                       fontSize: '14px'
                     }}
                   >
                     <option value="First Term">First Term</option>
                     <option value="Second Term">Second Term</option>
                     <option value="Third Term">Third Term</option>
                   </select>
                 </div>
                 
                 <div>
                   <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                     Current Session:
                   </label>
                   <input
                     type="text"
                     value={tempSettings.currentSession}
                     onChange={(e) => setTempSettings({ ...tempSettings, currentSession: e.target.value })}
                     placeholder="e.g., 2025/2026"
                     style={{
                       width: '100%',
                       padding: '8px',
                       border: '1px solid #ddd',
                       borderRadius: '4px',
                       fontSize: '14px',
                       boxSizing: 'border-box'
                     }}
                   />
                 </div>

                 <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                   <button
                     onClick={handleCancel}
                     style={{
                       padding: '8px 16px',
                       backgroundColor: '#95a5a6',
                       color: 'white',
                       border: 'none',
                       borderRadius: '4px',
                       cursor: 'pointer',
                       fontSize: '14px'
                     }}
                     disabled={updating}
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleSave}
                     style={{
                       padding: '8px 16px',
                       backgroundColor: '#27ae60',
                       color: 'white',
                       border: 'none',
                       borderRadius: '4px',
                       cursor: 'pointer',
                       fontSize: '14px'
                     }}
                     disabled={updating}
                   >
                     {updating ? 'Saving...' : 'Save Changes'}
                   </button>
                 </div>
               </div>
             )}
           </div>
         </section>
       )}



        {user?.role === 'admin' && (
          <>
          <div className="portal__statistics-cards">
            {adminInfoData.map((item) => {
              const { title, value, IconComponent, color } = item;
              return (
                <div key={title} className="statistics__card">
                  <span className='stats-icon' style={{background: color}}>
                    <IconComponent size={18}/>
                  </span>
                  <h4>{value}</h4>
                  <p>{title}</p>
                </div>
              );
            })}
          </div>



          <div className="student___form" style={{ marginTop: '24px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#ffffff' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Student</h3>
            {studentMessage && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px' }}>
                {studentMessage}
              </div>
            )}
            {studentError && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                {studentError}
              </div>
            )}
            <form onSubmit={handleAddStudent} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  First Name *
                  <input
                    type="text"
                    value={studentForm.firstName}
                    onChange={(e) => handleStudentInputChange('firstName', e.target.value)}
                    required
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  Last Name *
                  <input
                    type="text"
                    value={studentForm.lastName}
                    onChange={(e) => handleStudentInputChange('lastName', e.target.value)}
                    required
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  Username *
                  <input
                    type="text"
                    value={studentForm.username}
                    onChange={(e) => handleStudentInputChange('username', e.target.value)}
                    required
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  Password *
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={studentForm.password}
                      onChange={(e) => handleStudentInputChange('password', e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 42px 10px 10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: 0,
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  Class *
                  <select
                    value={studentForm.class}
                    onChange={(e) => handleStudentInputChange('class', e.target.value)}
                    required
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    <option value="">Select class</option>
                    {classOptions.map((classOption) => (
                      <option key={classOption} value={classOption}>{classOption}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  Department
                  <select
                    value={studentForm.department}
                    onChange={(e) => handleStudentInputChange('department', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }}
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
                disabled={studentSubmitting}
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: studentSubmitting ? 'not-allowed' : 'pointer',
                  width: 'fit-content',
                  fontWeight: 600,
                }}
              >
                {studentSubmitting ? 'Adding student...' : 'Add Student'}
              </button>
            </form>
          </div>
          </>
          
      
      )}


       </section>

    </>
  );
}