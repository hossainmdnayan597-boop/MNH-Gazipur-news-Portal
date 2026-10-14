import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirebaseInstance } from './firebaseConfig';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string;
}

export const DEFAULT_ADMIN: AdminUser = {
  uid: 'admin-nayan-01',
  email: 'admin@mnhgazipur.com',
  displayName: 'Md. Nayan Hossen',
  role: 'প্রধান সম্পাদক ও প্রকাশক (Super Admin)',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
};

const AUTH_STORAGE_KEY = 'mnh_gazipur_admin_session';

export function getLocalAdminSession(): AdminUser | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed reading admin session', e);
  }
  return null;
}

export function setLocalAdminSession(user: AdminUser | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export async function loginAdmin(email: string, pass: string): Promise<AdminUser> {
  const { auth, isLive } = getFirebaseInstance();

  // If live Firebase auth is enabled
  if (isLive && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const admin: AdminUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || 'Md. Nayan Hossen',
        role: 'Super Admin',
        avatarUrl: cred.user.photoURL || DEFAULT_ADMIN.avatarUrl,
      };
      setLocalAdminSession(admin);
      return admin;
    } catch (err: any) {
      // If Firebase Auth fails with credentials error, throw or allow fallback if using demo credentials
      if (email === 'admin@mnhgazipur.com' && pass === 'admin123456') {
        setLocalAdminSession(DEFAULT_ADMIN);
        return DEFAULT_ADMIN;
      }
      throw new Error(err.message || 'Firebase Authentication ব্যর্থ হয়েছে');
    }
  }

  // Demo / local authentication
  if (email === 'admin@mnhgazipur.com' && pass === 'admin123456') {
    setLocalAdminSession(DEFAULT_ADMIN);
    return DEFAULT_ADMIN;
  } else if (email && pass.length >= 6) {
    // Allow custom email with any 6+ digit password for demo flexibility
    const customAdmin: AdminUser = {
      uid: 'user-' + Date.now(),
      email,
      displayName: 'Md. Nayan Hossen',
      role: 'সম্পাদক',
      avatarUrl: DEFAULT_ADMIN.avatarUrl,
    };
    setLocalAdminSession(customAdmin);
    return customAdmin;
  }

  throw new Error('ভুল ইমেইল অথবা পাসওয়ার্ড! (সঠিক তথ্য: admin@mnhgazipur.com / admin123456)');
}

export async function logoutAdmin(): Promise<void> {
  const { auth, isLive } = getFirebaseInstance();
  if (isLive && auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning', e);
    }
  }
  setLocalAdminSession(null);
}

export function subscribeToAuth(callback: (user: AdminUser | null) => void): () => void {
  const { auth, isLive } = getFirebaseInstance();

  if (isLive && auth) {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const admin: AdminUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Md. Nayan Hossen',
          role: 'Super Admin',
          avatarUrl: fbUser.photoURL || DEFAULT_ADMIN.avatarUrl,
        };
        setLocalAdminSession(admin);
        callback(admin);
      } else {
        const local = getLocalAdminSession();
        callback(local);
      }
    });
    return unsubscribe;
  }

  // Local listener
  const initial = getLocalAdminSession();
  callback(initial);
  return () => {};
}
