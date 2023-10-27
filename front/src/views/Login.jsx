import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuestLayout from '../layouts/GuestLayout';
import { AuthContext } from '../contexts/auth';
import Cookies from 'js-cookie';
import { ProfileContext } from '../contexts/profile';
import createAxiosInstance from '../axios';

const Login = () => {
    const authContext = useContext(AuthContext);
    const axios = createAxiosInstance(authContext);
    const profileContext = useContext(ProfileContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [password, setPassword] = useState('');
    const [errors,setErrors] = useState({});

    const handleLogin = async (e) => {
        e.preventDefault();
        setProcessing(true);
        if(!Cookies.get('XSRF-TOKEN')){
            await axios.get('/sanctum/csrf-cookie', {
                withCredentials: 'include',
            });
        }
        try {
            await axios.post('/login', {
                email: email, password: password
            });
            await authContext.fetchUser();
            await profileContext.fetchProfile();
            navigate('/admin/dashboard');
        } catch (error) {
            console.log('error :>> ', error);
            setErrors(error.response.data.errors);
        } finally {
            setEmail('');
            setPassword('');
            setProcessing(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"

                            className="mt-1 p-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                            <span className='text-red-500'>{errors.email[0]}</span>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"

                            className="mt-1 p-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                            <span className='text-red-500'>{errors.password[0]}</span>
                        )}
                    </div>
                    <div>
                        <Link className='text-indigo-600' to='/register'>dont have an account?</Link><br />
                        <Link className='text-indigo-600' to='/forgot-password'>forget you password?</Link><br />
                    </div>
                    <div>
                        <button
                            disabled={processing}
                            type="submit"
                            className={`group relative w-full flex justify-center py-2 px-4 border 
        ${processing ? 'bg-indigo-300 cursor-not-allowed' :
                                    'border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {!processing ? 'login' : 'processing'}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
