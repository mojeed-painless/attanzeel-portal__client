import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getSettings } from '../api/settings';
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
  const [studentStats, setStudentStats] = useState({
    subjects: '0',
    avgScore: '0%',
    attendance: '0%',
    tasks: '0',
  });

  const adminInfoData = [
    { title: 'TOTAL STUDENTS', value: settings.totalStudents ?? '0', IconComponent: GraduationCap, color: '#3B82F6' },
    { title: 'NUMBER OF SUBJECTS', value: '62', IconComponent: TrendingUp, color: '#10B981' },
    { title: 'CURRENT TERM', value: settings.currentTerm, IconComponent: Clock4, color: '#F59E0B' },
    { title: 'ACADEMIC SESSION', value: settings.currentSession, IconComponent: ClipboardList, color: '#F43F5E' },
  ];

  // Fetch settings and student class subjects
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch settings first
        await fetchSettings();

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch student subjects only for students
        if (user?.role === 'student') {
          await fetchStudentSubjects();
        }
      } catch (error) {
        console.error('Error initializing dashboard data:', error);
        // Don't show error to user for initialization failures
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Don't show error message for settings fetch failure
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
          </>
          
      
      )}


       </section>

    </>
  );
}