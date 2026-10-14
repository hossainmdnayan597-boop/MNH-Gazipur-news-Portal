import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';

// Default Firebase Configuration placeholder
// Users can paste their credentials in Admin Panel -> Firebase Settings or update here
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const STORAGE_KEY = 'mnh_gazipur_firebase_config';

export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading saved Firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: typeof DEFAULT_FIREBASE_CONFIG) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Error saving Firebase config', e);
  }
}

export function isFirebaseConfigured(config = getSavedFirebaseConfig()): boolean {
  return (
    Boolean(config.apiKey) &&
    config.apiKey !== 'YOUR_API_KEY' &&
    Boolean(config.projectId) &&
    config.projectId !== 'YOUR_PROJECT_ID'
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebaseInstance() {
  const config = getSavedFirebaseConfig();
  if (!isFirebaseConfigured(config)) {
    return { app: null, db: null, auth: null, isLive: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth, isLive: true };
  } catch (err) {
    console.warn('Firebase initialization failed (fallback to local mock):', err);
    return { app: null, db: null, auth: null, isLive: false, error: err };
  }
}
