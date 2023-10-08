import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onEnd } from '../static/scripts/flying-focus';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import '../static/styles/styles.scss'

function Signup() {

    const navigate = useNavigate();
    useEffect(() => {
        // Set up an observer to listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                navigate('/');
                return;
            } else {
                // User is signed out.
                return;

            }
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, []);

    const [isDarkMode, setIsDarkMode] = useState(true);
    const darkLightToggleElementRef = React.useRef(null);
    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle("active");
        document.body.classList.toggle("dark");
        !isDarkMode ? document.body.style.backgroundColor = '#18191A' : document.body.style.backgroundColor = '#E4E9F7';
        setIsDarkMode(!isDarkMode);
    }
    useEffect(() => {
        document.body.classList.add("dark");
    }, []);

    const [isDropDownMenuOpen, setisDropdownMenuOpen] = useState(false);
    const dropdownMenuRef = useRef(null);
    useEffect(() => {
        dropdownMenuRef.current.classList.toggle("show");
    }, [isDropDownMenuOpen]);
    useEffect(() => {
        document.body.classList.add("dark");
    }, []);
    const [isLoading, setIsLoading] = useState(false);

    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const username = usernameRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            // Check if the username or email already exists in Firestore
            const usernameDocRef = query(collection(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME), where(process.env.REACT_APP_USERNAME_KEY, '==', username), limit(1));
            const emailDocRef = query(collection(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME), where(process.env.REACT_APP_EMAIL_KEY, '==', email), limit(1));
            const [usernameDoc, emailDoc] = await Promise.all([getDocs(usernameDocRef), getDocs(emailDocRef)]);
            if (usernameDoc.size > 0) {
                alert('Username already exists');
                return;
            }

            if (emailDoc.size > 0) {
                alert('Email already exists');
                return;
            }

            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                [process.env.REACT_APP_CREATED_AT_KEY]: new Date(),
                [process.env.REACT_APP_PROFILE_PHOTO_URL_KEY]: process.env.REACT_APP_DEFAULT_PROFILE_PHOTO_URL,
                [process.env.REACT_APP_TOTAL_RACES_TAKEN_KEY]: 0,
                [process.env.REACT_APP_TOTAL_AVG_WPM_KEY]: 0,
                [process.env.REACT_APP_TOTAL_AVG_ACCURACY_KEY]: 0,
                [process.env.REACT_APP_USERNAME_KEY]: username,
                [process.env.REACT_APP_EMAIL_KEY]: email,
            });
            onEnd();
            navigate('/verify');
            await sendEmailVerification(user);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            alert(error.message);
            setIsLoading(false);
        }
    };
    return (
        <div className={`container ${isDarkMode ? 'dark' : ''}`}>
            <Link to="/" className="no-style">
                <h1 id="title">
                    <span>Swift</span> <span>Type</span> ~ HauseMaster
                </h1>
            </Link>
            <div className="dark-light" onClick={handleDarkLightToggleClick} ref={darkLightToggleElementRef}>
                <i className='bx bx-sun sun'></i>
                <i className='bx bx-moon moon'></i>
            </div>
            <div className="github">
                <a href="https://github.com/HauseMasterZ/swift-type" target="_blank">
                    <i className="bx bxl-github"></i>
                </a>
            </div>
            <div className="hamburger-menu">
                <div className="hamburger-icon" onClick={(e) => (setisDropdownMenuOpen(!isDropDownMenuOpen))}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className="dropdown-menu" ref={dropdownMenuRef}>
                    <Link to="/">Home</Link>
                    <Link to="/login">Login</Link>
                </div>
            </div>
            {isLoading ? <div className="spinner-border" style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', display: 'block' }} role="status"></div> : ''}
            <div className="form-container">
                <form>
                    <h2>Signup</h2>
                    <label htmlFor="new-username">Username:</label>
                    <input type="text" id="username" name="username" required placeholder="Username" ref={usernameRef} />
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required placeholder="Email" ref={emailRef} />
                    <label htmlFor="new-password">Password:</label>
                    <input type="password" id="new-password" name="new-password" required placeholder="Password" ref={passwordRef} />
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input type="password" id="confirm-password" name="confirm-password" required placeholder="Confirm Password" ref={confirmPasswordRef} />
                    <button type="submit" className="button" onClick={handleSubmit}>
                        Signup
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;