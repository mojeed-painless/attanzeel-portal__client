import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../assets/styles/verification-modal.css';

const VerificationModal = ({ email, onVerify, onResend, onClose, isLoading }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCountdown, canResend]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Keep only last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(email, verificationCode);
      setSuccessMessage('Email verified successfully!');
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      if (err.codeExpired) {
        setResendCountdown(60);
        setCanResend(false);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMessage('');
    setIsResending(true);
    
    try {
      await onResend(email);
      setSuccessMessage('New verification code sent to your email');
      setCode(['', '', '', '', '', '']);
      setResendCountdown(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal">
        <button
          type="button"
          className="verification-modal-close"
          onClick={onClose}
          disabled={isLoading || isVerifying || isResending}
          aria-label="Close verification modal"
        >
          <FaTimes />
        </button>

        <div className="verification-modal-content">
          <h2 className="verification-modal-title">Verify Your Email</h2>
          <p className="verification-modal-subtitle">
            We've sent a 6-digit verification code to:
          </p>
          <p className="verification-modal-email">{email}</p>

          {error && (
            <div className="verification-error-message">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="verification-success-message">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="verification-code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="verification-code-input"
                  disabled={isLoading || isVerifying || isResending}
                  autoComplete="off"
                  inputMode="numeric"
                />
              ))}
            </div>

            <p className="verification-code-hint">
              The code is valid for 1 hour
            </p>

            <button
              type="submit"
              className="verification-submit-btn"
              disabled={isLoading || isVerifying || isResending || code.some(c => !c)}
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="verification-footer">
            <p>Didn't receive the code?</p>
            {canResend ? (
              <button
                type="button"
                className="verification-resend-btn"
                onClick={handleResend}
                disabled={isLoading || isVerifying || isResending}
              >
                {isResending ? 'Resending...' : 'Resend Code'}
              </button>
            ) : (
              <span className="verification-resend-countdown">
                Resend in {resendCountdown}s
              </span>
            )}
          </div>

          <div className="verification-info">
            <p>
              <strong>Note:</strong> If you close this window without verifying your email,
              you'll need to verify it the next time you try to log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
