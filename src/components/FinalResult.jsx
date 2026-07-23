import { useState, useEffect, useMemo } from 'react';
import '../assets/styles/final-results.css';
import cardHeader from '../assets/images/card-header.png';
import { grades } from '../data';
import { getClassSubjects } from '../api/classes';
import {Download} from 'lucide-react';

const getPrincipalComment = (percentage, isThirdTerm = false) => {
  const percent = parseFloat(percentage);

  if (isThirdTerm) {
    if (percent >= 75) return "Excellent performance. Promoted to the next class";
    if (percent >= 65) return "Very good result. Promoted to the next class";
    if (percent >= 55) return "Good performance. Promoted to the next class";
    if (percent >= 50) return "Average performance. Promoted to the next class";
    return "Below average. Advised to repeat the class.";
  }

  if (percent >= 75) return "Excellent performance. Keep inspiring!";
  if (percent >= 65) return "Very good result. Keep up the consistency.";
  if (percent >= 55) return "Good performance. Can improve with more effort.";
  if (percent >= 50) return "Average performance. Needs focused attention in key areas.";
  return "Below average. Immediate and serious improvement required.";
};

const normalizeScores = (scores = {}) => {
  if (!scores) return {};
  return typeof scores.toObject === 'function' ? scores.toObject() : scores;
};

const getScoreFromTermValue = (value) => {
  if (!value && value !== 0) return 0;
  if (typeof value === 'object') {
    const test = Number(value.test) || 0;
    const exam = Number(value.exam) || 0;
    if (test || exam) return test + exam;
    return Number(value.score || value.total || 0) || 0;
  }
  return Number(value) || 0;
};

const getScoreBySubject = (scores, subjectCode) => {
  const normalized = normalizeScores(scores || {});
  return getScoreFromTermValue(normalized[subjectCode]);
};

const getAverageFromScores = (values = []) => {
  const validScores = values.filter((value) => Number(value) > 0);
  if (validScores.length === 0) return 0;
  return Math.ceil(validScores.reduce((sum, value) => sum + Number(value), 0) / validScores.length);
};

export default function FinalResult({
  studentResult = { scores: {}, comments: '' },
  classStudents = [],
  selectedYear,
  selectedTerm,
  studentName = '',
  className = '',
  removedSubjects = [],
  department = '',
  firstTermScores = {},
  secondTermScores = {},
}) {
  const isThirdTerm = selectedTerm === 'Third Term';
  const isSeniorSecondary = className && className.toUpperCase().startsWith('SS');

  const resolveStudentId = (studentId) => {
    if (studentId == null) return null;
    return typeof studentId === 'object' ? (studentId._id || studentId.toString()) : String(studentId);
  };

  const currentStudentId = resolveStudentId(studentResult?.studentId || studentResult?.id || studentResult?._id);

  const getRemark = (score) => {
    if (isSeniorSecondary) {
      if (score >= 80) return 'A1';
      if (score >= 70) return 'B2';
      if (score >= 65) return 'B3';
      if (score >= 60) return 'C4';
      if (score >= 55) return 'C5';
      if (score >= 50) return 'C6';
      if (score >= 45) return 'D7';
      if (score >= 40) return 'E8';
      return 'F9';
    } else {
      if (score >= 75) return 'Excellent';
      if (score >= 66) return 'Very Good';
      if (score >= 55) return 'Good';
      if (score >= 50) return 'Average';
      return 'B.Average';
    }
  };
  const [subjectNames, setSubjectNames] = useState({});
  const removedSubjectCodes = useMemo(() => Array.isArray(removedSubjects) ? removedSubjects.map((subject) => subject.code) : [], [removedSubjects]);

  useEffect(() => {
    if (className) {
      getClassSubjects(className, department || undefined)
        .then((data) => {
          const namesMap = {};
          if (data.subjects && Array.isArray(data.subjects)) {
            data.subjects.forEach((subject) => {
              namesMap[subject.code] = subject.name;
            });
          }
          setSubjectNames(namesMap);
        })
        .catch((error) => {
          console.error('Error fetching class subjects:', error);
        });
    }
  }, [className, department]);

  const studentScores = normalizeScores(studentResult.scores);
  const currentFirstTermScores = normalizeScores(firstTermScores[currentStudentId] || {});
  const currentSecondTermScores = normalizeScores(secondTermScores[currentStudentId] || {});

  const subjects = useMemo(() => {
    if (!isThirdTerm) {
      return Object.keys(studentScores || {}).filter((subject) => !removedSubjectCodes.includes(subject));
    }

    const allKeys = new Set([
      ...Object.keys(studentScores || {}),
      ...Object.keys(currentFirstTermScores || {}),
      ...Object.keys(currentSecondTermScores || {}),
    ]);

    return Array.from(allKeys).filter((subject) => !removedSubjectCodes.includes(subject));
  }, [studentScores, currentFirstTermScores, currentSecondTermScores, removedSubjectCodes, isThirdTerm]);

  const subjectRows = useMemo(() => {
    return subjects.map((subject) => {
      if (!isThirdTerm) {
        const studentScore = normalizeScores(studentScores[subject] || {});
        const test = Number(studentScore.test) || 0;
        const exam = Number(studentScore.exam) || 0;
        const total = test + exam;

        const totalsForSubject = classStudents.map((student) => {
          const scores = normalizeScores(student.scores || {});
          const subjectScore = normalizeScores(scores[subject] || {});
          return (Number(subjectScore.test) || 0) + (Number(subjectScore.exam) || 0);
        });

        const classLowest = totalsForSubject.length ? Math.min(...totalsForSubject) : 0;
        const classHighest = totalsForSubject.length ? Math.max(...totalsForSubject) : 0;

        return {
          subject,
          test,
          exam,
          total,
          remark: getRemark(total),
          classLowest,
          classHighest,
        };
      }

      const firstScore = getScoreBySubject(firstTermScores[currentStudentId], subject);
      const secondScore = getScoreBySubject(secondTermScores[currentStudentId], subject);
      const thirdScore = getScoreBySubject(studentScores, subject);
      const average = getAverageFromScores([firstScore, secondScore, thirdScore]);

      const totalsForSubject = classStudents.map((student) => {
        const studentId = resolveStudentId(student.studentId || student.id || student._id);
        const firstClass = getScoreBySubject(firstTermScores[studentId], subject);
        const secondClass = getScoreBySubject(secondTermScores[studentId], subject);
        const thirdClass = getScoreBySubject(student.scores, subject);
        return getAverageFromScores([firstClass, secondClass, thirdClass]);
      });

      const classLowest = totalsForSubject.length ? Math.min(...totalsForSubject) : 0;
      const classHighest = totalsForSubject.length ? Math.max(...totalsForSubject) : 0;

      return {
        subject,
        firstScore,
        secondScore,
        thirdScore,
        average,
        remark: getRemark(average),
        classLowest,
        classHighest,
      };
    });
  }, [subjects, studentScores, classStudents, firstTermScores, secondTermScores, isThirdTerm, currentStudentId]);

  const totalMarkObtainable = subjectRows.length * 100;
  const markObtained = subjectRows.reduce((sum, row) => sum + (isThirdTerm ? row.average : row.total), 0);
  const percentage = totalMarkObtainable ? ((markObtained / totalMarkObtainable) * 100).toFixed(2) : '0.00';

  const position = useMemo(() => {
    if (!classStudents.length) return 'N/A';

    const totals = classStudents.map((student) => {
      if (!isThirdTerm) {
        const scores = normalizeScores(student.scores || {});
        return subjects.reduce((acc, subject) => {
          const subjectScore = normalizeScores(scores[subject] || {});
          return acc + (Number(subjectScore.test) || 0) + (Number(subjectScore.exam) || 0);
        }, 0);
      }

      const studentId = resolveStudentId(student.studentId || student.id || student._id);
      return subjects.reduce((acc, subject) => {
        const firstClass = getScoreBySubject(firstTermScores[studentId], subject);
        const secondClass = getScoreBySubject(secondTermScores[studentId], subject);
        const thirdClass = getScoreBySubject(student.scores, subject);
        const average = getAverageFromScores([firstClass, secondClass, thirdClass]);
        return acc + average;
      }, 0);
    });

    const sorted = [...totals].sort((a, b) => b - a);
    const studentTotal = subjectRows.reduce((acc, row) => acc + (isThirdTerm ? row.average : row.total), 0);
    const index = sorted.indexOf(studentTotal);
    if (index === -1) return 'N/A';
    const suffix = index === 0 ? 'ST' : index === 1 ? 'ND' : index === 2 ? 'RD' : 'TH';
    return `${index + 1}${suffix}`;
  }, [classStudents, subjectRows, subjects, isThirdTerm, firstTermScores, secondTermScores]);

  return (
    <>
      <div className="final-result__container">
        <header className="final-result__header">
          <img src={cardHeader} alt="School header" />
          <h4>{selectedTerm ? `${selectedTerm} RESULT` : 'RESULT'}</h4>
          <p>{selectedYear ? `${selectedYear} ACADEMIC SESSION` : 'Academic Session'}</p>
        </header>

        <section className="final-result__student-info">
          <div>
            <div className="name"><span>NAME:</span> {studentName || 'N/A'}</div>
            <div className="class"><span>CLASS:</span> {className || 'N/A'}</div>
          </div>

          <div>
            <div className="number"><span>TOTAL NO. CLASS:</span> {classStudents.length || 0}</div>
            {isThirdTerm ? (
              <div className="position"><span>POSITION:</span> {position}</div>
            ) : (
              <div className="position"><span>POSITION:</span> </div>
            )}
          </div>
        </section>

        <section className="final-result__body">
          <table>
            <thead>
              <tr>
                <th>SUBJECTS</th>
                {isThirdTerm ? (
                  <>
                    <th>1st (100%)</th>
                    <th>2nd (100%)</th>
                    <th>3rd (100%)</th>
                    <th>AVRG (100%)</th>
                  </>
                ) : (
                  <>
                    <th>CA (30%)</th>
                    <th>EXAM (70%)</th>
                    <th>TOTAL (100%)</th>
                  </>
                )}
                <th>REMARK</th>
                {!isSeniorSecondary && <th>Class Lowest</th>}
                {!isSeniorSecondary && <th>Class Highest</th>}
              </tr>
            </thead>
            <tbody>
              {subjectRows.length ? (
                subjectRows.map((row) => (
                  <tr key={row.subject}>
                    <td>{subjectNames[row.subject] || row.subject}</td>
                    {isThirdTerm ? (
                      <>
                        <td>{row.firstScore}</td>
                        <td>{row.secondScore}</td>
                        <td>{row.thirdScore}</td>
                        <td className="final-result__average">{row.average}</td>
                      </>
                    ) : (
                      <>
                        <td>{row.test}</td>
                        <td>{row.exam}</td>
                        <td>{row.total}</td>
                      </>
                    )}
                    <td className="final-result__remark">{row.remark}</td>
                    {!isSeniorSecondary && <td>{row.classLowest}</td>}
                    {!isSeniorSecondary && <td>{row.classHighest}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isThirdTerm ? (isSeniorSecondary ? 6 : 8) : (isSeniorSecondary ? 5 : 7)}>
                    No subject scores available for this result.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="final-result__conclusion">
          <div className="final-result__percentage">
            <div><span>Total Mark Obtainable: </span> {totalMarkObtainable}</div>
            <div><span>Mark Obtained: </span> {markObtained}</div>
            <div><span>Percentage: </span> {percentage}%</div>
          </div>

          <div className="final-result__base">
            <div className='final-result__comments'>
              <div>
                <span>Class Teacher's Comment:</span>
                <span>{studentResult.comments || 'No comment provided.'}</span>
              </div>

              <div>
                <span>Principal's Comment:</span>
                <span>{getPrincipalComment(percentage, isThirdTerm)}</span>
              </div>
            </div>

            <div className="final-grading-system">
              <div className='final-grading-system__head'>GRADING SYSTEM</div>
              <ul>
                  {grades.map((grade) => (
                    <li><b>{grade.score}:</b> {grade.remark}</li>
                  ))}
              </ul>
            </div>
          </div>

          <p className='final-result__motto'>KNOWLEDGE VIRTUES AND EXCELLENCE</p>
        </section>
      </div>

      <button className="final-result__btn final-result__btn-success">
        <span><Download size={16}/></span>
        Download
      </button>
    </>
  )};