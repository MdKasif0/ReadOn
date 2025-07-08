import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Instead of throwing an error, we'll check for the config and conditionally initialize.
// This allows the app to run in a limited mode if Firebase is not configured.
const hasFirebaseConfig = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
);

const app = hasFirebaseConfig && !getApps().length ? initializeApp(firebaseConfig) : (hasFirebaseConfig ? getApp() : null);
const auth = hasFirebaseConfig ? getAuth(app!) : null;
const db = hasFirebaseConfig ? getFirestore(app!) : null;

if (!hasFirebaseConfig) {
  console.warn("Firebase configuration is missing or incomplete. The app will run in a limited mode where features like authentication and database access are disabled. Please provide the necessary NEXT_PUBLIC_FIREBASE_* environment variables.");
}


export { app, auth, db };
