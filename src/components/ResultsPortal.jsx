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


  import {
    FileCheck,
  } from 'lucide-react';


export default function ResultsPortal() {


  const [checkResult, setCheckResult] = useState(false);
  const [showResultApproval, setShowResultApproval] = useState(false);
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

      // For third term read-only, also fetch first and second term scores
      if (selectedTerm === 'Third Term' && !canEditSelectedClass) {
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

      // For third term read-only, also fetch first and second term scores
      if (selectedTerm === 'Third Term' && !canEditSelectedClass) {
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

      const classData = await getResultsByYearTermClass(selectedYear, selectedTerm, studentClass, user?.department);
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

  return (
    <>

            <button className="check-result" onClick={() => setCheckResult(cr => !cr)}>
              <FileCheck size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }}/>
              {user?.role === 'student' ? 'Check Student Result' : 'Input Student Result'}
            </button>

            {user?.role === 'admin' && 
            
            <button className="check-result" onClick={() => setShowResultApproval(sa => !sa)}>
              <FileCheck size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }}/>
              View Pending Results
            </button>
            }


            {checkResult && user?.role === 'student' && (
              <div className="form-group-inline">
                <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setShowStudentResult(false); setStudentError(''); }}>
                  <option value="">Select Year</option>
                  <option value="2023-2024">2023/2024</option>
                  <option value="2024-2025">2024/2025</option>
                  <option value="2025-2026">2025/2026</option>
                </select>

                <select value={selectedTerm} onChange={(e) => { setSelectedTerm(e.target.value); setShowStudentResult(false); setStudentError(''); }}>
                  <option value="">Select Term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>

                <button type="button" onClick={fetchStudentResult} disabled={!selectedYear || !selectedTerm || !user?.class || studentLoading}>
                  View Results
                </button>
              </div>
            )}

            {studentLoading && <LoadingEffect message="Loading student's results" />}
            {studentError && <p style={{ color: 'red', marginTop: '0.75rem' }}>{studentError}</p>}

            {/* Modal for FinalResult */}
            {showStudentResult && studentResult && (
              <div className="modal-overlay" onClick={() => setShowStudentResult(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="modal-close"
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
                  />
                </div>
              </div>
            )}







            {checkResult && user?.role !== 'student' && <div className="form-group-inline">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">Select Year</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>

              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
                <option value="">Select Term</option>
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>

              <select value={selectedClass} onChange={handleClassChange}>
                <option value="">Class</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {isSeniorClass && (
                <select value={selectedDepartment} onChange={handleDepartmentChange}>
                  <option value="">Select Department</option>
                  {seniorDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              )}
              
              <button
                type="button"
                disabled={!selectedClass || (isSeniorClass && !selectedDepartment) || loading}
                onClick={() => {
                  if (isSeniorClass) {
                    fetchStudentsByDepartment(selectedClass, selectedDepartment);
                  } else if (selectedClass) {
                    fetchStudents(selectedClass);
                  }
                }}
              >
                {loading ? 'Loading...' : 'Load Students'}
              </button>
            </div>}

            {user?.role !== 'student' && checkResult && (
              <div className="results-info">
              {loading && <LoadingEffect message="Loading students" />}
                {selectedClass && !loading && (
                  <p><strong>{students.length}</strong> Students found in <strong>{selectedClass} {selectedDepartment}</strong></p>
                )}
              </div>
            )}

            {canEditSelectedClass && checkResult && selectedClass && (
              <div className="subjects-management">
                <div className='subjects-management__header'>
                  <label htmlFor="restore-subject">Add subject back:</label>
                  <select
                    id="restore-subject"
                    value={subjectToRestore}
                    onChange={(e) => setSubjectToRestore(e.target.value)}
                  >
                    <option value="">Select removed subject</option>
                    {removedSubjects.map((subject, index) => (
                      <option key={`${subject.code}-${index}`} value={subject.code}>{subject.code} - {subject.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!subjectToRestore || isPersisting}
                    onClick={handleRestoreSubject}
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
                        onClick={() => handleRemoveSubject(subject.code)}
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

            {user?.role !== 'student' && students.length > 0 && <SpreadSheet students={students} subjects={subjects} initialScores={existingScores} academicYear={selectedYear} termName={selectedTerm} className={selectedClass} department={isSeniorClass ? selectedDepartment : undefined} allStudents={classWideStudents} readOnly={!canEditSelectedClass} firstTermScores={firstTermScores} secondTermScores={secondTermScores} />}
            

            {showResultApproval && user?.role === 'admin' && <ResultApproval />}


    </>
  );
}