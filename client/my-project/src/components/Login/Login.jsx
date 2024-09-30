import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // For the current password in change password form
    const [newPassword, setNewPassword] = useState(''); // For the new password in change password form
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false); // State to toggle between login and change password
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('https://admin.yeahtrips.in/userlogin', { email, password });
            const { token, role } = response.data;

            localStorage.setItem('accessToken', token);
            localStorage.setItem('role', role);
            setMessage('Login successful!');

            if (role === 'Read-Only') {
                navigate('/dashboardusersread');
            } else if (role === 'Super User') {
                navigate('/Dashboard');
            } else if (role === 'Trip Supervisor') {
                navigate('/supervisorlogin');
            } else if (role === 'User') {
                navigate('/userdashboard');
            }

        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Error during login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');

            const response = await axios.post(
                'https://admin.yeahtrips.in/changepassword',
                { email, currentPassword, newPassword }, // Sending current and new passwords
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send the token as headers
                    },
                }
            );

            setMessage(response.data.message);
            setIsChangePassword(false); // Go back to login after password change
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Error changing password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">{isChangePassword ? 'Change Password' : 'Login'}</h2>

                {isChangePassword ? (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="form-group">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>

                        {/* Link to Forgot Password */}
                        <p className="mt-4 text-center">
                            <Link to="/forgot-password" className="text-blue-500 hover:underline">
                                Forgot your password?
                            </Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                )}

                {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}

                <div className="mt-4 text-center">
                    {isChangePassword ? (
                        <button
                            onClick={() => setIsChangePassword(false)}
                            className="text-blue-500 hover:underline"
                        >
                            Back to Login
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsChangePassword(true)}
                            className="text-blue-500 hover:underline"
                        >
                            Change Password?
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;
