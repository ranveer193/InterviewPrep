import {getAuth,createUserWithEmailAndPassword} from 'firebase/auth';
import { useState } from 'react';
import {firebaseApp} from '../firebase';

function Signup() {
    
    const auth = getAuth(firebaseApp);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created:', userCredential.user);
            alert('User created successfully!');
        } catch (error) {
            console.log('Error creating user:', error);
            alert('Error creating user!');
        }
    }

    return(
        <>
            <input type="email"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)} />
            <input type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignup}>Signup</button>
        </>
    )
}

export default Signup;