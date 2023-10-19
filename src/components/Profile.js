import { useEffect, useState, useRef } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../static/styles/styles.scss'
import Header from './Header';
import HamburgerMenu from './Hamburger';
import LoadingSpinner from './LoadingSpinner';
function Profile() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [totalRacesTaken, setTotalRacesTaken] = useState(0);
    const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB 
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [totalAvgAccuracy, setTotalAvgAccuracy] = useState(0);
    const [email, setEmail] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
    const [totalAverageWpm, setTotalAverageWpm] = useState(0);
    const navigate = useNavigate();

    function handleProfileAvatarClick() {
        fileInputRef.current.accept = 'image/*'; // Only allow image files
        fileInputRef.current.click();
    }

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
            await uploadBytes(storageRef, file);

            const downloadURL = await getDownloadURL(storageRef);
            setProfilePhotoUrl(downloadURL);

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
            const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
            updateDoc(userRef, { [process.env.REACT_APP_PROFILE_PHOTO_URL_KEY]: profilePhotoUrl })
                .catch((error) => {
                    console.error('Error updating profile photo URL in the database:', error);
                });
            setIsLoading(false);
        }
    }, [profilePhotoUrl]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setEmail(user.email);

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

    return (
        <div className={`container`}>
            <Header />
            <HamburgerMenu home="Home"/>
            {isLoading ? <LoadingSpinner /> : ''}
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

