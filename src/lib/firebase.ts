import { initializeApp, getApps, getApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { clearUserKey } from "./indexDB";

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
const usersCollection = collection(db, "users");
const notesCollection = collection(db, "notes");
const listsCollection = collection(db, "lists");
const auth = getAuth(app);
const authHandlers = {
  signup: (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password),
  signin: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),
  signout: async () => {
    await signOut(auth);
    await clearUserKey();
  },
};

export {
  app,
  usersCollection,
  notesCollection,
  listsCollection,
  auth,
  authHandlers,
};
