import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
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

export const SUPER_ADMIN_EMAIL = 'hossainmdnayan597@gmail.com';

export const DEFAULT_ADMIN: AdminUser = {
  uid: 'admin-nayan-01',
  email: SUPER_ADMIN_EMAIL,
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
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed updating local session', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mnh_auth_updated', { detail: user }));
  }
}

/**
 * Check if a user is the Super Admin (Md. Nayan Hossen)
 */
export function isUserSuperAdmin(user?: AdminUser | null): boolean {
  const target = user !== undefined ? user : getLocalAdminSession();
  if (!target) return false;
  const email = (target.email || '').toLowerCase().trim();
  const superEmail = SUPER_ADMIN_EMAIL.toLowerCase().trim();
  return (
    email === superEmail ||
    email === 'admin@mnhgazipur.com' ||
    (target.role || '').toLowerCase().includes('super admin') ||
    (target.displayName || '').toLowerCase().includes('nayan')
  );
}

/**
 * Determine role based on email address
 */
export function getUserRole(email: string): string {
  const normalized = email.toLowerCase().trim();
  if (normalized === SUPER_ADMIN_EMAIL.toLowerCase() || normalized === 'admin@mnhgazipur.com') {
    return 'প্রধান সম্পাদক ও প্রকাশক (Super Admin)';
  }
  return 'সম্পাদক (News Editor)';
}

/**
 * Login with Email / Username & Password
 */
export async function loginAdmin(emailOrUsername: string, pass: string): Promise<AdminUser> {
  const trimmedInput = emailOrUsername.trim();
  // Normalize username to email if entered as simple username
  let targetEmail = trimmedInput;
  if (trimmedInput === 'nayan' || trimmedInput === 'admin') {
    targetEmail = SUPER_ADMIN_EMAIL;
  }

  const { auth, isLive } = getFirebaseInstance();

  // If live Firebase auth is enabled
  if (isLive && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, targetEmail, pass);
      const isSuper = cred.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const admin: AdminUser = {
        uid: cred.user.uid,
        email: cred.user.email || targetEmail,
        displayName: cred.user.displayName || (isSuper ? 'Md. Nayan Hossen' : 'News Editor'),
        role: getUserRole(cred.user.email || targetEmail),
        avatarUrl: cred.user.photoURL || DEFAULT_ADMIN.avatarUrl,
      };
      setLocalAdminSession(admin);
      return admin;
    } catch (err: any) {
      // If Firebase Auth fails with credentials error, allow Super Admin demo bypass if using master credentials
      if (
        (targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || targetEmail === 'admin@mnhgazipur.com') &&
        (pass === 'admin123456' || pass === 'nayan123456' || pass === 'admin123')
      ) {
        setLocalAdminSession(DEFAULT_ADMIN);
        return DEFAULT_ADMIN;
      }
      throw new Error(err.message || 'Firebase Authentication ব্যর্থ হয়েছে');
    }
  }

  // Demo / local authentication
  if (
    (targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || targetEmail === 'admin@mnhgazipur.com') &&
    (pass === 'admin123456' || pass === 'nayan123456' || pass === 'admin123')
  ) {
    setLocalAdminSession(DEFAULT_ADMIN);
    return DEFAULT_ADMIN;
  } else if (targetEmail && pass.length >= 6) {
    const customAdmin: AdminUser = {
      uid: 'user-' + Date.now(),
      email: targetEmail,
      displayName: targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'Md. Nayan Hossen' : 'নিউজ এডিটর',
      role: getUserRole(targetEmail),
      avatarUrl: DEFAULT_ADMIN.avatarUrl,
    };
    setLocalAdminSession(customAdmin);
    return customAdmin;
  }

  throw new Error('ভুল ইমেইল অথবা পাসওয়ার্ড! (সুপার অ্যাডমিন: hossainmdnayan597@gmail.com / admin123456)');
}

/**
 * Google Sign-In with Firebase Auth
 */
export async function loginWithGoogle(): Promise<AdminUser> {
  const { auth, isLive } = getFirebaseInstance();

  if (isLive && auth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      
      const email = cred.user.email || '';
      const isSuper = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      const admin: AdminUser = {
        uid: cred.user.uid,
        email: email,
        displayName: cred.user.displayName || (isSuper ? 'Md. Nayan Hossen' : 'Google User'),
        role: getUserRole(email),
        avatarUrl: cred.user.photoURL || DEFAULT_ADMIN.avatarUrl,
      };

      setLocalAdminSession(admin);
      return admin;
    } catch (err: any) {
      console.warn('Google popup error, testing fallback if popup was blocked:', err);
      // If popup was blocked or closed by user in sandbox
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        throw new Error('গুগল লগইন পপআপ ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারের পপআপ আনব্লক করুন।');
      }
      throw new Error(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
    }
  }

  // Fallback demo for preview environment
  setLocalAdminSession(DEFAULT_ADMIN);
  return DEFAULT_ADMIN;
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

  const handleUpdate = () => {
    callback(getLocalAdminSession());
  };

  // Listen to local session changes
  if (typeof window !== 'undefined') {
    window.addEventListener('mnh_auth_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
  }

  let fbUnsubscribe: (() => void) | null = null;
  if (isLive && auth) {
    fbUnsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const email = fbUser.email || '';
        const isSuper = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        const admin: AdminUser = {
          uid: fbUser.uid,
          email: email,
          displayName: fbUser.displayName || (isSuper ? 'Md. Nayan Hossen' : 'User'),
          role: getUserRole(email),
          avatarUrl: fbUser.photoURL || DEFAULT_ADMIN.avatarUrl,
        };
        setLocalAdminSession(admin);
        callback(admin);
      } else {
        const local = getLocalAdminSession();
        callback(local);
      }
    });
  } else {
    // Initial emission
    callback(getLocalAdminSession());
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mnh_auth_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    }
    if (fbUnsubscribe) {
      fbUnsubscribe();
    }
  };
}
