import React, { useState, useEffect } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import '../static/styles/styles.scss'
import HamburgerMenu from './Hamburger';
import LoadingSpinner from './LoadingSpinner';
function Settings() {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleDeleteAccountClick = () => {
        setShowModal(true);
    };

    const handleNoClick = () => {
        setShowModal(false);
    };

    const handleYesClick = async () => {
        setIsLoading(true);
        const user = auth.currentUser;
        const userId = user.uid;
        const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, userId);
        try {
            await deleteDoc(userRef);
            try {
                await user.delete();
                toast.success('Account deleted');
                setIsLoading(false);
                navigate('/');
            } catch (error) {
                console.error('Error deleting user data:', error);
                setIsLoading(false);
                alert('Error deleting user, requires recent login');
            }
        } catch (error) {
            console.log(error);
            alert('Error deleting user data please try again later');
            setIsLoading(false);
        }
    };

    return (
        <div className={`container`}>
            <Header />
            <HamburgerMenu home="Home" />
            {isLoading ? <LoadingSpinner /> : ''}
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