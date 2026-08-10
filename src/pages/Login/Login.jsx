import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, X } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 900);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      <div className="login-card animate-scale-up">
        <button
          className="login-close-btn"
          onClick={() => navigate("/")}
          type="button"
        >
          <X size={22} />
        </button>
        {success ? (
          <div className="auth-success-screen animate-fade-in">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={64} className="success-icon" />
            </div>
            <h3>Welcome Back!</h3>
            <p>Logging you in securely...</p>
          </div>
        ) : (
          <>
            <div className="login-header">
               <h2>Billing SaaS</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            {error && <div className="login-error animate-slide-down">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-group">
                <label>Email Address</label>
                <div className="login-input-wrapper">
                  <Mail size={18} className="login-input-icon" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-group">
                <label>Password</label>
                <div className="login-input-wrapper">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <span
                  className="forgot"
                  onClick={() => navigate("/forgot-password")}
                  style={{ cursor: "pointer" }} >
                  Forgot password?
                </span>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <span className="spinner"></span> : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                  </>
                )}
              </button>
            </form>

           <div className="login-footer">

              <p>
                  Don't have an account?
                  <Link to="/register">
                      Create account
                  </Link>
              </p>


              <div className="divider">

                  <span>OR</span>

              </div>


              <Link 
                  to="/admin/login" 
                  className="admin-link"
              >

                  Admin Portal

              </Link>


            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;