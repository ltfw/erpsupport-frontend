
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL;

const ChangePassword = () => {
  const { logout } = useAuth()
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!oldPassword || !newPassword) {
      setError('Both fields are required.');
      return;
    }
    try {
      await axios.post(`${ENDPOINT_URL}auth/changepassword`, {
        oldPassword,
        newPassword,
      });
      setSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      toast.info('Redirecting to Login Page', { autoClose: 2500 });
      setTimeout(() => {
        logout();
        navigate('/login')
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to change password.'
      );
    }
  };

  return (
    <div className="change-password-container" style={{ maxWidth: 400, margin: '0 auto' }}>
      <ToastContainer />
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="oldPassword" className="form-label">Old Password</label>
          <input
            type="password"
            className="form-control"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button type="submit" className="btn btn-primary w-100">Change Password</button>
      </form>
    </div>
  );
};

export default ChangePassword;
