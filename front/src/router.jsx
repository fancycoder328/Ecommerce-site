import {
    createBrowserRouter,
  } from "react-router-dom";
import Home from "./views/Home";
import GuestLayout from "./layouts/GuestLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./views/Login";
import Register from "./views/Register";
import VerifyEmail from "./views/VerifyEmail";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import Categories from "./views/admin/category";
import Profile from "./views/admin/profile";
import Dashboard from "./views/admin/dashboard";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'register',
                element: <Register />
            },
            {
                path: 'forgot-password',
                element: <ForgotPassword />
            },
            {
                path: 'password-reset',
                element: <ResetPassword />
            },
        ]
    },
    {
        path: '/user',
        element: <AuthLayout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'categories',
                element: <Categories />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'verify',
                element: <VerifyEmail />
            },
        ]
    },
]);

export default router;

