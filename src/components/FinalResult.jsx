import { useState, useEffect, useMemo } from 'react';
import '../assets/styles/final-results.css';
import cardHeader from '../assets/images/card-header.png';
import { IoCloudDownloadOutline } from 'react-icons/io5';
import { grades } from '../data';
import { getClassSubjects } from '../api/classes';

const getRemark = (score) => {
  if (score >= 75) return 'Excellent';
  if (score >= 66) return 'Very Good';
  if (score >= 55) return 'Good';
  if (score >= 50) return 'Average';
  return 'B.Average';
};

const getPrincipalComment = (percentage) => {
  const percent = parseFloat(percentage);
  if (percent >= 80) return "Excellent performance. Keep inspiring!";
  if (percent >= 70) return "Very good result. Keep up the consistency.";
  if (percent >= 60) return "Good performance. Can improve with more effort.";
  if (percent >= 50) return "Average performance. Needs focused attention in key areas.";
  return "Below average. Immediate and serious improvement required.";
};

const normalizeScores = (scores = {}) => {
  if (!scores) return {};
  return typeof scores.toObject === 'function' ? scores.toObject() : scores;
};

export default function FinalResult({
  studentResult = { scores: {}, comments: '' },
  classStudents = [],
  selectedYear,
  selectedTerm,
  studentName = '',
  className = '',
  removedSubjects = [],
}) {
  const [subjectNames, setSubjectNames] = useState({});
  const removedSubjectCodes = useMemo(() => Array.isArray(removedSubjects) ? removedSubjects.map((subject) => subject.code) : [], [removedSubjects]);

  useEffect(() => {
    if (className) {
      getClassSubjects(className)
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
  }, [className]);

  const studentScores = normalizeScores(studentResult.scores);
  const subjects = useMemo(
    () => Object.keys(studentScores || {}).filter((subject) => !removedSubjectCodes.includes(subject)),
    [studentScores, removedSubjectCodes]
  );

  const subjectRows = useMemo(() => {
    return subjects.map((subject) => {
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
    });
  }, [subjects, studentScores, classStudents]);

  const totalMarkObtainable = subjectRows.length * 100;
  const markObtained = subjectRows.reduce((sum, row) => sum + row.total, 0);
  const percentage = totalMarkObtainable ? ((markObtained / totalMarkObtainable) * 100).toFixed(2) : '0.00';

  const position = useMemo(() => {
    if (!classStudents.length) return 'N/A';

    const totals = classStudents.map((student) => {
      const scores = normalizeScores(student.scores || {});
      return subjects.reduce((acc, subject) => {
        const subjectScore = normalizeScores(scores[subject] || {});
        return acc + (Number(subjectScore.test) || 0) + (Number(subjectScore.exam) || 0);
      }, 0);
    });

    const sorted = [...totals].sort((a, b) => b - a);
    const studentTotal = subjectRows.reduce((acc, row) => acc + row.total, 0);
    const index = sorted.indexOf(studentTotal);
    if (index === -1) return 'N/A';
    const suffix = index === 0 ? 'ST' : index === 1 ? 'ND' : index === 2 ? 'RD' : 'TH';
    return `${index + 1}${suffix}`;
  }, [classStudents, subjectRows, subjects]);

  return (
    <>
      <div className="final-result__container">
        <header className="final-result__header">
          <img src={cardHeader} alt="School header" />
          <h4>{selectedTerm || 'RESULT'}</h4>
          <p>{selectedYear ? `${selectedYear} ACADEMIC SESSION` : 'Academic Session'}</p>
        </header>

        <section className="final-result__student-info">
          <div>
            <div className="name"><span>NAME:</span> {studentName || 'N/A'}</div>
            <div className="class"><span>CLASS:</span> {className || 'N/A'}</div>
          </div>

          <div>
            <div className="number"><span>TOTAL NO. CLASS:</span> {classStudents.length || 0}</div>
            <div className="position"><span>POSITION:</span> {position}</div>
          </div>
        </section>

        <section className="final-result__body">
          <table>
            <thead>
              <tr>
                <th>SUBJECTS</th>
                <th>CA (30%)</th>
                <th>EXAM (70%)</th>
                <th>TOTAL (100%)</th>
                <th>REMARK</th>
                <th>Class Lowest</th>
                <th>Class Highest</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.length ? (
                subjectRows.map((row) => (
                  <tr key={row.subject}>
                    <td>{subjectNames[row.subject] || row.subject}</td>
                    <td>{row.test}</td>
                    <td>{row.exam}</td>
                    <td>{row.total}</td>
                    <td>{row.remark}</td>
                    <td>{row.classLowest}</td>
                    <td>{row.classHighest}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>No subject scores available for this result.</td>
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
                <span>{getPrincipalComment(percentage)}</span>
              </div>
            </div>

            <div className="final-grading-system">
              <div className='final-grading-system__head'>GRADING SYSTEM</div>
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Point</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.score}</td>
                      <td>{grade.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className='final-result__motto'>KNOWLEDGE VIRTUES AND EXCELLENCE</p>
        </section>
      </div>

      <button className="final-download-btn">
        <span>Download Complete Results</span>
        <span><IoCloudDownloadOutline /></span>
      </button>
    </>
  )};