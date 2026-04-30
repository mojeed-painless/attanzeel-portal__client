import React, { useState, useEffect } from 'react';
import { getResultsByYear, approveResults, rejectResults, reverseApproval } from '../api/results.js';
import { getClassSubjects } from '../api/classes.js';
import SpreadSheet from './SpreadSheet.jsx';
import '../assets/styles/result-approval.css';

const normalizeScores = (scores = {}) => {
    if (!scores) return {};
    return typeof scores.toObject === 'function' ? scores.toObject() : scores;
};

const resolveStudentId = (studentId) => {
    if (!studentId) return null;
    return typeof studentId === 'object' ? studentId._id || studentId.toString() : studentId;
};

const getClassWideStudentsFromResults = (resultsData, termName, className) => {
    if (!resultsData?.terms) return [];
    const term = resultsData.terms.find((t) => t.termName === termName);
    if (!term) return [];
    const seen = new Set();

    return term.classes
        .filter((cls) => cls.className === className)
        .flatMap((cls) => (cls.students || []).map((student) => {
            const id = resolveStudentId(student.studentId);
            if (!id || seen.has(id)) return null;
            seen.add(id);
            return {
                id,
                scores: normalizeScores(student.scores || {})
            };
        }))
        .filter(Boolean);
};

const ResultApproval = () => {
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [academicYear, setAcademicYear] = useState('2025-2026');
    const [classWideStudents, setClassWideStudents] = useState([]);

    useEffect(() => {
        fetchResults();
    }, [academicYear]);

    const fetchResults = async () => {
        try {
            const data = await getResultsByYear(academicYear);
            setResults(data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleView = async (cls) => {
        try {
            const subs = await getClassSubjects(cls.className, cls.department);
            const subjectList = Array.isArray(subs) ? subs : (subs?.subjects || []);
            const removedCodes = Array.isArray(cls.removedSubjects) ? cls.removedSubjects.map(subject => subject.code) : [];
            setSubjects(subjectList.filter(subject => !removedCodes.includes(subject.code)));
            setSelectedResult(cls);
            if (cls.className.startsWith('SS ')) {
                const classWide = getClassWideStudentsFromResults(results, cls.termName, cls.className);
                setClassWideStudents(classWide);
            } else {
                setClassWideStudents([]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleApprove = async (termName, className, department) => {
        try {
            await approveResults(academicYear, termName, className, department);
            fetchResults();
        } catch (error) {
            console.error('Error approving results:', error);
        }
    };

    const handleReject = async (termName, className, department) => {
        try {
            await rejectResults(academicYear, termName, className, department);
            fetchResults();
        } catch (error) {
            console.error('Error rejecting results:', error);
        }
    };

    const handleReverseApproval = async (termName, className, department) => {
        try {
            await reverseApproval(academicYear, termName, className, department);
            fetchResults();
        } catch (error) {
            console.error('Error reversing approval:', error);
        }
    };

    const pendingApprovals = [];
    const approvedResults = [];

    results.terms?.forEach(term => {
        term.classes.forEach(cls => {
            if (cls.approvalStatus === 'pending') {
                pendingApprovals.push({ ...cls, termName: term.termName });
            } else if (cls.approvalStatus === 'approved') {
                approvedResults.push({ ...cls, termName: term.termName });
            }
        });
    });

    return (
        <div className="result-approval">
            <h2>Result Approval</h2>
            <div className="year-selector">
                <label>Academic Year:</label>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                </select>
            </div>

            <div className="approval-sections">
                <div className="pending-approvals">
                    <h3>Pending Approvals</h3>
                    {pendingApprovals.length === 0 ? (
                        <p>No pending approvals</p>
                    ) : (
                        <ul>
                            {pendingApprovals.map((cls, index) => (
                                <li key={index} className="approval-item">
                                    <span>{cls.termName} - {cls.className}{cls.department ? ` (${cls.department})` : ''}</span>
                                    <div className="actions">
                                        <button onClick={() => handleView(cls)}>View</button>
                                        <button onClick={() => handleApprove(cls.termName, cls.className, cls.department)}>Approve</button>
                                        <button onClick={() => handleReject(cls.termName, cls.className, cls.department)}>Reject</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="approved-results">
                    <h3>Approved Results</h3>
                    {approvedResults.length === 0 ? (
                        <p>No approved results</p>
                    ) : (
                        <ul>
                            {approvedResults.map((cls, index) => (
                                <li key={index} className="approval-item">
                                    <span>{cls.termName} - {cls.className}{cls.department ? ` (${cls.department})` : ''}</span>
                                    <div className="actions">
                                        <button onClick={() => handleView(cls)}>View</button>
                                        <button onClick={() => handleReverseApproval(cls.termName, cls.className, cls.department)} className="reverse-btn">Reverse Approval</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedResult && (
                <div className="result-viewer">
                    <h3>{selectedResult.termName} - {selectedResult.className}</h3>
                    <SpreadSheet
                        students={(selectedResult.students || []).map(s => {
                            const studentId = typeof s.studentId === 'object' ? s.studentId._id || s.studentId.toString() : s.studentId;
                            return { id: studentId, name: s.studentId?.name || 'Unknown Student' };
                        })}
                        subjects={subjects}
                        initialScores={(selectedResult.students || []).reduce((acc, s) => {
                            const studentId = typeof s.studentId === 'object' ? s.studentId._id || s.studentId.toString() : s.studentId;
                            const rawScores = s.scores && typeof s.scores.toObject === 'function' ? s.scores.toObject() : s.scores;
                            acc[studentId] = {
                                scores: rawScores || {},
                                comments: s.comments || ''
                            };
                            return acc;
                        }, {})}
                        academicYear={academicYear}
                        termName={selectedResult.termName}
                        className={selectedResult.className}
                        department={selectedResult.department}
                        readOnly={true}
                        allStudents={classWideStudents}
                    />
                    <button onClick={() => setSelectedResult(null)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default ResultApproval;