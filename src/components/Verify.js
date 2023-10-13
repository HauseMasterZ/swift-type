import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../static/styles/styles.scss'
import Header from './Header';

function Verify() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const darkLightToggleElementRef = React.useRef(null);

    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle('active');
        document.body.classList.toggle('dark');
        !isDarkMode ? (document.body.style.backgroundColor = '#18191A') : (document.body.style.backgroundColor = '#E4E9F7');
        setIsDarkMode(!isDarkMode);
    }

    return (
        <div className={`container`}>
            <Header />
            <div className="stats">
                <div className="stat">
                    <h1 style={{ marginTop: "15%" }}>Verification link has been sent to your email.</h1>
                    <h1>
                        <Link to="/login">Login</Link>
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default Verify;