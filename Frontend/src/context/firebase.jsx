import { createContext,useContext } from 'react';
import {initializeApp} from 'firebase/app'
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC0ERzg5sHdIlNeCVSBV4_jH9hy65UMy_A",
  authDomain: "interviewsite-1d5bf.firebaseapp.com",
  projectId: "interviewsite-1d5bf",
  storageBucket: "interviewsite-1d5bf.firebasestorage.app",
  messagingSenderId: "197459394543",
  appId: "1:197459394543:web:e2e029b25e195e17a8001a"
};

const firebaseApp = initializeApp(firebaseConfig);
const FirebaseContext = createContext(firebaseApp);

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={firebaseApp}>
      {children}
    </FirebaseContext.Provider>
  );
}