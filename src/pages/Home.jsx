import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRightLong, FaEye, FaEyeSlash } from "react-icons/fa6";
import '../assets/styles/login.css';
import loginLogo from '../assets/images/atlogo.png';
import { login, register, verifyEmail, resendVerificationCode } from '../api/auth';
import { getAllClasses } from '../api/classes';
import { MoveRight, MoveLeft } from 'lucide-react';
import VerificationModal from '../components/VerificationModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regClasses, setRegClasses] = useState([]);
  
  // Verification Modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationMode, setVerificationMode] = useState('register'); // 'register' or 'login'
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getAllClasses();
        const classArray = Array.isArray(data) ? data : data?.classes || [];
        const uniqueClasses = Array.from(
          new Map(classArray.map((cls) => [cls.class, cls])).values()
        );
        setClasses(uniqueClasses);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await login(username, password);
      const { role } = response;
      
      // Route based on role
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'staff') {
        navigate('/staff-dashboard');
      } else if (role === 'student') {
        navigate('/dashboard');
      }
    } catch (err) {
      // Check if error is email verification required
      if (err.requiresVerification && err.email) {
        setVerificationEmail(err.email);
        setVerificationMode('login');
        setShowVerificationModal(true);
        setError('Please verify your email to complete login.');
      } else {
        setError(err.message || err || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (regClasses.length === 0) {
      setError('Please select at least one class.');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        firstName: regFirstName,
        lastName: regLastName,
        title: regTitle,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        class: regClasses.join(', '),
        role: 'staff'
      });

      // Show verification modal for staff
      if (response.requiresVerification) {
        setVerificationEmail(regEmail);
        setVerificationMode('register');
        setShowVerificationModal(true);
        setSuccessMessage('Registration successful! Check your email for the verification code.');
      } else {
        setSuccessMessage('Registration successful. Your account is pending admin approval.');
        // Reset form
        setRegFirstName('');
        setRegLastName('');
        setRegTitle('');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setRegShowPassword(false);
        setRegClasses([]);
        setIsRegistrationMode(false);
      }
    } catch (err) {
      setError(err.message || err || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = (selectedClass) => {
    if (!selectedClass || regClasses.includes(selectedClass)) return;
    setRegClasses((prev) => [...prev, selectedClass]);
  };

  const handleRemoveClass = (className) => {
    setRegClasses((prev) => prev.filter((cls) => cls !== className));
  };

  const handleVerifyEmail = async (email, code) => {
    try {
      const response = await verifyEmail(email, code);
      setSuccessMessage(response.message);
      
      // After verification, close modal and reset
      setTimeout(() => {
        setShowVerificationModal(false);
        setVerificationEmail('');
        setVerificationMode('register');
        
        // Clear registration form
        setRegFirstName('');
        setRegLastName('');
        setRegTitle('');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setRegShowPassword(false);
        setRegClasses([]);
        setIsRegistrationMode(false);
        
        setError('');
      }, 2000);
    } catch (err) {
      throw err;
    }
  };

  const handleResendCode = async (email) => {
    try {
      const response = await resendVerificationCode(email);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const handleCloseVerificationModal = () => {
    // Don't allow closing if in progress
    if (loading) return;
    
    setShowVerificationModal(false);
    setVerificationEmail('');
    setVerificationMode('register');
  };

  return (
    <div className="login-container">
      {showVerificationModal && (
        <VerificationModal
          email={verificationEmail}
          onVerify={handleVerifyEmail}
          onResend={handleResendCode}
          onClose={handleCloseVerificationModal}
          isLoading={loading}
        />
      )}

      <div className="login-card" id="login-form">

        <h3 className='login-title'>{isRegistrationMode ? 'Staff Registration' : 'Login to your account'}</h3>

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
        {successMessage && (
          <div className="success-message" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#e6ffed',
            color: '#1f7a3f',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {successMessage}
          </div>
        )}

        {isRegistrationMode ? (
          <form className="login-form" onSubmit={handleRegistrationSubmit}>
            <div className="login-form-group">
              <div>
                <label htmlFor="regFirstName">First Name:</label>
                <input
                  type="text"
                  id="regFirstName"
                  placeholder="Enter your first name"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="regLastName">Last Name:</label>
                <input
                  type="text"
                  id="regLastName"
                  placeholder="Enter your last name"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="regTitle">Title:</label>
                <select
                  id="regTitle"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select Title</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>

              <div>
                <label htmlFor="regUsername">Username:</label>
                <input
                  type="text"
                  id="regUsername"
                  placeholder="Enter your username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="regEmail">Email:</label>
                <input
                  type="email"
                  id="regEmail"
                  placeholder="Enter your email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="regPassword">Password:</label>
                <div className="password-input-wrapper">
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    id="regPassword"
                    placeholder="Enter your password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    disabled={loading}
                    aria-label={regShowPassword ? 'Hide password' : 'Show password'}
                  >
                    {regShowPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="classSelect">Classes:</label>
                <select
                  id="classSelect"
                  value=""
                  onChange={(e) => handleAddClass(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a class</option>
                  {classes
                    .filter((cls) => !regClasses.includes(cls.class))
                    .map((cls, idx) => (
                      <option
                        key={cls._id || `${cls.class}-${idx}`}
                        value={cls.class}
                      >
                        {cls.class}
                      </option>
                    ))}
                </select>

                {regClasses.length > 0 && (
                  <div className="selected-classes-list">
                    {regClasses.map((className) => (
                      <button
                        key={className}
                        type="button"
                        className="selected-class-chip"
                        onClick={() => handleRemoveClass(className)}
                      >
                        {className} <span aria-hidden="true">×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
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
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {!isRegistrationMode && (
          <button 
            type="button" 
            className="auth-submit-btn reg-btn" 
            onClick={() => {
              setIsRegistrationMode(true);
              setError('');
              setSuccessMessage('');
            }}
          >
            Staff Registration
            <MoveRight/>
          </button>
        )}

        {isRegistrationMode && (
          <button 
            type="button" 
            className="auth-submit-btn reg-btn" 
            style={{ marginTop: '30px', backgroundColor: 'Transparent' }}
            onClick={() => {
              setIsRegistrationMode(false);
              setError('');
              setSuccessMessage('');
            }}
          >
            <MoveLeft/>
            Back to Login
          </button>
        )}
      </div>



      <div className="right-info">
        <div className="cover"></div>

        <div className="info-logo">
          <img src={loginLogo} alt="academy logo" />
        </div>

        <div className="info-text">
          <h2>Welcome to At-Tanzeel Students Personalized Portal</h2>
          <p>
            Enter student's Username and Password  
            <span className='showMore'> below</span> to access the portal. Username is the admission number <small>[e.g ASI00209]</small>
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