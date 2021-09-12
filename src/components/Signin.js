import React, { useRef } from 'react'
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "firebase/auth"
import './Signin.css'
const Signin = () => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const signUp = e => {
        e.preventDefault();
        createUserWithEmailAndPassword(
            auth,
            emailRef.current.value,
            passwordRef.current.value
        ).then(userCredential => {
            console.log('user',userCredential.user)
        }).catch(err => {
            console.log(err)
        })
    }
    const signIn = e => {
        e.preventDefault();
        signInWithEmailAndPassword( 
            auth,
            emailRef.current.value,
            passwordRef.current.value
        ).then(userCredential => {
            console.log('user',userCredential.user)
        }).catch(err => {
            console.log(err)
        })
    }
    return <>
        <div className="signin">
            <form action="">
                <h1>Sign in</h1>
                <input ref={emailRef} type="email"/>
                <input ref={passwordRef} type="password"/>
                <button className="authButton" onClick={signIn}>Sign in </button>
                <h6>Not yet register? <span onClick={signUp} className="signin__link">Sign up</span></h6>
            </form>
        </div>
    </>
}

export default Signin
