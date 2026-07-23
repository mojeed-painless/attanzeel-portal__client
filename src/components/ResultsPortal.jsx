import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/dashboard.css';
import '../assets/styles/result-portal.css';
import { getCurrentUser } from '../api/auth.js';
import SpreadSheet from './SpreadSheet.jsx'
import ResultApproval from './ResultApproval.jsx'
import { getStudentsByClass, getStudentsByClassAndDepartment } from '../api/students.js'
import { getClassSubjects } from '../api/classes.js'
import { getResultsByYear, getResultsByYearTermClass, getApprovalStatus, updateRemovedSubjects } from '../api/results.js'
import { getSettings } from '../api/settings.js'
import FinalResult from './FinalResult.jsx'
import LoadingEffect from './LoadingEffect.jsx';
import EmptyState from './EmptyState.jsx';
import {ResultsModules} from '../data.js';
import {
  Settings, 
  UserPlus, 
  Users,
  ChevronLeft,
} from 'lucide-react';


  import {
    FileCheck,
  } from 'lucide-react';

const normalizeScores = (scores) => {
  if (!scores) return {};
  return typeof scores.toObject === 'function' ? scores.toObject() : scores;
};

const resolveStudentId = (studentId) => {
  if (!studentId) return null;
  return typeof studentId === 'object' ? studentId._id || studentId.toString() : studentId;
};

const getClassWideStudentsFromResults = (resultData, termName, className, department) => {
  if (!resultData?.terms) return [];
  const term = resultData.terms.find((t) => t.termName === termName);
  if (!term) return [];
  const seen = new Set();

  return term.classes
    .filter((cls) => cls.className === className && (
      department
        ? cls.department === department || cls.department === '' || cls.department === undefined
        : cls.department === '' || cls.department === undefined
    ))
    .flatMap((cls) => (cls.students || []).map((student) => {
      const id = resolveStudentId(student.studentId);
      if (!id || seen.has(id)) return null;
      seen.add(id);
      const studentInfo = typeof student.studentId === 'object' ? student.studentId : null;
      const name = studentInfo ? (studentInfo.name || `${studentInfo.firstName || ''} ${studentInfo.lastName || ''}`.trim()) : undefined;
      return {
        id,
        name: name || student.name || 'Unknown',
        scores: normalizeScores(student.scores),
        comments: student.comments || ''
      };
    }))
    .filter(Boolean);
};

function ResultChecker({
  selectedYear,
  selectedTerm,
  onYearChange,
  onTermChange,
  onViewResults,
  studentLoading,
  studentError,
}) {
  return (
    <>
      <div className="form-group-inline">
        <select value={selectedYear} onChange={(e) => onYearChange(e.target.value)}>
          <option value="">Select Year</option>
          <option value="2023-2024">2023/2024</option>
          <option value="2024-2025">2024/2025</option>
          <option value="2025-2026">2025/2026</option>
        </select>

        <select value={selectedTerm} onChange={(e) => onTermChange(e.target.value)}>
          <option value="">Select Term</option>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>

        <button className='approval__btn approval__btn-success' type="button" onClick={onViewResults} disabled={!selectedYear || !selectedTerm || studentLoading}>
          View Results
        </button>
      </div>

      {studentLoading && <LoadingEffect message="Loading student's results" />}
      {studentError && <EmptyState message={studentError} className='red-error'/>}
    </>
  );
}

function InputResult({
  selectedYear,
  selectedTerm,
  selectedClass,
  selectedDepartment,
  classes,
  seniorDepartments,
  isSeniorClass,
  subjects,
  removedSubjects,
  subjectToRestore,
  isPersisting,
  students,
  classWideStudents,
  existingScores,
  firstTermScores,
  secondTermScores,
  canEditSelectedClass,
  loading,
  studentError,
  onYearChange,
  onTermChange,
  onClassChange,
  onDepartmentChange,
  onLoadStudents,
  onRestoreSubject,
  onRemoveSubject,
  onSubjectToRestoreChange,
}) {
  return (
    <>
      <div className="form-group-inline">
        <select value={selectedYear} onChange={(e) => onYearChange(e.target.value)}>
          <option value="">Select Year</option>
          <option value="2023-2024">2023-2024</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
        </select>

        <select value={selectedTerm} onChange={(e) => onTermChange(e.target.value)}>
          <option value="">Select Term</option>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>

        <select value={selectedClass} onChange={onClassChange}>
          <option value="">Class</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {isSeniorClass && (
          <select value={selectedDepartment} onChange={onDepartmentChange}>
            <option value="">Select Department</option>
            {seniorDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        )}

        <button
          type="button"
          className='approval__btn approval__btn-success'
          disabled={!selectedClass || (isSeniorClass && !selectedDepartment) || loading}
          onClick={onLoadStudents}
        >
          Load Students
        </button>
      </div>

      {loading && <LoadingEffect message="Loading student" />}
      {studentError && <EmptyState message={studentError} className='red-error'/>}

      {selectedClass && !loading && !studentError && (
        <div className="results-info">
          <p><strong>{students.length}</strong> Students found in <strong>{selectedClass} {selectedDepartment}</strong></p>
        </div>
      )}

      {canEditSelectedClass && selectedClass && !loading && !studentError && (
        <div className="subjects-management">
          <div className='subjects-management__header'>
            <label htmlFor="restore-subject">Add subject back:</label>
            <select
              id="restore-subject"
              value={subjectToRestore}
              onChange={(e) => onSubjectToRestoreChange(e.target.value)}
            >
              <option value="">Select removed subject</option>
              {removedSubjects.map((subject, index) => (
                <option key={`${subject.code}-${index}`} value={subject.code}>{subject.code} - {subject.name}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={!subjectToRestore || isPersisting}
              onClick={onRestoreSubject}
              style={{ backgroundColor: subjectToRestore ? '#3b82f6' : '#dbeafe', color: subjectToRestore ? '#fff' : '#64748b', cursor: subjectToRestore ? 'pointer' : 'not-allowed' }}
            >
              {isPersisting ? 'Saving...' : 'Add Subject'}
            </button>
          </div>

          <div className="subjects-list">
            {subjects.map((subject) => (
              <div key={subject.code}>
                <span>{subject.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSubject(subject.code)}
                  aria-label={`Remove ${subject.name || subject.code}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {removedSubjects.length === 0 && (
            <p>All subjects are currently included in the spreadsheet.</p>
          )}
        </div>
      )}

      {students.length > 0 && <SpreadSheet students={students} subjects={subjects} initialScores={existingScores} academicYear={selectedYear} termName={selectedTerm} className={selectedClass} department={isSeniorClass ? selectedDepartment : undefined} allStudents={classWideStudents} readOnly={!canEditSelectedClass} firstTermScores={firstTermScores} secondTermScores={secondTermScores} />}
    </>
  );
}

export default function ResultsPortal() {


  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [removedSubjects, setRemovedSubjects] = useState([]);
  const [subjectToRestore, setSubjectToRestore] = useState('');
  const [existingScores, setExistingScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [studentResult, setStudentResult] = useState(null);
  const [studentClassResults, setStudentClassResults] = useState([]);
  const [classWideStudents, setClassWideStudents] = useState([]);
  const [classRemovedSubjects, setClassRemovedSubjects] = useState([]);
  const [showStudentResult, setShowStudentResult] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [isPersisting, setIsPersisting] = useState(false);
  const [firstTermScores, setFirstTermScores] = useState({});
  const [secondTermScores, setSecondTermScores] = useState({});
  const user = getCurrentUser();
  const [activeModule, setActiveModule] = useState(null);
  
  const fetchAllClassWideStudents = async (className, department) => {
    if (!className || !selectedYear || !selectedTerm) return [];
    try {
      const yearResults = await getResultsByYear(selectedYear);
      return getClassWideStudentsFromResults(yearResults, selectedTerm, className, department);
    } catch (error) {
      console.error('Error fetching all class-wide results:', error);
      return [];
    }
  };

  // Fetch settings and set default year/term for all users
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success && response.settings) {
          const { currentTerm, currentSession } = response.settings;
          // Convert session format from "2025/2026" to "2025-2026"
          const formattedSession = currentSession.replace('/', '-');
          setSelectedYear(formattedSession);
          setSelectedTerm(currentTerm);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Keep default values if fetch fails
      }
    };

    fetchSettings();
  }, []);

  const classes = ['Play Group', 'Kindergarten 1', 'Kindergarten 2', 'Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3']; // Hardcoded for now
  const seniorDepartments = ['Science', 'Art', 'Commercial'];
  const isSeniorClass = selectedClass.startsWith('SS ');

  const assignedClasses = React.useMemo(() => {
    if (!user?.class) return [];
    if (Array.isArray(user.class)) return user.class;
    return String(user.class)
      .split(/[,;|]+/)
      .map((className) => className.trim())
      .filter(Boolean);
  }, [user?.class]);

  const canEditSelectedClass = React.useMemo(() => {
    if (user?.role === 'admin') return true;
    if (user?.role !== 'staff') return false;
    if (!selectedClass) return false;
    return assignedClasses.includes(selectedClass);
  }, [user?.role, selectedClass, assignedClasses]);

  const fetchStudents = async (className) => {
    if (!className) return;

    setLoading(true);
    try {
      const fetchRequests = [
        getStudentsByClass(className),
        getClassSubjects(className),
        getResultsByYearTermClass(selectedYear, selectedTerm, className).catch(() => ({ students: [], removedSubjects: [] }))
      ];

      // For third term, always fetch first and second term scores so the 3rd-term spreadsheet can display prior-term data
      if (selectedTerm === 'Third Term') {
        fetchRequests.push(
          getResultsByYearTermClass(selectedYear, 'First Term', className).catch(() => ({ students: [] })),
          getResultsByYearTermClass(selectedYear, 'Second Term', className).catch(() => ({ students: [] }))
        );
      }

      const [studentsResponse, subjectsResponse, resultsResponse, firstTermResponse, secondTermResponse] = await Promise.all(fetchRequests);
      
      const persistedRemoved = resultsResponse.removedSubjects || [];
      setStudents(studentsResponse.students || []);
      setSubjects((subjectsResponse.subjects || []).filter(subject => !persistedRemoved.some(removed => removed.code === subject.code)));
      setRemovedSubjects(persistedRemoved);
      setSubjectToRestore('');
      
      setExistingScores(resultsResponse.students ? resultsResponse.students.reduce((acc, student) => {
        const studentId = resolveStudentId(student.studentId);
        if (!studentId) return acc;
        const scores = student.scores && typeof student.scores.toObject === 'function'
          ? student.scores.toObject()
          : student.scores;
        acc[studentId] = {
          scores: scores || {},
          comments: student.comments || ''
        };
        return acc;
      }, {}) : {});

      // Set first and second term scores if fetched
      if (selectedTerm === 'Third Term' && firstTermResponse) {
        setFirstTermScores(firstTermResponse.students ? firstTermResponse.students.reduce((acc, student) => {
          const studentId = resolveStudentId(student.studentId);
          if (!studentId) return acc;
          const scores = student.scores && typeof student.scores.toObject === 'function'
            ? student.scores.toObject()
            : student.scores;
          acc[studentId] = scores || {};
          return acc;
        }, {}) : {});
      }
      if (selectedTerm === 'Third Term' && secondTermResponse) {
        setSecondTermScores(secondTermResponse.students ? secondTermResponse.students.reduce((acc, student) => {
          const studentId = resolveStudentId(student.studentId);
          if (!studentId) return acc;
          const scores = student.scores && typeof student.scores.toObject === 'function'
            ? student.scores.toObject()
            : student.scores;
          acc[studentId] = scores || {};
          return acc;
        }, {}) : {});
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setSubjects([]);
      setExistingScores({});
      setFirstTermScores({});
      setSecondTermScores({});
      setStudentError('Unable to load students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByDepartment = async (className, department) => {
    if (!className || !department) return;

    setLoading(true);
    try {
      const fetchRequests = [
        getStudentsByClassAndDepartment(className, department),
        getClassSubjects(className, department),
        getResultsByYearTermClass(selectedYear, selectedTerm, className, department).catch(() => ({ students: [], removedSubjects: [] }))
      ];

      // For third term, always fetch first and second term scores so the 3rd-term spreadsheet can display prior-term data
      if (selectedTerm === 'Third Term') {
        fetchRequests.push(
          getResultsByYearTermClass(selectedYear, 'First Term', className, department).catch(() => ({ students: [] })),
          getResultsByYearTermClass(selectedYear, 'Second Term', className, department).catch(() => ({ students: [] }))
        );
      }

      const [studentsResponse, subjectsResponse, resultsResponse, firstTermResponse, secondTermResponse] = await Promise.all(fetchRequests);
      
      const persistedRemoved = resultsResponse.removedSubjects || [];
      setStudents(studentsResponse.students || []);
      setSubjects((subjectsResponse.subjects || []).filter(subject => !persistedRemoved.some(removed => removed.code === subject.code)));
      setRemovedSubjects(persistedRemoved);
      setSubjectToRestore('');
      setExistingScores(resultsResponse.students ? resultsResponse.students.reduce((acc, student) => {
        const studentId = resolveStudentId(student.studentId);
        if (!studentId) return acc;
        const scores = student.scores && typeof student.scores.toObject === 'function'
          ? student.scores.toObject()
          : student.scores;
        acc[studentId] = {
          scores: scores || {},
          comments: student.comments || ''
        };
        return acc;
      }, {}) : {});
      
      const allWideStudents = await fetchAllClassWideStudents(className, selectedDepartment);
      setClassWideStudents(allWideStudents);

      // Set first and second term scores if fetched
      if (selectedTerm === 'Third Term' && firstTermResponse) {
        setFirstTermScores(firstTermResponse.students ? firstTermResponse.students.reduce((acc, student) => {
          const studentId = resolveStudentId(student.studentId);
          if (!studentId) return acc;
          const scores = student.scores && typeof student.scores.toObject === 'function'
            ? student.scores.toObject()
            : student.scores;
          acc[studentId] = scores || {};
          return acc;
        }, {}) : {});
      }
      if (selectedTerm === 'Third Term' && secondTermResponse) {
        setSecondTermScores(secondTermResponse.students ? secondTermResponse.students.reduce((acc, student) => {
          const studentId = resolveStudentId(student.studentId);
          if (!studentId) return acc;
          const scores = student.scores && typeof student.scores.toObject === 'function'
            ? student.scores.toObject()
            : student.scores;
          acc[studentId] = scores || {};
          return acc;
        }, {}) : {});
      }
    } catch (error) {
      console.error('Error fetching students by department:', error);
      setStudents([]);
      setSubjects([]);
      setExistingScores({});
      setFirstTermScores({});
      setSecondTermScores({});
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResult = async () => {
    if (!selectedYear || !selectedTerm) {
      setStudentError('Please select both year and term.');
      return;
    }

    const studentClass = user?.class || selectedClass;
    if (!studentClass) {
      setStudentError('Your class is not available.');
      return;
    }

    setStudentLoading(true);
    setStudentError('');
    setClassRemovedSubjects([]);
    setShowStudentResult(false);

    try {
      // First check if results are approved
      const approvalStatus = await getApprovalStatus(selectedYear, selectedTerm, studentClass, user?.department);
      if (approvalStatus.approvalStatus !== 'approved') {
        setStudentError('Results for this term are not yet approved. Please check back later.');
        setStudentResult(null);
        setStudentClassResults([]);
        return;
      }

      const fetchRequests = [
        getResultsByYearTermClass(selectedYear, selectedTerm, studentClass, user?.department)
      ];

      if (selectedTerm === 'Third Term') {
        fetchRequests.push(
          getResultsByYearTermClass(selectedYear, 'First Term', studentClass, user?.department).catch(() => ({ students: [] })),
          getResultsByYearTermClass(selectedYear, 'Second Term', studentClass, user?.department).catch(() => ({ students: [] }))
        );
      }

      const [classData, firstTermResponse, secondTermResponse] = await Promise.all(fetchRequests);
      setClassRemovedSubjects(classData.removedSubjects || []);
      const studentId = user?.id || user?._id || user?.studentId;
      const student = (classData.students || []).find((s) => {
        const studentRef = typeof s.studentId === 'object'
          ? s.studentId._id || s.studentId.toString()
          : s.studentId;
        return studentRef === studentId || studentRef === String(user?.id) || studentRef === String(user?._id);
      });

      if (!student) {
        setStudentError('No results found for your record in the selected year and term.');
        setStudentResult(null);
        setStudentClassResults(classData.students || []);
        return;
      }

      if (selectedTerm === 'Third Term') {
        setFirstTermScores(firstTermResponse?.students ? firstTermResponse.students.reduce((acc, student) => {
          const studentId = resolveStudentId(student.studentId);
          if (!studentId) return acc;
          const scores = student.scores && typeof student.scores.toObject === 'function'
            ? student.scores.toObject()
            : student.scores;
          acc[studentId] = scores || {};
          return acc;
        }, {}) : {});

        setSecondTermScores(secondTermResponse?.students ? secondTermResponse.students.reduce((acc, student) => {
          const studentId = resolveStudentId(student.studentId);
          if (!studentId) return acc;
          const scores = student.scores && typeof student.scores.toObject === 'function'
            ? student.scores.toObject()
            : student.scores;
          acc[studentId] = scores || {};
          return acc;
        }, {}) : {});
      } else {
        setFirstTermScores({});
        setSecondTermScores({});
      }

      const allWideStudents = await fetchAllClassWideStudents(studentClass, user?.department);
      setStudentResult(student);
      setStudentClassResults(allWideStudents.length ? allWideStudents : (classData.students || []));
      setClassWideStudents(allWideStudents);
      setShowStudentResult(true);
    } catch (error) {
      console.error('Error fetching student result:', error);
      setStudentError('Unable to load results for the selected year and term.');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    setSelectedDepartment('');
    setStudents([]);
    setSubjects([]);
    setRemovedSubjects([]);
    setSubjectToRestore('');
    setExistingScores({});
    setFirstTermScores({});
    setSecondTermScores({});
    setClassWideStudents([]);

    if (className && !className.startsWith('SS ')) {
      fetchStudents(className);
    }
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    setStudents([]);
    setSubjects([]);
    setRemovedSubjects([]);
    setSubjectToRestore('');
    setExistingScores({});
    setFirstTermScores({});
    setSecondTermScores({});
    setClassWideStudents([]);
    if (department && selectedClass) {
      fetchStudentsByDepartment(selectedClass, department);
    } else {
      setStudents([]);
      setSubjects([]);
      setRemovedSubjects([]);
      setSubjectToRestore('');
      setExistingScores({});
    }
  };

  const persistRemovedSubjects = async (updatedRemovedSubjects) => {
    if (!selectedYear || !selectedTerm || !selectedClass || isPersisting) return;
    setIsPersisting(true);
    try {
      await updateRemovedSubjects(selectedYear, selectedTerm, selectedClass, updatedRemovedSubjects, selectedDepartment);
    } catch (error) {
      console.error('Error persisting removed subjects:', error);
    } finally {
      setIsPersisting(false);
    }
  };

  const handleRemoveSubject = (subjectCode) => {
    setSubjects(prevSubjects => {
      const removed = prevSubjects.find(subject => subject.code === subjectCode);
      if (removed) {
        setRemovedSubjects(prevRemoved => {
          const updatedRemoved = [...prevRemoved, removed];
          persistRemovedSubjects(updatedRemoved);
          return updatedRemoved;
        });
      }
      return prevSubjects.filter(subject => subject.code !== subjectCode);
    });

    if (subjectToRestore === subjectCode) {
      setSubjectToRestore('');
    }
  };

  const handleRestoreSubject = () => {
    if (!subjectToRestore) return;
    const restored = removedSubjects.find(subject => subject.code === subjectToRestore);
    if (!restored) return;
    setSubjects(prevSubjects => [...prevSubjects, restored]);
    setRemovedSubjects(prevRemoved => {
      const updatedRemoved = prevRemoved.filter(subject => subject.code !== subjectToRestore);
      persistRemovedSubjects(updatedRemoved);
      return updatedRemoved;
    });
    setSubjectToRestore('');
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setShowStudentResult(false);
    setStudentError('');
  };

  const handleTermChange = (term) => {
    setSelectedTerm(term);
    setShowStudentResult(false);
    setStudentError('');
    setFirstTermScores({});
    setSecondTermScores({});
  };

  const handleLoadStudents = () => {
    if (!selectedClass) return;
    if (isSeniorClass) {
      fetchStudentsByDepartment(selectedClass, selectedDepartment);
    } else {
      fetchStudents(selectedClass);
    }
  };

  const handleSubjectToRestoreChange = (value) => {
    setSubjectToRestore(value);
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'check_result':
        return (
          <div className="module-placeholder">
            <ResultChecker
              selectedYear={selectedYear}
              selectedTerm={selectedTerm}
              onYearChange={handleYearChange}
              onTermChange={handleTermChange}
              onViewResults={fetchStudentResult}
              studentLoading={studentLoading}
              studentError={studentError}
            />
          </div>
        );
      case 'input_result':
        return (
          <div className="module-placeholder">
            <InputResult
              selectedYear={selectedYear}
              selectedTerm={selectedTerm}
              selectedClass={selectedClass}
              selectedDepartment={selectedDepartment}
              classes={classes}
              seniorDepartments={seniorDepartments}
              isSeniorClass={isSeniorClass}
              subjects={subjects}
              removedSubjects={removedSubjects}
              subjectToRestore={subjectToRestore}
              isPersisting={isPersisting}
              students={students}
              classWideStudents={classWideStudents}
              existingScores={existingScores}
              firstTermScores={firstTermScores}
              secondTermScores={secondTermScores}
              canEditSelectedClass={canEditSelectedClass}
              loading={loading}
              studentError={studentError}
              onYearChange={handleYearChange}
              onTermChange={handleTermChange}
              onClassChange={handleClassChange}
              onDepartmentChange={handleDepartmentChange}
              onLoadStudents={handleLoadStudents}
              onRestoreSubject={handleRestoreSubject}
              onRemoveSubject={handleRemoveSubject}
              onSubjectToRestoreChange={handleSubjectToRestoreChange}
            />
          </div>
        );
      case 'pending_result': return <div className="module-placeholder"><ResultApproval /></div>;
      default: return null;
    }
  };

  return (
    <>

            <div className={`command-center ${activeModule ? 'module-active' : ''}`}>
              <header className="global-header">
                <h1>RESULTS MANAGEMENT</h1>
                {activeModule && (
                  <button className="back-button" onClick={() => setActiveModule(null)}>
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
              </header>
      
              <nav className="navigation-layer">
                <div className="card-grid">
                  {ResultsModules.map((module) => (
                    (user?.role === 'student' && module.id === 'check_result') ? (
                    <div 
                      key={module.id}
                      className={`nav-card ${activeModule === module.id ? 'is-active' : ''}`}
                      style={{ '--accent': module.color }}
                      onClick={() => setActiveModule(module.id)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) => e.key === 'Enter' && setActiveModule(module.id)}
                    >
                      {!activeModule && 
                        <div className="nav-card__back-icon">
                          <module.icon size={150} strokeWidth={1} />
                        </div>
                      }
                      <div className="nav-card__icon">
                        <module.icon size={activeModule ? 20 : 32} strokeWidth={1.5} />
                      </div>
                      <div className="nav-card__content">
                        <h3>{module.title}</h3>
                        {!activeModule && <p>{module.desc}</p>}
                      </div>
                    </div>) : 
                    (user?.role === 'staff' && module.id === 'input_result') ? (
                    <div 
                      key={module.id}
                      className={`nav-card ${activeModule === module.id ? 'is-active' : ''}`}
                      style={{ '--accent': module.color }}
                      onClick={() => setActiveModule(module.id)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) => e.key === 'Enter' && setActiveModule(module.id)}
                    >
                      {!activeModule && 
                        <div className="nav-card__back-icon">
                          <module.icon size={150} strokeWidth={1} />
                        </div>
                      }
                      <div className="nav-card__icon">
                        <module.icon size={activeModule ? 20 : 32} strokeWidth={1.5} />
                      </div>
                      <div className="nav-card__content">
                        <h3>{module.title}</h3>
                        {!activeModule && <p>{module.desc}</p>}
                      </div>
                    </div>) :
                    (user?.role === 'admin' && module.id !== 'check_result') ? (
                    <div 
                      key={module.id}
                      className={`nav-card ${activeModule === module.id ? 'is-active' : ''}`}
                      style={{ '--accent': module.color }}
                      onClick={() => setActiveModule(module.id)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) => e.key === 'Enter' && setActiveModule(module.id)}
                    >
                      {!activeModule && 
                        <div className="nav-card__back-icon">
                          <module.icon size={150} strokeWidth={1} />
                        </div>
                      }
                      <div className="nav-card__icon">
                        <module.icon size={activeModule ? 20 : 32} strokeWidth={1.5} />
                      </div>
                      <div className="nav-card__content">
                        <h3>{module.title}</h3>
                        {!activeModule && <p>{module.desc}</p>}
                      </div>
                    </div>) : (
                      ''
                    )

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

            {/* Modal for FinalResult */}
            {showStudentResult && studentResult && (
              <div className="final-result__modal-overlay" onClick={() => setShowStudentResult(false)}>
                <div className="final-result__modal-content" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="final-result__modal-close"
                    onClick={() => setShowStudentResult(false)}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                  <FinalResult
                    studentResult={studentResult}
                    classStudents={classWideStudents.length ? classWideStudents : studentClassResults}
                    selectedYear={selectedYear}
                    selectedTerm={selectedTerm}
                    studentName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                    className={user?.class || selectedClass}
                    removedSubjects={classRemovedSubjects}
                    department={user?.department}
                    firstTermScores={firstTermScores}
                    secondTermScores={secondTermScores}
                  />
                </div>
              </div>
            )}
    </>
  );
}