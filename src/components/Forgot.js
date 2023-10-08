import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getFirestore, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { onEnd } from '../static/scripts/flying-focus';
import { getAuth, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import '../static/styles/styles.scss'

function Forgot() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const darkLightToggleElementRef = React.useRef(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Set up an observer to listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                navigate('/');
            } else {
                // User is signed out.
                return;

            }
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, []);


    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle('active');
        document.body.classList.toggle('dark');
        !isDarkMode
            ? (document.body.style.backgroundColor = '#18191A')
            : (document.body.style.backgroundColor = '#E4E9F7');
        setIsDarkMode(!isDarkMode);
    }
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {

            const usernameQuery = query(collection(db, 'users'), where('username', '==', email));
            const emailQuery = query(collection(db, 'users'), where('email', '==', email));
            const [usernameDoc, emailDoc] = await Promise.all([getDocs(usernameQuery), getDocs(emailQuery)]);

            if (emailDoc.size === 0) {
                alert('Email doesnt exist');
                return;
            }

            await sendPasswordResetEmail(auth, email);
            setIsSent(true);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.body.classList.add("dark");
    }, []);
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
                    <i className="bx bxl-github"></i>
                </a>
            </div>
            {isLoading ? <div className="spinner-border" style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', display: 'block' }} role="status"></div> : ''}

            {!isSent ? <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h2>Forgot Password</h2>
                    <label htmlFor="username-email">Email:</label>
                    <input type="text" id="username-email" name="username-email" onChange={(event) => setEmail(event.target.value)} required placeholder="Username or Email" />
                    <button type="submit" className="button" onClick={handleSubmit}>
                        Submit
                    </button>
                </form>
                <div className="login-link-container">
                    <Link to="/login" className="login-link">
                        Back to Login
                    </Link>
                </div>
            </div> : <div className="stats">
                <div className="stat">
                    <h1 style={{ marginTop: "15%" }}>Password reset link has been sent to your email.</h1>
                    <h1>
                        <Link to="/login">Login</Link>
                    </h1>
                </div>
            </div>}
        </div>
    );
}

export default Forgot;