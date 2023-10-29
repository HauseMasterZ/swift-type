import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ user, handleLogoutClick, ...props }) => {
    const [isDropDownMenuOpen, setIsDropDownMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const hamburgerMenuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !hamburgerMenuRef.current.contains(event.target)) {
            setIsDropDownMenuOpen(false);
         }
        };

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="hamburger-menu">
            <div className="hamburger-icon" onClick={(e) => {setIsDropDownMenuOpen(!isDropDownMenuOpen)}} ref={hamburgerMenuRef}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            {isDropDownMenuOpen ? (
                <div className="dropdown-menu show" ref={dropdownRef}>
                    {user ? (
                        <>
                            <Link href="#" to="/profile" style={{ 'display': 'inline-block' }}>
                                <img src={props.profilePhotoUrl} className='dropdown-avatar' />
                                {props.username}
                            </Link>
                            <Link href="#" to="/settings" >Account Settings</Link>
                            <Link href="#" onClick={handleLogoutClick}>Logout</Link>
                        </>
                    ) : (
                        <>
                            {Object.keys(props).map((key) => (
                                <Link key={key} to={`/${key}`}>{props[key]}</Link>
                            ))}
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default HamburgerMenu;