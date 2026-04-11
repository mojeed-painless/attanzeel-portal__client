import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/dashboard.css';
import { getCurrentUser } from '../api/auth.js';

  import {
    FileCheck,
  } from 'lucide-react';


export default function ResultsPortal() {

  
  const [checkResult, setCheckResult] = useState(false);
  const user = getCurrentUser();

  const classes = ['PLAYGROUP', 'KINDERGARTEN 1', 'KINDERGARTEN 2', 'NURSERY 1', 'NURSERY 2', 'PRIMARY 1', 'PRIMARY 2', 'PRIMARY 3', 'PRIMARY 4', 'PRIMARY 5', 'JSS 1', 'JSS 2', 'JSS 3', 'SS1A', 'SS 2', 'SS 3']; // Hardcoded for now

  return (
    <>

            <button className="check-result" onClick={() => setCheckResult(cr => !cr)}>
              <FileCheck size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }}/>
              {user?.role === 'student' ? 'Check Student Result' : 'Input Student Result'}
            </button>

            {checkResult && user?.role === 'student' && <div className="form-group-inline">
              <select>
                <option value="">Select Year</option>
                <option>2024/2025</option>
                <option>2025/2026</option>
              </select>

              <select>
                <option value="">Select Term</option>
                <option>First Term</option>
                <option>Second Term</option>
                <option>Third Term</option>
              </select>
              
              <button>
                View Results
              </button>
            </div>}

            {checkResult && user?.role !== 'student' && <div className="form-group-inline">
              <select>
                <option value="">Select Year</option>
                <option>2025/2026</option>
              </select>

              <select>
                <option value="">Select Term</option>
                <option>Second Term</option>
              </select>

              <select>
                <option value="">Class</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
              
              <button>
                Next >>
              </button>
            </div>}
    </>
  );
}