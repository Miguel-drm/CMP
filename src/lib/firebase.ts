import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, ref, onValue, onDisconnect, serverTimestamp, set, update, remove, type Database } from "firebase/database";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

// Expect env vars to be injected at build time via Vite (Vite 5/7 uses import.meta.env)
const config: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey &&
  config.appId &&
  config.projectId &&
  config.databaseURL
);

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase config incomplete. Missing required env vars.");
  }
  if (!getApps().length) {
    return initializeApp(config);
  }
  return getApps()[0]!;
}

export function getFirebaseDatabase(): Database {
  return getDatabase(getFirebaseApp());
}

export { ref, onValue, onDisconnect, serverTimestamp, set, update, remove };


