// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC46JSK8g5D903ARSkGa7EbFvPwG1MudDE",
    authDomain: "altair-auth.firebaseapp.com",
    projectId: "altair-auth",
    storageBucket: "altair-auth.firebasestorage.app",
    messagingSenderId: "170834081042",
    appId: "1:170834081042:web:bfa9e8e6fa54c86adaafcb",
    measurementId: "G-545QWW086X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
