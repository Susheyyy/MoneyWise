import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useSignupMutation } from './authApi';
import { setCredentials } from './authSlice';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const data = await login({ email: formData.email, password: formData.password }).unwrap();
        dispatch(setCredentials({ user: { name: data.name, email: data.email }, token: data.token }));
      } else {
        const data = await signup(formData).unwrap();
        dispatch(setCredentials({ user: { name: data.name, email: data.email }, token: data.token }));
      }
    } catch (err) {
      alert(err?.data?.message || 'Authentication lifecycle exception caught');
    }
  };

  return (
    <div className="left-section" style={{ maxWidth: '400px', margin: '60px auto' }}>
      <h3>{isLogin ? 'Login to BudgetBoss Pro' : 'Create Student Account'}</h3>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
        )}
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
        </div>
        <button type="submit" className="btn-submit" disabled={isLoginLoading || isSignupLoading}>
          {isLogin ? 'Sign In' : 'Register Now'}
        </button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "New to the platform? Sign up here" : "Already have an profile? Login"}
      </p>
    </div>
  );
};

export default LoginSignup;