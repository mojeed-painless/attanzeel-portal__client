import React, { useState, useEffect } from 'react';
import { getResultsByYear, getResultsByYearTermClass, approveResults, rejectResults, reverseApproval } from '../api/results.js';
import { getClassSubjects } from '../api/classes.js';
import SpreadSheet from './SpreadSheet.jsx';
import LoadingEffect from './LoadingEffect.jsx';
import '../assets/styles/result-approval.css';
import { Eye, CheckCircle, XCircle, Undo, SearchX } from 'lucide-react';
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
    const [firstTermScores, setFirstTermScores] = useState({});
    const [secondTermScores, setSecondTermScores] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchResults();
    }, [academicYear]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getResultsByYear(academicYear);
            setResults(data);
        } catch (error) {
            console.error('Error fetching results:', error);
            setError('Unable to load approval data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (cls) => {
        try {
            setLoading(true);
            setError('');
            const subs = await getClassSubjects(cls.className, cls.department);
            const subjectList = Array.isArray(subs) ? subs : (subs?.subjects || []);
            const removedCodes = Array.isArray(cls.removedSubjects) ? cls.removedSubjects.map(subject => subject.code) : [];
            setSubjects(subjectList.filter(subject => !removedCodes.includes(subject.code)));
            setFirstTermScores({});
            setSecondTermScores({});

            if (cls.termName === 'Third Term') {
                const [firstTermResult, secondTermResult] = await Promise.all([
                    getResultsByYearTermClass(academicYear, 'First Term', cls.className, cls.department).catch(() => ({ students: [] })),
                    getResultsByYearTermClass(academicYear, 'Second Term', cls.className, cls.department).catch(() => ({ students: [] }))
                ]);

                setFirstTermScores(firstTermResult.students ? firstTermResult.students.reduce((acc, student) => {
                    const studentId = resolveStudentId(student.studentId);
                    if (!studentId) return acc;
                    const scores = student.scores && typeof student.scores.toObject === 'function' ? student.scores.toObject() : student.scores;
                    acc[studentId] = scores || {};
                    return acc;
                }, {}) : {});

                setSecondTermScores(secondTermResult.students ? secondTermResult.students.reduce((acc, student) => {
                    const studentId = resolveStudentId(student.studentId);
                    if (!studentId) return acc;
                    const scores = student.scores && typeof student.scores.toObject === 'function' ? student.scores.toObject() : student.scores;
                    acc[studentId] = scores || {};
                    return acc;
                }, {}) : {});
            }

            if (cls.className.startsWith('SS ')) {
                const classWide = getClassWideStudentsFromResults(results, cls.termName, cls.className);
                setClassWideStudents(classWide);
            } else {
                setClassWideStudents([]);
            }

            setSelectedResult(cls);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setError('Unable to load result details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (termName, className, department) => {
        try {
            setLoading(true);
            setError('');
            await approveResults(academicYear, termName, className, department);
            await fetchResults();
        } catch (error) {
            console.error('Error approving results:', error);
            setError('Unable to approve results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (termName, className, department) => {
        try {
            setLoading(true);
            setError('');
            await rejectResults(academicYear, termName, className, department);
            await fetchResults();
        } catch (error) {
            console.error('Error rejecting results:', error);
            setError('Unable to reject results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReverseApproval = async (termName, className, department) => {
        try {
            setLoading(true);
            setError('');
            await reverseApproval(academicYear, termName, className, department);
            await fetchResults();
        } catch (error) {
            console.error('Error reversing approval:', error);
            setError('Unable to reverse approval. Please try again.');
        } finally {
            setLoading(false);
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
        <div>

            {error && <div className="error-alert">{error}</div>}
            {/* {loading && !selectedResult && <div className="loading">Loading approvals...</div>} */}
            
            <div className="year-selector">
                <label>Academic Year:</label>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                    <option value="2024-2025">2024 - 2025</option>
                    <option value="2025-2026">2025 - 2026</option>
                </select>
            </div>

            {loading && <LoadingEffect />}

            <div className="approval-sections">
                <div className="pending-approvals">
                    <h3>PENDING APPROVALS</h3>

                    {pendingApprovals.length === 0 ? (
                        <div className="empty-state">
                            <SearchX size={48} className="empty-state__icon" />
                            <p className="empty-state__text">No pending approvals.</p>
                        </div>
                    ) : (
                    <div className="approval__table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Term</th>
                                    <th className="table__header-actions">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pendingApprovals.map((cls, index) => (
                                    <tr key={index}>
                                        <td>{cls.className}{cls.department ? ` (${cls.department})` : ''}</td>
                                        <td>{cls.termName}</td>
                                        <td className="table__cell-actions">
                                            <button className='approval__btn approval__btn-outline' onClick={() => handleView(cls)} disabled={loading}>
                                                {loading ? 'Loading...' : <span><Eye size={16} /> View</span>}
                                            </button>

                                            <button className='approval__btn approval__btn-success' onClick={() => handleApprove(cls.termName, cls.className, cls.department)} disabled={loading}>
                                                {loading ? 'Processing...' : <span><CheckCircle size={16} /> Approve</span>}
                                            </button>

                                            <button className='approval__btn approval__btn-danger' onClick={() => handleReject(cls.termName, cls.className, cls.department)} disabled={loading}>
                                                {loading ? 'Processing...' : <span><XCircle size={16} /> Reject</span>}
                                            </button>    
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>

                <div className="approved-results">
                    <h3>APPROVED RESULTS</h3>
                    {approvedResults.length === 0 ? (
                        <div className="empty-state">
                            <SearchX size={48} className="empty-state__icon" />
                            <p className="empty-state__text">No approved results.</p>
                        </div>
                    ) : (
                        <div className="approval__table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Class</th>
                                        <th>Term</th>
                                        <th className="table__header-actions">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {approvedResults.map((cls, index) => (
                                        <tr key={index}>
                                            <td>{cls.className}{cls.department ? ` (${cls.department})` : ''}</td>
                                            <td>{cls.termName}</td>
                                            <td className="table__cell-actions" >
                                                <button className='approval__btn approval__btn-outline' onClick={() => handleView(cls)} disabled={loading}>
                                                    {loading ? 'Loading...' : <span><Eye size={16} /> View</span>}
                                                </button>

                                                <button className='approval__btn approval__btn-ghost-destructive' onClick={() => handleReverseApproval(cls.termName, cls.className, cls.department)} disabled={loading}>
                                                    {loading ? 'Processing...' : <span><Undo size={16} /> Reverse</span>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && selectedResult && (
                <div className="result-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="result-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="result-modal-header">
                            <h3>{selectedResult.termName} - {selectedResult.className}</h3>
                            <button className="result-modal-close" onClick={() => { setShowModal(false); setSelectedResult(null); }}>&times;</button>
                        </div>
                        <div className="result-modal-content">
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
                                firstTermScores={firstTermScores}
                                secondTermScores={secondTermScores}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultApproval;