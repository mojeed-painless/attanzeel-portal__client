import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRightLong } from "react-icons/fa6";
import '../assets/styles/login.css';
import loginLogo from '../assets/images/atlogo.png';
import { login } from '../api/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { role } = await login(username, password);
      
      // Route based on role
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'staff') {
        navigate('/staff-dashboard');
      } else if (role === 'student') {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" id="login-form">

        <h3 className='login-title'>Login to your account</h3>

        {error && (
          <div className="error-message" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-group">
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        </form>
      </div>



      <div className="right-info">
        <div className="cover"></div>

        <div className="info-logo">
          <img src={loginLogo} alt="academy logo" />
        </div>

        <div className="info-text">
          <h2>Welcome to At-Tanzeel Students Personalized Portal</h2>
          <p>
            Enter student's admission number <small>[e.g ASI00209]</small> as Username and Surname (in lowercase) as Password
            <span className='showMore'> below</span> to access the portal. 
            <a href="#login-form" className='login-form showMore'>
              <span>Login here</span>
              <FaArrowRightLong />
            </a>
          </p>
        </div>

        {/* <div className="illustration-image">
          <img src={codeIllustration} alt="code illustration" />
        </div> */}
      </div>


    </div>
  );
};

export default Login;