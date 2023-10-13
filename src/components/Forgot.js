import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { query, where, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../static/styles/styles.scss'
import Header from './Header';
function Forgot() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const usernameQuery = query(collection(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME), where(process.env.REACT_APP_USERNAME_KEY, '==', email));
            const emailQuery = query(collection(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME), where(process.env.REACT_APP_EMAIL_KEY, '==', email));
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
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigate('/');
            } else {
                return;
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className={`container`}>
            <Header />
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