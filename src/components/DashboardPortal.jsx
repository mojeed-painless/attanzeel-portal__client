import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getSettings, updateSettings } from '../api/settings';
import { getClassSubjects } from '../api/classes';
import { toSentenceCase } from '../data';
import {
  Trophy,
  GraduationCap,
  TrendingUp,
  Clock4,
  ClipboardList,
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [studentStats, setStudentStats] = useState({
    subjects: '0',
    avgScore: '0%',
    attendance: '0%',
    tasks: '0',
  });

  const adminInfoData = [
    { title: 'TOTAL STUDENTS', value: settings.totalStudents ?? '0', Icon: GraduationCap, color: '#3B82F6' },
    { title: 'NUMBER OF SUBJECTS', value: '62', Icon: TrendingUp, color: '#10B981' },
    { title: 'CURRENT TERM', value: settings.currentTerm, Icon: Clock4, color: '#F59E0B' },
    { title: 'ACADEMIC SESSION', value: settings.currentSession, Icon: ClipboardList, color: '#F43F5E' },
  ];

  // Fetch settings and student class subjects on component mount
  useEffect(() => {
    fetchSettings();
    fetchStudentSubjects();
  }, []);

  const fetchStudentSubjects = async () => {
    if (!user?.class || !user?.department) {
      console.warn('User class or department not available:', { class: user?.class, department: user?.department });
      return;
    }

    try {
      console.log('Fetching subjects for:', user.class, user.department);
      const response = await getClassSubjects(user.class, user.department);
      
      if (response.success) {
        console.log('Subjects fetched successfully:', response.subjectCount);
        setStudentStats((prev) => ({
          ...prev,
          subjects: response.subjectCount.toString(),
        }));
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
      setLoading(true);
      const response = await getSettings();
      if (response.success) {
        setSettings(response.settings);
        setTempSettings(response.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Error loading settings');
    } finally {
      setLoading(false);
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
          <h4 className="user-info__name">Welcome back, {user?.role === 'admin' ? toSentenceCase(user?.lastName) : toSentenceCase(user?.firstName)}!</h4>
          <small>{settings.currentTerm}, {settings.currentSession} Academic Session - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
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
          ].map(({title, value, Icon, color}) => (
            <div key={title} className="statistics__card">
              <span className='stats-icon' style={{background: color}}>
                <Icon size={18}/>
              </span>
              <h4>{value}</h4>
              <p>{title}</p>
            </div>
          ))}
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
                   Edit Settings
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
          <div className="portal__statistics-cards">
            {adminInfoData.map(({title, value, Icon, color}) => (
              <div className="statistics__card">
                <span className='stats-icon' style={{background: color}}>
                <Icon size={18}/>
              </span>
              <h4>{value}</h4>
              <p>{title}</p>
            </div>
          ))}
        </div>)}
       </section>
    </>
  );
}