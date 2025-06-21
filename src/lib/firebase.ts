import { initializeApp, getApps, getApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app only once (for Next.js HMR safety)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const notesCollection = collection(db, "notes");
const auth = getAuth(app);
const authHandlers = {
  signup: async (email: string, password: string) =>
    await createUserWithEmailAndPassword(auth, email, password),
  signin: async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  },
  signout: async () => signOut(auth),
  forgotPassword: async (email: string) =>
    await sendPasswordResetEmail(auth, email),
};
export { app, notesCollection, auth, authHandlers };
