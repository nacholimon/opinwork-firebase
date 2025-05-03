import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    // Your Firebase configuration object will go here
    // You'll need to get this from your Firebase Console
    apiKey: "AIzaSyAeJN0uLFgQUr4swCOPqsu_5r9jvMcmFBc",
    authDomain: "opinwork-65d70.firebaseapp.com",
    projectId: "opinwork-65d70",
    storageBucket: "opinwork-65d70.firebasestorage.app",
    messagingSenderId: "1076654869500",
    appId: "1:1076654869500:web:ccb21929982113d60e8079",
    measurementId: "G-9W8E5ME3GR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app); 