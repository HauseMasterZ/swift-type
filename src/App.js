import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Forgot from './components/Forgot';
import NotFound from './components/404';
import Verify from './components/Verify';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Settings from './components/Settings';

function App() {
    return (
        <Routes>
            <Route path="/verify" element={<ProtectedRoute component={Verify} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
    );
}

export default App;