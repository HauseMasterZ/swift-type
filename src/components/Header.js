import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../static/styles/styles.scss';

function Header() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const darkLightToggleElementRef = React.useRef(null);

    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle('active');
        document.body.classList.toggle('dark');
        if (!isDarkMode) {
            document.body.style.backgroundColor = '#18191A';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.style.backgroundColor = '#E4E9F7';
            localStorage.setItem('theme', 'light');
        }
        setIsDarkMode(!isDarkMode);
    }

    useEffect(() => {
        const preferredTheme = localStorage.getItem('theme');
        if (preferredTheme === 'dark') {
            setIsDarkMode(true);
            document.body.classList.add('dark');
            darkLightToggleElementRef.current.classList.add('active');
            document.body.style.backgroundColor = '#18191A';
        } else {
            setIsDarkMode(false);
            document.body.classList.remove('dark');
            darkLightToggleElementRef.current.classList.remove('active');
            document.body.style.backgroundColor = '#E4E9F7';
        }
    }, []);

    return (
        <div className={`header ${isDarkMode ? 'dark' : ''}`}>
            <Link to="/home" className="no-style">
                <h1 id="title">
                    <span>Swift</span> <span>Type</span> ~ HauseMaster
                </h1>
            </Link>
            <div
                className={`dark-light ${isDarkMode ? 'active' : ''}`}
                onClick={handleDarkLightToggleClick}
                ref={darkLightToggleElementRef}
            >
                <i className="bx bx-sun sun"></i>
                <i className="bx bx-moon moon"></i>
            </div>
            <div className="github">
                <a href="https://github.com/HauseMasterZ/swift-type" target="_blank" rel='noopener'>
                    <i className="bx bxl-github"></i>
                </a>
            </div>
        </div>
    );
}

export default Header;