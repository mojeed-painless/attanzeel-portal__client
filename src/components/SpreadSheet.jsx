import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Edit } from 'lucide-react';
import '../assets/styles/spreadsheet.css'
import EditableSpreadsheet from './EditableSpreadsheet';
import { updateStudentScores, submitForApproval, getApprovalStatus } from '../api/results.js';

export default function SpreadSheet({ students = [], subjects = [], initialScores = {}, academicYear, termName, className, department, readOnly = false, allStudents = [], firstTermScores = {}, secondTermScores = {} }) {
    const [editMode, setEditMode] = useState(false);
    const [scores, setScores] = useState(initialScores);
    const [displayData, setDisplayData] = useState(initialScores);
    const [approvalStatus, setApprovalStatus] = useState(null);

    const isThirdTerm = termName === 'Third Term';

    const resolveStudentId = useCallback((studentId) => {
        if (studentId == null) return null;
        return typeof studentId === 'object' ? (studentId._id || studentId.toString()) : String(studentId);
    }, []);

    const normalizeDisplayData = useCallback((data) => {
        if (!data || typeof data !== 'object') return {};
        return Object.entries(data).reduce((acc, [studentId, studentData]) => {
            const normalizedId = resolveStudentId(studentId);
            if (!normalizedId) return acc;
            acc[normalizedId] = studentData;
            return acc;
        }, {});
    }, [resolveStudentId]);

    useEffect(() => {
        const normalized = normalizeDisplayData(initialScores);
        setScores(normalized);
        setDisplayData(normalized);
    }, [initialScores, normalizeDisplayData]);

    useEffect(() => {
        const fetchApprovalStatus = async () => {
            try {
                const response = await getApprovalStatus(academicYear, termName, className, department);
                setApprovalStatus(response.approvalStatus);
            } catch (error) {
                console.error('Error fetching approval status:', error);
            }
        };
        fetchApprovalStatus();
    }, [academicYear, termName, className, department]);

    const handleEditClick = () => {
        if (approvalStatus === 'approved') return;
        setEditMode(true);
    };

    const handleApprovalClick = async () => {
        try {
            await submitForApproval(academicYear, termName, className, department);
            setApprovalStatus('pending');
        } catch (error) {
            console.error('Error submitting for approval:', error);
        }
    };

    const handleSaveScores = async (newScores, newDisplayData) => {
        const mergedDisplayData = {
            ...displayData,
            ...newDisplayData
        };
        setScores(mergedDisplayData);
        setDisplayData(mergedDisplayData);

        // Save to database
        try {
            for (const student of students) {
                const studentId = student.id;
                if (newDisplayData[studentId]) {
                    await updateStudentScores(academicYear, termName, className, studentId, newDisplayData[studentId]);
                }
            }
        } catch (error) {
            console.error('Error saving scores:', error);
            // You might want to show an error message to the user here
        }
    };

    const normalizeScores = useCallback((scores) => {
        if (!scores) return {};
        return typeof scores.toObject === 'function' ? scores.toObject() : scores;
    }, []);

    // Helper to get third-term score (S column from current term)
    const getThirdTermScore = useCallback((studentId, subject) => {
        const studentData = displayData[studentId];
        if (studentData && studentData.scores && studentData.scores[subject.code]) {
            const test = parseFloat(studentData.scores[subject.code].test) || 0;
            const exam = parseFloat(studentData.scores[subject.code].exam) || 0;
            return test + exam;
        }
        return 0;
    }, [displayData]);

    // Helper to get first-term score (S)
    const getFirstTermScore = useCallback((studentId, subject) => {
        const scores = firstTermScores[studentId];
        if (scores && scores[subject.code]) {
            const score = scores[subject.code];
            if (typeof score === 'object' && (score.test !== undefined || score.exam !== undefined)) {
                const test = parseFloat(score.test) || 0;
                const exam = parseFloat(score.exam) || 0;
                return test + exam;
            }
            return parseFloat(score) || 0;
        }
        return 0;
    }, [firstTermScores]);

    // Helper to get second-term score (S)
    const getSecondTermScore = useCallback((studentId, subject) => {
        const scores = secondTermScores[studentId];
        if (scores && scores[subject.code]) {
            const score = scores[subject.code];
            if (typeof score === 'object' && (score.test !== undefined || score.exam !== undefined)) {
                const test = parseFloat(score.test) || 0;
                const exam = parseFloat(score.exam) || 0;
                return test + exam;
            }
            return parseFloat(score) || 0;
        }
        return 0;
    }, [secondTermScores]);

    // Helper to calculate average of available terms, excluding zeros
    const getAverageScore = useCallback((studentId, subject) => {
        const term1 = getFirstTermScore(studentId, subject);
        const term2 = getSecondTermScore(studentId, subject);
        const term3 = getThirdTermScore(studentId, subject);
        const validTerms = [term1, term2, term3].filter((score) => score > 0);
        if (validTerms.length === 0) return 0;
        const average = validTerms.reduce((sum, score) => sum + score, 0) / validTerms.length;
        return Math.ceil(average);
    }, [getFirstTermScore, getSecondTermScore, getThirdTermScore]);

    const normalizedSubjects = useMemo(() => Array.isArray(subjects) ? subjects : [], [subjects]);

    const getDisplayValue = useCallback((studentId, subject, type) => {
        const studentData = displayData[studentId];
        if (studentData && studentData.scores && studentData.scores[subject.code]) {
            return studentData.scores[subject.code][type] || 0;
        }
        return '0';
    }, [displayData]);

    const calculatePercentageFromScores = useCallback((scores) => {
        const normalized = normalizeScores(scores);
        const subjectKeys = normalizedSubjects.length > 0
            ? normalizedSubjects.map((subject) => subject.code)
            : Object.keys(normalized);

        if (subjectKeys.length === 0) return 0;

        const mo = subjectKeys.reduce((total, subjectCode) => {
            const score = normalizeScores(normalized[subjectCode] || {});
            return total + (parseFloat(score.test) || 0) + (parseFloat(score.exam) || 0);
        }, 0);

        return parseFloat((mo / (subjectKeys.length * 100) * 100).toFixed(2));
    }, [normalizeScores, normalizedSubjects]);

    const calculatePercentage = useCallback((studentId) => {
        if (normalizedSubjects.length === 0) return 0;
        const subjectTotals = normalizedSubjects.map(subject => {
            const test = parseFloat(getDisplayValue(studentId, subject, 'test')) || 0;
            const exam = parseFloat(getDisplayValue(studentId, subject, 'exam')) || 0;
            return test + exam;
        });
        const mo = subjectTotals.reduce((a, b) => a + b, 0);
        return parseFloat((mo / (normalizedSubjects.length * 100) * 100).toFixed(2));
    }, [getDisplayValue, normalizedSubjects]);

    // For third term: calculate MO as sum of subject averages
    const calculateThirdTermMO = useCallback((studentId) => {
        if (normalizedSubjects.length === 0) return 0;
        const subjectAverages = normalizedSubjects.map(subject => getAverageScore(studentId, subject));
        return Math.ceil(subjectAverages.reduce((a, b) => a + b, 0));
    }, [normalizedSubjects, getAverageScore]);

    // For third term: calculate percentage based on sum of averages
    const calculateThirdTermPercentage = useCallback((studentId) => {
        if (normalizedSubjects.length === 0) return 0;
        const mo = calculateThirdTermMO(studentId);
        return parseFloat(((mo / (normalizedSubjects.length * 100)) * 100).toFixed(2));
    }, [normalizedSubjects, calculateThirdTermMO]);

    const ranks = useMemo(() => {
        const useAllStudents = Array.isArray(allStudents) && allStudents.length > 0;
        const sourceStudents = useAllStudents ? allStudents : students;
        const percentages = sourceStudents.map(student => ({
            id: student.id,
            name: student.name || student.fullName || student.firstName || student.lastName || 'Unknown',
            percentage: isThirdTerm
                ? calculateThirdTermPercentage(student.id)
                : (useAllStudents
                    ? calculatePercentageFromScores(student.scores || {})
                    : calculatePercentage(student.id))
        }));
        
        percentages.sort((a, b) => b.percentage - a.percentage);
        
        const rankMap = {};
        percentages.forEach((item, index) => {
            rankMap[item.id] = index + 1;
        });

        console.groupCollapsed('SpreadSheet ranking debug');
        console.log('className:', className, 'department:', department, 'useAllStudents:', useAllStudents, 'sourceStudents:', sourceStudents.length);
        console.table(percentages.map(item => ({ id: item.id, name: item.name, percentage: item.percentage, rank: rankMap[item.id] })));
        console.groupEnd();
        
        return rankMap;
    }, [students, allStudents, calculatePercentage, calculatePercentageFromScores, calculateThirdTermPercentage, isThirdTerm, className, department]);

    return (
        <>
            {editMode && (
                <EditableSpreadsheet
                    students={students}
                    subjects={subjects}
                    initialScores={scores}
                    onSave={handleSaveScores}
                    onSaveAndExit={async (newScores, newDisplayData) => {
                        await handleSaveScores(newScores, newDisplayData);
                        setEditMode(false);
                    }}
                    onCancel={() => setEditMode(false)}
                />
            )}
            
            <div className="result__spreadsheet" style={{ opacity: editMode ? 0.5 : 1 }}>
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    {!readOnly && (
                        <>
                            <button className="edit-button" onClick={handleEditClick} disabled={approvalStatus === 'approved'}>
                                <Edit size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Edit Scores
                            </button>
                            <button 
                                className={`approval-button ${approvalStatus}`} 
                                onClick={handleApprovalClick} 
                                disabled={approvalStatus === 'approved' || approvalStatus === 'pending'}
                            >
                                {approvalStatus === 'pending' ? 'Pending' : approvalStatus === 'approved' ? 'Approved' : 'Seek Approval'}
                            </button>
                        </>
                    )}
                </div>
                
                <div className="result_table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                {isThirdTerm ? (
                                    // Third term columns: 1, 2, 3, A (average)
                                    normalizedSubjects.map(subject => (
                                        <React.Fragment key={subject.code}>
                                            <th>{subject.code} 1</th>
                                            <th>{subject.code} 2</th>
                                            <th>{subject.code} 3</th>
                                            <th>{subject.code} A</th>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    // Normal columns: T, E, S
                                    normalizedSubjects.map(subject => (
                                        <React.Fragment key={subject.code}>
                                            <th>{subject.code} T</th>
                                            <th>{subject.code} E</th>
                                            <th>{subject.code} S</th>
                                        </React.Fragment>
                                    ))
                                )}
                                <th>MO</th>
                                <th>%</th>
                                <th>RANK</th>
                                <th className="comment-column">COMMENTS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.length > 0 ? students.map((student) => {
                                let mo;
                                let percentage;

                                if (isThirdTerm) {
                                    // For third term: calculate MO as sum of subject averages
                                    mo = calculateThirdTermMO(student.id);
                                    percentage = calculateThirdTermPercentage(student.id);
                                } else {
                                    // Normal calculation
                                    const subjectTotals = normalizedSubjects.map(subject => {
                                        const test = parseFloat(getDisplayValue(student.id, subject, 'test')) || 0;
                                        const exam = parseFloat(getDisplayValue(student.id, subject, 'exam')) || 0;
                                        return test + exam;
                                    });
                                    mo = Math.ceil(subjectTotals.reduce((a, b) => a + b, 0));
                                    percentage = mo > 0 ? parseFloat((mo / (normalizedSubjects.length * 100) * 100).toFixed(2)) : 0;
                                }
                                const rank = ranks[student.id] || '-';
                                
                                return (
                                    <tr key={student.id}>
                                        <td><span className='student-name'>{student.name}</span></td>
                                        {isThirdTerm ? (
                                            // Third term row: show 1, 2, 3, A columns
                                            normalizedSubjects.map(subject => {
                                                const term1 = getFirstTermScore(student.id, subject);
                                                const term2 = getSecondTermScore(student.id, subject);
                                                const term3 = getThirdTermScore(student.id, subject);
                                                const avg = getAverageScore(student.id, subject);
                                                return (
                                                    <React.Fragment key={`${student.id}-${subject.code}`}>
                                                        <td>{term1}</td>
                                                        <td>{term2}</td>
                                                        <td>{term3}</td>
                                                        <td className="subject-total-cell">{avg}</td>
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            // Normal row: show T, E, S columns
                                            normalizedSubjects.map(subject => {
                                                const test = getDisplayValue(student.id, subject, 'test');
                                                const exam = getDisplayValue(student.id, subject, 'exam');
                                                const total = Math.ceil((parseFloat(test) || 0) + (parseFloat(exam) || 0));
                                                return (
                                                    <React.Fragment key={`${student.id}-${subject.code}`}>
                                                        <td>{test}</td>
                                                        <td>{exam}</td>
                                                        <td className="subject-total-cell">{total}</td>
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                        <td>{mo}</td>
                                        <td>{percentage}</td>
                                        <td>{rank}</td>
                                        <td className="comment-column">{displayData[student.id]?.comments || ''}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={1 + (normalizedSubjects.length * (isThirdTerm ? 4 : 3)) + 4} style={{ textAlign: 'center', padding: '20px' }}>
                                        No students found for the selected class
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}