// Firebase Configuration
// Replace these values with your Firebase project configuration
// You can find these in Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
  apiKey: "AIzaSyAgsuEAW8bcyFfsV55WFiKmPHEIfjYnjJY",
  authDomain: "fullqueso-bot.firebaseapp.com",
  projectId: "fullqueso-bot",
  storageBucket: "fullqueso-bot.firebasestorage.app",
  messagingSenderId: "209934280831",
  appId: "1:209934280831:web:2bff273a1fe0ecc784b74a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;
