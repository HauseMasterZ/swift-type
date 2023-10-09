import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { getFirestore, doc, setDoc, query, where, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { useNavigate } from 'react-router-dom';
import '../static/styles/styles.scss'

function Profile() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [totalRacesTaken, setTotalRacesTaken] = useState(0);
    const [totalAvgAccuracy, setTotalAvgAccuracy] = useState(0);
    const [email, setEmail] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
    const [totalAverageWpm, setTotalAverageWpm] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        // Set up an observer to listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                setUser(user);
                setEmail(user.email);

                // Fetch additional user information from your database
                const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
                getDoc(userRef).then((doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setUsername(data[process.env.REACT_APP_USERNAME_KEY]);
                        setProfilePhotoUrl(data[process.env.REACT_APP_PROFILE_PHOTO_URL_KEY]);
                        setTotalRacesTaken(data[process.env.REACT_APP_TOTAL_RACES_TAKEN_KEY]);
                        setTotalAvgAccuracy(data[process.env.REACT_APP_TOTAL_AVG_ACCURACY_KEY]);
                        setTotalAverageWpm(data[process.env.REACT_APP_TOTAL_AVG_WPM_KEY]);
                    } else {
                        console.log('No such document!');
                    }
                }).catch((error) => {
                    console.log('Error getting document:', error);
                });
            } else {
                // User is signed out.
                setUser(null);
                setUsername('');
                setEmail('');
                setProfilePhotoUrl('');
                setTotalRacesTaken(0);
                setTotalAvgAccuracy(0);
                navigate('/');
                return;
            }
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, []);


    const [isLoading, setIsLoading] = useState(false);


    const darkLightToggleElementRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    function handleDarkLightToggleClick() {
        darkLightToggleElementRef.current.classList.toggle("active");
        document.body.classList.toggle("dark");
        !isDarkMode ? document.body.style.backgroundColor = '#18191A' : document.body.style.backgroundColor = '#E4E9F7';
        setIsDarkMode(!isDarkMode);
    }

    const fileInputRef = useRef(null);
    function handleProfileAvatarClick() {
        fileInputRef.current.accept = 'image/*'; // Only allow image files
        fileInputRef.current.click();
    }
    const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB in bytes

    const handleFileInputChange = async (event) => {
        setIsLoading(true);
        const file = event.target.files[0]; // Get the selected file
        if (file.size > MAX_FILE_SIZE) {
            console.error('File size exceeds the limit of 6MB');
            setIsLoading(false);
            return;
          }
        const storageRef = ref(storage, `avatars/${file.name}`); // Create a reference to the storage location

        try {
            // Upload the file to Firebase Storage
            await uploadBytes(storageRef, file);

            // Get the download URL for the uploaded file
            const downloadURL = await getDownloadURL(storageRef);
            setProfilePhotoUrl(downloadURL);

            // console.log('File uploaded');
            // You can now use the downloadURL to display or save the uploaded photo.
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            return;
        }
        if (profilePhotoUrl !== '' && profilePhotoUrl !== process.env.REACT_APP_DEFAULT_PROFILE_PHOTO_URL) {
            // Update the database with the new profile photo URL
            const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
            updateDoc(userRef, { [process.env.REACT_APP_PROFILE_PHOTO_URL_KEY]: profilePhotoUrl })
                .then(() => {
                    // console.log('Profile photo URL updated in the database');
                })
                .catch((error) => {
                    console.error('Error updating profile photo URL in the database:', error);
                });
            setIsLoading(false);
        }
    }, [profilePhotoUrl]);

    useEffect(() => {
        document.body.classList.add('dark');
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

            <div className="profile">
                <div className="profile-avatar-container">
                    <img src={profilePhotoUrl} onClick={handleProfileAvatarClick} className='profile-avatar' alt="Profile" />
                    <h1 className='profile-username'>{username}</h1>
                </div>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileInputChange} />
            </div>
            <div className="stats">
                <div className="stat">
                    <h2>Total Races Taken</h2>
                    <h3>{totalRacesTaken}</h3>
                </div>
                <div className="stat">
                    <h2>Total Average Accuracy</h2>
                    <h2>{totalAvgAccuracy}%</h2>
                </div>
                <div className="stat">
                    <h2>Total Average WPM</h2>
                    <h2>{totalAverageWpm} WPM</h2>
                </div>
            </div>

        </div>
    );
}

export default Profile;

