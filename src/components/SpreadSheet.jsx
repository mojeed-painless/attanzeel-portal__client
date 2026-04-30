import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Edit } from 'lucide-react';
import '../assets/styles/spreadsheet.css'
import EditableSpreadsheet from './EditableSpreadsheet';
import { updateStudentScores, submitForApproval, getApprovalStatus } from '../api/results.js';

export default function SpreadSheet({ students = [], subjects = [], initialScores = {}, academicYear, termName, className, department, readOnly = false, allStudents = [] }) {
    const [editMode, setEditMode] = useState(false);
    const [scores, setScores] = useState(initialScores);
    const [displayData, setDisplayData] = useState(initialScores);
    const [approvalStatus, setApprovalStatus] = useState(null);

    useEffect(() => {
        setScores(initialScores);
        setDisplayData(initialScores);
    }, [initialScores]);

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



    const normalizedSubjects = useMemo(() => Array.isArray(subjects) ? subjects : [], [subjects]);

    const getDisplayValue = useCallback((studentId, subject, type) => {
        const studentData = displayData[studentId];
        if (studentData && studentData.scores && studentData.scores[subject.code]) {
            return studentData.scores[subject.code][type] || 0;
        }
        return '0';
    }, [displayData]);

    const normalizeScores = useCallback((scores) => {
        if (!scores) return {};
        return typeof scores.toObject === 'function' ? scores.toObject() : scores;
    }, []);

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

        return mo / (subjectKeys.length * 100) * 100;
    }, [normalizeScores, normalizedSubjects]);

    const calculatePercentage = useCallback((studentId) => {
        if (normalizedSubjects.length === 0) return 0;
        const subjectTotals = normalizedSubjects.map(subject => {
            const test = parseFloat(getDisplayValue(studentId, subject, 'test')) || 0;
            const exam = parseFloat(getDisplayValue(studentId, subject, 'exam')) || 0;
            return test + exam;
        });
        const mo = subjectTotals.reduce((a, b) => a + b, 0);
        return mo / (normalizedSubjects.length * 100) * 100;
    }, [getDisplayValue, normalizedSubjects]);

    const ranks = useMemo(() => {
        const useAllStudents = Array.isArray(allStudents) && allStudents.length > 0;
        const sourceStudents = useAllStudents ? allStudents : students;
        const percentages = sourceStudents.map(student => ({
            id: student.id,
            name: student.name || student.fullName || student.firstName || student.lastName || 'Unknown',
            percentage: useAllStudents
                ? calculatePercentageFromScores(student.scores || {})
                : calculatePercentage(student.id)
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
    }, [students, allStudents, calculatePercentage, calculatePercentageFromScores, className, department]);

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
                                {normalizedSubjects.map(subject => (
                                    <React.Fragment key={subject.code}>
                                        <th>{subject.code} T</th>
                                        <th>{subject.code} E</th>
                                        <th>{subject.code} S</th>
                                    </React.Fragment>
                                ))}
                                <th>MO</th>
                                <th>%</th>
                                <th>RANK</th>
                                <th className="comment-column">COMMENTS</th>
                            </tr>
                        </thead>

                        <tbody>
                            {students.length > 0 ? students.map((student) => {
                                const subjectTotals = normalizedSubjects.map(subject => {
                                    const test = parseFloat(getDisplayValue(student.id, subject, 'test')) || 0;
                                    const exam = parseFloat(getDisplayValue(student.id, subject, 'exam')) || 0;
                                    return test + exam;
                                });
                                const mo = subjectTotals.reduce((a, b) => a + b, 0);
                                const percentage = mo > 0 ? (mo / (normalizedSubjects.length * 100) * 100).toFixed(2) : '0.00';
                                const rank = ranks[student.id] || '-';
                                
                                return (
                                    <tr key={student.id}>
                                        <td><span className='student-name'>{student.name}</span></td>
                                        {normalizedSubjects.map(subject => {
                                            const test = getDisplayValue(student.id, subject, 'test');
                                            const exam = getDisplayValue(student.id, subject, 'exam');
                                            const total = (parseFloat(test) || 0) + (parseFloat(exam) || 0);
                                            return (
                                                <React.Fragment key={`${student.id}-${subject.code}`}>
                                                    <td>{test}</td>
                                                    <td>{exam}</td>
                                                    <td className="subject-total-cell">{total}</td>
                                                </React.Fragment>
                                            );
                                        })}
                                        <td>{mo}</td>
                                        <td>{percentage}</td>
                                        <td>{rank}</td>
                                        <td className="comment-column">{displayData[student.id]?.comments || ''}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={1 + (normalizedSubjects.length * 3) + 4} style={{ textAlign: 'center', padding: '20px' }}>
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