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

function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const navigate = useNavigate();
    const [isDropDownMenuOpen, setisDropdownMenuOpen] = useState(false);
    const dropdownMenuRef = useRef(null);

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

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDocRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
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

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigate('/');
                return;
            } else {
                return;
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        dropdownMenuRef.current.classList.toggle("show");
    }, [isDropDownMenuOpen]);

    return (
        <div className={`container`}>
            <Header />
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