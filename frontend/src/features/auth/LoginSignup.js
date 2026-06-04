import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  useLoginMutation, 
  useSignupMutation, 
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation 
} from './authApi';
import { setCredentials } from './authSlice';

const LoginSignup = ({ initialIsLogin = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [viewState, setViewState] = useState(initialIsLogin ? 'login' : 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [verifyEmail, { isLoading: isVerifyLoading }] = useVerifyEmailMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const triggerToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (viewState === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        triggerToast('Passwords do not match! Please re-verify.');
        return;
      }
      if (!passwordRegex.test(formData.password)) {
        triggerToast('Password requires 8+ characters, including letters, numbers, and symbols.');
        return;
      }
    }

    try {
      if (viewState === 'login') {
        const data = await login({ email: formData.email, password: formData.password }).unwrap();
        dispatch(setCredentials({ user: { name: data.name, email: data.email }, token: data.token }));
        triggerToast('Authentication verified! Redirecting...', 'success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await signup({ name: formData.name, email: formData.email, password: formData.password }).unwrap();
        setRegisteredEmail(formData.email);
        triggerToast('Account profile recorded! Verification code dispatched.', 'success');
        setViewState('verify_email');
      }
    } catch (err) {
      triggerToast(err?.data?.message || 'Authentication processing fault. Try again.');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (verificationCode.trim().length !== 6) {
      triggerToast('Invalid code layout. Security token must evaluate to 6 digits.');
      return;
    }

    try {
      const data = await verifyEmail({ email: registeredEmail, code: verificationCode }).unwrap();
      triggerToast('Security token authorized successfully!', 'success');
      
      dispatch(setCredentials({ user: { name: data.name, email: data.email }, token: data.token }));
      
      setTimeout(() => {
        setViewState('login');
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      triggerToast(err?.data?.message || 'Verification rejected. Please re-check your inbox pin.');
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email: formData.email }).unwrap();
      setRegisteredEmail(formData.email);
      triggerToast('Recovery code token dispatched to your inbox!', 'success');
      setViewState('forgot_reset');
    } catch (err) {
      triggerToast(err?.data?.message || 'Failed to dispatch password recovery code.');
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      triggerToast('Passwords do not match! Please re-verify.');
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      triggerToast('Password requires 8+ characters, including letters, numbers, and symbols.');
      return;
    }

    if (recoveryCode.trim().length !== 6) {
      triggerToast('Security reset code token must evaluate to 6 digits.');
      return;
    }

    try {
      await resetPassword({ 
        email: registeredEmail, 
        code: recoveryCode, 
        newPassword: formData.password 
      }).unwrap();
      
      triggerToast('Password rewritten successfully! Please sign in.', 'success');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setRecoveryCode('');
      setViewState('login');
    } catch (err) {
      triggerToast(err?.data?.message || 'Failed to rewrite security password records.');
    }
  };

  const colors = {
    tealGradient: 'linear-gradient(160deg, #4A6E74 0%, #2B4448 55%, #1E3336 100%)',
    btnGradient: 'linear-gradient(90deg, #384C4F 0%, #648B91 100%)',
    bgInput: '#F2F5F5',
    textPrimary: '#364C4F',
    textMuted: '#A7A7A9',
    white: '#FFFFFF',
    green: '#0F6E56',
    greenBg: '#E1F5EE',
    red: '#A32D2D',
    redBg: '#FCEBEB'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 44px 14px 44px', 
    background: colors.bgInput,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: colors.textPrimary,
    outline: 'none',
    fontFamily: "'Montserrat', sans-serif",
  };

  const iconWrapStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  };

  const eyeToggleStyle = {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    outline: 'none'
  };

  const TealBg = () => (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 300 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <polygon points="180,0 300,0 300,160" fill="rgba(138,189,196,0.14)" />
      <polygon points="230,0 300,0 300,80" fill="rgba(138,189,196,0.09)" />
      <polygon points="0,0 70,0 0,80" fill="rgba(138,189,196,0.08)" />
      <rect x="100" y="100" width="50" height="50" transform="rotate(45,125,125)" fill="rgba(138,189,196,0.13)" />
      <rect x="-10" y="230" width="38" height="38" transform="rotate(45,9,249)" fill="rgba(138,189,196,0.10)" />
      <rect x="240" y="290" width="30" height="30" transform="rotate(45,255,305)" fill="rgba(138,189,196,0.08)" />
      <ellipse cx="30" cy="420" rx="80" ry="80" fill="rgba(138,189,196,0.07)" />
      <polygon points="200,520 300,480 300,600 180,600" fill="rgba(138,189,196,0.11)" />
      <polygon points="80,560 150,510 160,600 60,600" fill="rgba(138,189,196,0.07)" />
      <ellipse cx="270" cy="200" rx="55" ry="55" fill="rgba(138,189,196,0.06)" />
    </svg>
  );

  const IconUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );

  const IconMail = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3,5 12,13 21,5" />
    </svg>
  );

  const IconLock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" fill={colors.textMuted} />
    </svg>
  );

  const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const IconEye = ({ visible }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  const isLeftPanelTeal = (viewState === 'login' || viewState === 'forgot_request');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", overflow: 'hidden', position: 'relative' }}>
      
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: toast.type === 'success' ? colors.greenBg : colors.redBg,
          borderLeft: `4px solid ${toast.type === 'success' ? colors.green : colors.red}`,
          padding: '16px 24px',
          borderRadius: '6px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: toast.type === 'success' ? colors.green : colors.red,
          fontWeight: 600,
          fontSize: '0.85rem'
        }}>
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{
        flex: '0 0 30%',
        background: colors.tealGradient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 32px',
        color: colors.white,
        textAlign: 'center',
        position: 'relative',
        order: isLeftPanelTeal ? 1 : 2,
        overflow: 'hidden',
        transition: 'all 0.4s ease'
      }}>
        <TealBg />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '300px' }}>
          <h2 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '2.2rem',
            marginBottom: '12px',
            fontWeight: '500',
            letterSpacing: '1px'
          }}>
            {isLeftPanelTeal ? 'New Here?' : 'Welcome Back!'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginBottom: '30px', fontWeight: '300', lineHeight: '1.5' }}>
            {isLeftPanelTeal ? "Don't have an account yet?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => {
              setViewState(isLeftPanelTeal ? 'signup' : 'login');
            }}
            style={{
              background: 'transparent',
              color: colors.white,
              border: `1.5px solid ${colors.white}`,
              padding: '11px 44px',
              borderRadius: '25px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            {isLeftPanelTeal ? 'SIGN UP' : 'SIGN IN'}
          </button>
        </div>
      </div>

      <div style={{
        flex: '0 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        background: colors.white,
        order: isLeftPanelTeal ? 2 : 1,
        position: 'relative'
      }}>
        
        <button 
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '32px',
            right: isLeftPanelTeal ? '40px' : 'auto',
            left: isLeftPanelTeal ? 'auto' : '40px',
            background: 'none',
            border: 'none',
            color: colors.textMuted,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Product Info
        </button>

        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '3.2rem', color: colors.textPrimary, fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '40px' }}>
            MoneyWise
          </h1>

          {viewState === 'verify_email' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: colors.textPrimary, marginBottom: '12px', fontWeight: '500', textAlign: 'center' }}>
                Verify Your Email
              </h2>
              <p style={{ fontSize: '0.88rem', color: colors.textMuted, textAlign: 'center', marginBottom: '24px', lineHeight: 1.5 }}>
                We dispatched a secure authentication token blueprint to <strong style={{ color: colors.textPrimary }}>{registeredEmail}</strong>.
              </p>
              
              <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconShield /></span>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-Digit Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={isVerifyLoading}
                    style={{ ...inputStyle, letterSpacing: '4px', textAlign: 'center', paddingLeft: '14px', paddingRight: '14px' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isVerifyLoading}
                  style={{ background: colors.btnGradient, color: colors.white, border: 'none', padding: '15px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isVerifyLoading ? 'VERIFYING...' : 'Verify Security Token'}
                </button>
              </form>
            </div>
          )}

          {viewState === 'forgot_request' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: colors.textPrimary, marginBottom: '12px', fontWeight: '500', textAlign: 'center' }}>
                Recover Password
              </h2>
              <p style={{ fontSize: '0.88rem', color: colors.textMuted, textAlign: 'center', marginBottom: '24px', lineHeight: 1.5 }}>
                Input your registered account coordinates to intercept token dispatches.
              </p>
              
              <form onSubmit={handleForgotRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconMail /></span>
                  <input
                    type="email"
                    placeholder="Enter Registered Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isForgotLoading}
                  style={{ background: colors.btnGradient, color: colors.white, border: 'none', padding: '15px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isForgotLoading ? 'SENDING OTP...' : 'DISPATCH RECOVERY CODE'}
                </button>
                <span 
                  onClick={() => setViewState('login')} 
                  style={{ fontSize: '0.82rem', color: colors.textMuted, cursor: 'pointer', textAlign: 'center', display: 'block', marginTop: '14px', fontWeight: '600' }}
                >
                  ← Return to Sign In
                </span>
              </form>
            </div>
          )}

          {viewState === 'forgot_reset' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: colors.textPrimary, marginBottom: '12px', fontWeight: '500', textAlign: 'center' }}>
                Reset Credentials
              </h2>
              <p style={{ fontSize: '0.88rem', color: colors.textMuted, textAlign: 'center', marginBottom: '24px' }}>
                Enter the code sent to your email along with your new password choice.
              </p>
              
              <form onSubmit={handleForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconShield /></span>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-Digit Reset Pin"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ ...inputStyle, letterSpacing: '4px', textAlign: 'center', paddingLeft: '14px', paddingRight: '14px' }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter New Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeToggleStyle}>
                    <IconEye visible={showPassword} />
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconLock /></span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type New Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeToggleStyle}>
                    <IconEye visible={showConfirmPassword} />
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isResetLoading}
                  style={{ background: colors.btnGradient, color: colors.white, border: 'none', padding: '15px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}
                >
                  {isResetLoading ? 'REWRITING...' : 'CONFIRM PASSWORD OVERWRITE'}
                </button>
              </form>
            </div>
          )}

          {(viewState === 'login' || viewState === 'signup') && (
            <div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.2rem', color: colors.textPrimary, marginBottom: '32px', fontWeight: '500', letterSpacing: '1px', textAlign: 'center' }}>
                {viewState === 'login' ? 'Sign in' : 'Create Account'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {viewState === 'signup' && (
                  <div style={{ position: 'relative' }}>
                    <span style={iconWrapStyle}><IconUser /></span>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={inputStyle}
                    />
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconMail /></span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={iconWrapStyle}><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeToggleStyle}>
                    <IconEye visible={showPassword} />
                  </button>
                </div>

                {viewState === 'signup' && (
                  <div style={{ position: 'relative' }}>
                    <span style={iconWrapStyle}><IconLock /></span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      style={inputStyle}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeToggleStyle}>
                      <IconEye visible={showConfirmPassword} />
                    </button>
                  </div>
                )}

                {viewState === 'login' && (
                  <span 
                    onClick={() => {
                      setViewState('forgot_request');
                      setFormData({ ...formData, password: '', confirmPassword: '' });
                    }} 
                    style={{ fontSize: '0.82rem', color: colors.textMuted, cursor: 'pointer', textAlign: 'right', marginTop: '2px' }}
                  >
                    Forgot your password?
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading || isSignupLoading}
                  style={{
                    background: colors.btnGradient,
                    color: colors.white,
                    border: 'none',
                    padding: '15px',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '12px',
                    boxShadow: '0 6px 18px rgba(54,76,79,0.28)',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  {viewState === 'login' ? 'SIGN IN' : 'SIGN UP'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LoginSignup;