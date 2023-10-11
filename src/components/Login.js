import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import '../static/styles/styles.scss'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleUsernameChange = (event) => {
        setEmail(event.target.value);
    };
    const darkLightToggleElementRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

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


    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle("active");
        document.body.classList.toggle("dark");
        !isDarkMode ? document.body.style.backgroundColor = '#18191A' : document.body.style.backgroundColor = '#E4E9F7';
        setIsDarkMode(!isDarkMode);
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            // Sign in the user with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if the user's email is verified
            if (!user.emailVerified) {
                alert('Please verify your email before logging in');
                await signOut(auth);
                setIsLoading(false);
                return;
            }

            // Redirect the user to the home page
            setIsLoading(false);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert(error.message);
            setIsLoading(false);
        }
    };
    const [isDropDownMenuOpen, setisDropdownMenuOpen] = useState(false);
    const dropdownMenuRef = useRef(null);
    useEffect(() => {
        dropdownMenuRef.current.classList.toggle("show");
    }, [isDropDownMenuOpen]);
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
                    <Link to="/signup">Signup</Link>
                </div>
            </div>
            {isLoading ? <div className="spinner-border" style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', display: 'block' }} role="status"></div> : ''}
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    <label htmlFor="username">Email:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={email}
                        placeholder='Email'
                        onChange={handleUsernameChange}
                        required
                    />
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        placeholder='Password'
                        onChange={handlePasswordChange}
                        required
                    />
                    <button className="button" type="submit">
                        Login
                    </button>
                </form>
                <p>
                    <Link to="/forgot">
                        Forgot Password?
                    </Link>
                </p>
                <p>
                    Don't have an account?{' '}
                    <Link to="/signup">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;