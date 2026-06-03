import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useSignupMutation } from './authApi';
import { setCredentials } from './authSlice';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const dispatch = useDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      if (isLogin) {
        const data = await login({ email: formData.email, password: formData.password }).unwrap();
        dispatch(setCredentials({ user: { name: data.name, email: data.email }, token: data.token }));
      } else {
        const data = await signup({ name: formData.name, email: formData.email, password: formData.password }).unwrap();
        dispatch(setCredentials({ user: { name: data.name, email: data.email }, token: data.token }));
      }
    } catch (err) {
      alert(err?.data?.message || 'Authentication failed. Please verify your entries.');
    }
  };

  const colors = {
    tealGradient: 'linear-gradient(160deg, #4A6E74 0%, #2B4448 55%, #1E3336 100%)',
    btnGradient: 'linear-gradient(90deg, #384C4F 0%, #648B91 100%)',
    bgInput: '#F2F5F5',
    textPrimary: '#364C4F',
    textMuted: '#A7A7A9',
    white: '#FFFFFF',
  };

  /* ── Teal panel: polygon/diamond geometric shapes matching Figma ── */
  const TealBg = () => (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 300 600"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* top-right large triangle */}
      <polygon points="180,0 300,0 300,160" fill="rgba(138,189,196,0.14)" />
      {/* top-right inner triangle */}
      <polygon points="230,0 300,0 300,80" fill="rgba(138,189,196,0.09)" />
      {/* top-left small triangle */}
      <polygon points="0,0 70,0 0,80" fill="rgba(138,189,196,0.08)" />
      {/* upper-center diamond */}
      <rect x="100" y="100" width="50" height="50"
            transform="rotate(45,125,125)" fill="rgba(138,189,196,0.13)" />
      {/* left-mid diamond */}
      <rect x="-10" y="230" width="38" height="38"
            transform="rotate(45,9,249)" fill="rgba(138,189,196,0.10)" />
      {/* right-mid small diamond */}
      <rect x="240" y="290" width="30" height="30"
            transform="rotate(45,255,305)" fill="rgba(138,189,196,0.08)" />
      {/* center-left large circle */}
      <ellipse cx="30" cy="420" rx="80" ry="80" fill="rgba(138,189,196,0.07)" />
      {/* bottom-right triangle */}
      <polygon points="200,520 300,480 300,600 180,600" fill="rgba(138,189,196,0.11)" />
      {/* bottom-center small triangle */}
      <polygon points="80,560 150,510 160,600 60,600" fill="rgba(138,189,196,0.07)" />
      {/* scattered mid-right circle */}
      <ellipse cx="270" cy="200" rx="55" ry="55" fill="rgba(138,189,196,0.06)" />
    </svg>
  );

  /* ── Inline SVG icons (matching Figma strokes exactly) ── */
  const IconUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );

  const IconMail = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3,5 12,13 21,5" />
    </svg>
  );

  const IconLock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke={colors.textMuted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" fill={colors.textMuted} />
    </svg>
  );

  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 44px',
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

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Montserrat', sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── TEAL PANEL (left on login, right on signup) ── */}
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
        order: isLogin ? 1 : 2,
        overflow: 'hidden',
      }}>
        <TealBg />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '300px' }}>
          <h2 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '2.2rem',
            marginBottom: '12px',
            fontWeight: '500',
            letterSpacing: '1px',
          }}>
            {isLogin ? 'New Here?' : 'Welcome Back!'}
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.75)',
            marginBottom: '30px',
            fontWeight: '300',
            lineHeight: '1.5',
          }}>
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
          </p>

          <button
            onClick={() => setIsLogin(!isLogin)}
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
              fontFamily: "'Montserrat', sans-serif",
              transition: 'background 0.25s, color 0.25s',
            }}
            onMouseEnter={(e) => { e.target.style.background = colors.white; e.target.style.color = '#2D3E41'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = colors.white; }}
          >
            {isLogin ? 'SIGN UP' : 'SIGN IN'}
          </button>
        </div>
      </div>

      {/* ── FORM PANEL ── */}
      <div style={{
        flex: '0 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
        background: colors.white,
        order: isLogin ? 2 : 1,
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* MoneyWise brand title — large, centered */}
          <h1 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '3.2rem',
            color: colors.textPrimary,
            fontWeight: '600',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            MoneyWise
          </h1>

          <h2 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '2.2rem',
            color: colors.textPrimary,
            marginBottom: '32px',
            fontWeight: '500',
            letterSpacing: '1px',
            textAlign: 'center',
          }}>
            {isLogin ? 'Sign in' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Name field (signup only) */}
            {!isLogin && (
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

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <span style={iconWrapStyle}><IconMail /></span>
              <input
                type="email"
                placeholder={isLogin ? 'Email' : 'Enter Email'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <span style={iconWrapStyle}><IconLock /></span>
              <input
                type="password"
                placeholder={isLogin ? 'Password' : 'Enter Password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            {/* Confirm password (signup only) */}
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <span style={iconWrapStyle}><IconLock /></span>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
            )}

            {/* Forgot password — left aligned */}
            {isLogin && (
              <span style={{
                fontSize: '0.82rem',
                color: colors.textMuted,
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '2px',
              }}>
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
              {isLogin ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default LoginSignup;