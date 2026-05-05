import React, { useState, useMemo, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import '../assets/styles/spreadsheet.css';
import LoadingEffect from './LoadingEffect.jsx';

export default function EditableSpreadsheet({ students = [], subjects = [], initialScores = {}, onSave, onSaveAndExit, onCancel }) {
    const [scores, setScores] = useState({});
    const [comments, setComments] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Convert initialScores to the format expected by the component
        const convertedScores = {};
        const convertedComments = {};
        Object.entries(initialScores).forEach(([studentId, studentData]) => {
            // Handle scores
            if (studentData.scores) {
                Object.entries(studentData.scores).forEach(([subjectCode, scoreData]) => {
                    convertedScores[`${studentId}-${subjectCode}-test`] = scoreData.test?.toString() || '';
                    convertedScores[`${studentId}-${subjectCode}-exam`] = scoreData.exam?.toString() || '';
                });
            }
            // Handle comments
            convertedComments[studentId] = studentData.comments || '';
        });
        setScores(convertedScores);
        setComments(convertedComments);
        setHasChanges(false);
    }, [initialScores]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // Autosave every 10 seconds if there are changes
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (hasChanges) {
                const apiScores = {};
                students.forEach(student => {
                    apiScores[student.id] = { scores: {}, comments: comments[student.id] || '' };
                });
                Object.entries(scores).forEach(([key, value]) => {
                    const [studentId, subjectCode, type] = key.split('-');
                    if (!apiScores[studentId]) apiScores[studentId] = { scores: {}, comments: comments[studentId] || '' };
                    if (!apiScores[studentId].scores[subjectCode]) apiScores[studentId].scores[subjectCode] = {};
                    apiScores[studentId].scores[subjectCode][type] = parseFloat(value) || 0;
                });

                (async () => {
                    try {
                        await onSave(scores, apiScores);
                        setHasChanges(false);
                    } catch (error) {
                        console.error('Autosave failed:', error);
                    }
                })();
            }
        }, 10000); // Autosave every 10 seconds

        return () => clearInterval(autoSaveInterval);
    }, [scores, hasChanges, onSave, students, comments]);



    const handleScoreChange = (studentId, subjectCode, type, value) => {
        const key = `${studentId}-${subjectCode}-${type}`;
        setScores(prev => ({
            ...prev,
            [key]: value === '' ? '' : Math.max(0, Math.min(100, parseFloat(value) || 0)).toString()
        }));
        setHasChanges(true);
    };

    const handleCommentChange = (studentId, value) => {
        setComments(prev => ({
            ...prev,
            [studentId]: value
        }));
        setHasChanges(true);
    };

    const getComment = (studentId) => {
        return comments[studentId] || '';
    };

    const getScore = (studentId, subjectCode, type) => {
        const key = `${studentId}-${subjectCode}-${type}`;
        return scores[key] !== undefined ? scores[key] : '';
    };

    const calculateSubjectTotal = (studentId, subject) => {
        const testKey = `${studentId}-${subject.code}-test`;
        const examKey = `${studentId}-${subject.code}-exam`;
        const test = parseFloat(scores[testKey]) || 0;
        const exam = parseFloat(scores[examKey]) || 0;
        return test + exam;
    };

    const calculateMO = (studentId) => {
        return subjects.reduce((total, subject) => {
            return total + calculateSubjectTotal(studentId, subject);
        }, 0);
    };

    const calculatePercentage = (studentId) => {
        if (subjects.length === 0) return '0.00';
        const mo = calculateMO(studentId);
        const maxTotal = subjects.length * 100;
        return (mo / maxTotal * 100).toFixed(2);
    };

    const getRanks = useMemo(() => {
        const percentages = students.map(student => ({
            id: student.id,
            percentage: parseFloat(calculatePercentage(student.id))
        }));
        
        percentages.sort((a, b) => b.percentage - a.percentage);
        
        const ranks = {};
        percentages.forEach((item, index) => {
            ranks[item.id] = index + 1;
        });
        
        return ranks;
    }, [students, scores, subjects]);

    const handleSave = async () => {
        const apiScores = {};
        students.forEach(student => {
            apiScores[student.id] = { scores: {}, comments: comments[student.id] || '' };
        });
        Object.entries(scores).forEach(([key, value]) => {
            const [studentId, subjectCode, type] = key.split('-');
            if (!apiScores[studentId]) apiScores[studentId] = { scores: {}, comments: comments[studentId] || '' };
            if (!apiScores[studentId].scores[subjectCode]) apiScores[studentId].scores[subjectCode] = {};
            apiScores[studentId].scores[subjectCode][type] = parseFloat(value) || 0;
        });

        try {
            setSaving(true);
            await onSave(scores, apiScores);
            setHasChanges(false);
            setShowSuccess(true);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndExit = async () => {
        if (onSaveAndExit) {
            const apiScores = {};
            students.forEach(student => {
                apiScores[student.id] = { scores: {}, comments: comments[student.id] || '' };
            });
            Object.entries(scores).forEach(([key, value]) => {
                const [studentId, subjectCode, type] = key.split('-');
                if (!apiScores[studentId]) apiScores[studentId] = { scores: {}, comments: comments[studentId] || '' };
                if (!apiScores[studentId].scores[subjectCode]) apiScores[studentId].scores[subjectCode] = {};
                apiScores[studentId].scores[subjectCode][type] = parseFloat(value) || 0;
            });

            try {
                setSaving(true);
                await onSaveAndExit(scores, apiScores);
                setHasChanges(false);
                setShowSuccess(true);
            } catch (error) {
                console.error('Save and exit failed:', error);
            } finally {
                setSaving(false);
            }
        }

        onCancel();
    };

    return (
        <div className="editable-spreadsheet-overlay">
            <div className="editable-spreadsheet-container">
                <div className="editable-spreadsheet-header">
                    <h2>Edit Student Scores</h2>

                    {saving && <LoadingEffect message='Saving Scores'/>}
                    
                    <div className="editable-spreadsheet-buttons">
                        <button className={`save-button ${!hasChanges || saving ? 'disabled' : ''}`} onClick={handleSave} disabled={!hasChanges || saving}>
                            <Save size={20} style={{ marginRight: '8px' }} />
                            Save
                        </button>
                        <button className={`exit-button ${saving ? 'disabled' : ''}`} onClick={handleSaveAndExit} disabled={saving}>
                            <X size={20} style={{ marginRight: '8px' }} />
                            Exit
                        </button>
                    </div>
                </div>
                {showSuccess && (
                    <div className="success-message">
                        Scores saved successfully!
                    </div>
                )}

                <div className="editable-result_table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                {subjects.map(subject => (
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
                                const mo = calculateMO(student.id);
                                const percentage = calculatePercentage(student.id);
                                const rank = getRanks[student.id] || '-';

                                return (
                                    <tr key={student.id}>
                                        <td><span className='student-name'>{student.name}</span></td>
                                        {subjects.map(subject => {
                                            const test = getScore(student.id, subject.code, 'test');
                                            const exam = getScore(student.id, subject.code, 'exam');
                                            const total = calculateSubjectTotal(student.id, subject);

                                            return (
                                                <React.Fragment key={`${student.id}-${subject.code}`}>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={test}
                                                            onChange={(e) => handleScoreChange(student.id, subject.code, 'test', e.target.value)}
                                                            className="score-input"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={exam}
                                                            onChange={(e) => handleScoreChange(student.id, subject.code, 'exam', e.target.value)}
                                                            className="score-input"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="total-cell">{total}</td>
                                                </React.Fragment>
                                            );
                                        })}
                                        <td className="mo-cell">{mo}</td>
                                        <td className="percentage-cell">{percentage}</td>
                                        <td className="rank-cell">{rank}</td>
                                        <td className="comment-column">
                                            <input
                                                type="text"
                                                value={getComment(student.id)}
                                                onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                                className="comment-input"
                                                placeholder="Add comment..."
                                            />
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={1 + (subjects.length * 3) + 4} style={{ textAlign: 'center', padding: '20px' }}>
                                        No students found for the selected class
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
