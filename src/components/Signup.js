import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onEnd } from '../static/scripts/flying-focus';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import '../static/styles/styles.scss'
import HamburgerMenu from './Hamburger';
import LoadingSpinner from './LoadingSpinner';
function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const username = usernameRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDocRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
            await setDoc(userDocRef, {});
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
            await sendEmailVerification(user);
            navigate('/verify');
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            alert(error.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let unsubscribe = null;
        try {

            unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    navigate('/');
                    return;
                } else {
                    return;
                }
            });
        } catch (error) {
            console.error(error);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <div className={`container`}>
            <Header />
            <HamburgerMenu home="Home" login="Login" />
            {isLoading ? <LoadingSpinner /> : ''}

            <div className="form-container">
                <form>
                    <h2>Signup</h2>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required placeholder="Username" ref={usernameRef} autoComplete="name" />
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required placeholder="Email" ref={emailRef} autoComplete="email" />
                    <label htmlFor="new-password">Password:</label>
                    <input type="password" id="new-password" name="new-password" required placeholder="Password" ref={passwordRef} autoComplete='new-password' />
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input type="password" id="confirm-password" name="confirm-password" required placeholder="Confirm Password" ref={confirmPasswordRef} autoComplete='new-password' />
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