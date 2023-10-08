import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, applyActionCode } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

import '../static/styles/styles.scss'

function Verify() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const darkLightToggleElementRef = React.useRef(null);

    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle('active');
        document.body.classList.toggle('dark');
        !isDarkMode ? (document.body.style.backgroundColor = '#18191A') : (document.body.style.backgroundColor = '#E4E9F7');
        setIsDarkMode(!isDarkMode);
    }

    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    return (
        <div className={`container ${isDarkMode ? 'dark' : ''}`}>
            <Link to="/" className="no-style">
                <h1 id="title">
                    <span>Swift</span> <span>Type</span> ~ HauseMaster
                </h1>
            </Link>
            <div className="dark-light" onClick={handleDarkLightToggleClick} ref={darkLightToggleElementRef}>
                <i className="bx bx-sun sun"></i>
                <i className="bx bx-moon moon"></i>
            </div>
            <div className="github">
                    <a href="https://github.com/HauseMasterZ/swift-type" target="_blank">
                        <i className='bx bxl-github'></i>
                    </a>
                </div>
            <div className="stats">
                <div className="stat">
                    <h1 style={{marginTop: "15%"}}>Verification link has been sent to your email.</h1>
                    <h1>
                    <Link to="/login">Login</Link>
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default Verify;