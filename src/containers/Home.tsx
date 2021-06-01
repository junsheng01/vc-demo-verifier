/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Home.css'

const Home: React.FC = () => {
    const [showSignUp, setShowSignUp] = useState<boolean>(false)

    return (
        <div className='page-form'>
            { showSignUp ? <Signup setShowSignUp={setShowSignUp}/> : <Login/> }
            { showSignUp ? 
                <small>Your company already signed up with verifier?
                    <a href='#' onClick={() => setShowSignUp(false)}> Log in here </a>
                </small>: 
                <small>Want to register for an account for your company to verify credentials?
                    <a href='#' onClick={() => setShowSignUp(true)}> Sign up here </a>
                </small>
            }
        </div>
    )
}

export default Home;