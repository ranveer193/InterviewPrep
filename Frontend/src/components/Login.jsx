import {firebaseApp} from '../firebase';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import React, {useState} from 'react';

function Login () {
    const auth = getAuth(firebaseApp);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                alert('Login successful');
                console.log('User logged in:', user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Login failed:', errorCode, errorMessage);
            });
    }

    return (
        <>
        
        </>
    )
}

export default Login;