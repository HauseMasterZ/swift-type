import React from 'react';
import Header from './Header';
import '../static/styles/styles.scss'

function NotFound() {

    return (
        <div className={`container`}>
            <Header />
            <div className='instruction'>
                <h1>404 Not Found</h1>
                <p>The page you are looking for does not exist.</p>
            </div>
        </div>
    );
}

export default NotFound;