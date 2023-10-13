import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../static/styles/styles.scss'
import Header from './Header';

function Settings() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const darkLightToggleElementRef = React.useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle('active');
        document.body.classList.toggle('dark');
        !isDarkMode ? (document.body.style.backgroundColor = '#18191A') : (document.body.style.backgroundColor = '#E4E9F7');
        setIsDarkMode(!isDarkMode);
    }

    useEffect(() => {
        document.body.classList.add("dark");
    }, []);

    const handleDeleteAccountClick = () => {
        setShowModal(true);
    };

    const handleYesClick = () => {
        setIsLoading(true);
        const user = auth.currentUser;
        const userId = user.uid;
        const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, userId);
        deleteDoc(userRef)
            .then(() => {
                console.log('User data deleted successfully');
                user.delete().then(() => {
                    setIsLoading(false);
                    navigate('/');
                }).catch((error) => {
                    console.log(error);
                });
            })
            .catch((error) => {
                console.error('Error deleting user data:', error);
            });
    };
    const handleNoClick = () => {
        setShowModal(false);
    };

    return (
        <div className={`container`}>
            <Header />
            {isLoading ? <div className="spinner-border" style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', display: 'block' }} role="status"></div> : ''}
            <div className="stat">
                <button type="button" className="button danger" onClick={handleDeleteAccountClick}>
                    Delete Account
                </button>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>ARE YOU SURE?</h2>
                        <div className="modal-buttons">
                            <button type="button" className="button danger" onClick={handleYesClick}>
                                Yes
                            </button>
                            <button type="button" className="button" onClick={handleNoClick}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;