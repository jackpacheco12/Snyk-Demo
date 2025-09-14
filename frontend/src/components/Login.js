import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Login to BookShelf</h2>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginBottom: '16px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <p>Don't have an account?</p>
        <button
          onClick={onToggleMode}
          style={{
            backgroundColor: 'transparent',
            color: '#007bff',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '16px'
          }}
        >
          Sign up here
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Demo Account:</strong>
        <br />
        <small>You can register a new account or use the demo functionality</small>
      </div>
    </div>
  );
};

export default Login;