import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { getFirebaseInstance } from './firebaseConfig';
import { NewsletterSubscriber } from '../types';

const LOCAL_STORAGE_SUBSCRIBERS_KEY = 'mnh_gazipur_subscribers_v1';

// Initial dummy subscribers for realistic preview in admin
const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 'sub-01',
    email: 'hossainmdnayan597@gmail.com',
    subscribedAt: '2026-10-13T10:30:00Z',
    source: 'sidebar_newsletter',
    status: 'active',
  },
  {
    id: 'sub-02',
    email: 'reader.gazipur@gmail.com',
    subscribedAt: '2026-10-12T14:15:00Z',
    source: 'sidebar_newsletter',
    status: 'active',
  },
  {
    id: 'sub-03',
    email: 'tongi.citizen@yahoo.com',
    subscribedAt: '2026-10-11T09:00:00Z',
    source: 'sidebar_newsletter',
    status: 'active',
  }
];

export function getLocalSubscribers(): NewsletterSubscriber[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SUBSCRIBERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local subscribers', e);
  }
  localStorage.setItem(LOCAL_STORAGE_SUBSCRIBERS_KEY, JSON.stringify(INITIAL_SUBSCRIBERS));
  return INITIAL_SUBSCRIBERS;
}

export function saveLocalSubscribers(subscribers: NewsletterSubscriber[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SUBSCRIBERS_KEY, JSON.stringify(subscribers));
    window.dispatchEvent(new CustomEvent('mnh_subscribers_updated', { detail: subscribers }));
  } catch (e) {
    console.error('Error saving local subscribers', e);
  }
}

/**
 * Add a new subscriber email to 'subscribers' collection in Firestore
 */
export async function addNewsletterSubscriber(email: string): Promise<{ success: boolean; message: string; id?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Basic email syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { success: false, message: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।' };
  }

  const { db, isLive } = getFirebaseInstance();

  // If live Firebase is connected
  if (isLive && db) {
    try {
      const subscribersCol = collection(db, 'subscribers');
      
      // Check if already subscribed in Firestore
      const q = query(subscribersCol, where('email', '==', normalizedEmail));
      const existing = await getDocs(q);

      if (!existing.empty) {
        return { success: false, message: 'এই ইমেইলটি ইতিমধ্যে আমাদের নিউজলেটারে নিবন্ধিত রয়েছে!' };
      }

      const docRef = await addDoc(subscribersCol, {
        email: normalizedEmail,
        source: 'sidebar_newsletter',
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // Also update local cache
      const local = getLocalSubscribers();
      const newSub: NewsletterSubscriber = {
        id: docRef.id,
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        source: 'sidebar_newsletter',
        status: 'active',
      };
      saveLocalSubscribers([newSub, ...local]);

      return { success: true, message: 'ধন্যবাদ! আপনার ইমেইল সফলভাবে নিবন্ধিত হয়েছে।', id: docRef.id };
    } catch (err: any) {
      console.warn('Firestore subscription error, saving to local store:', err);
    }
  }

  // Local fallback mode
  const local = getLocalSubscribers();
  const exists = local.some(s => s.email.toLowerCase() === normalizedEmail);

  if (exists) {
    return { success: false, message: 'এই ইমেইলটি ইতিমধ্যে আমাদের নিউজলেটারে নিবন্ধিত রয়েছে!' };
  }

  const newSub: NewsletterSubscriber = {
    id: 'sub-' + Date.now(),
    email: normalizedEmail,
    subscribedAt: new Date().toISOString(),
    source: 'sidebar_newsletter',
    status: 'active',
  };

  saveLocalSubscribers([newSub, ...local]);
  return { success: true, message: 'ধন্যবাদ! আপনার ইমেইল সফলভাবে নিবন্ধিত হয়েছে।', id: newSub.id };
}

/**
 * Subscribe to the subscribers list for real-time updates (Admin viewing)
 */
export function subscribeToSubscribersList(callback: (list: NewsletterSubscriber[]) => void): () => void {
  const { db, isLive } = getFirebaseInstance();

  if (isLive && db) {
    try {
      const subscribersCol = collection(db, 'subscribers');
      const q = query(subscribersCol, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsletterSubscriber[] = snapshot.docs.map(docSnap => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                email: data.email || '',
                subscribedAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
                source: data.source || 'sidebar_newsletter',
                status: data.status || 'active',
              };
            });
            callback(list);
          } else {
            callback(getLocalSubscribers());
          }
        },
        (err) => {
          console.warn('Firestore subscribers onSnapshot failed:', err);
          callback(getLocalSubscribers());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Failed to listen to subscribers:', e);
    }
  }

  // Local listener
  const emit = () => callback(getLocalSubscribers());
  emit();

  const handleUpdate = () => emit();
  window.addEventListener('mnh_subscribers_updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener('mnh_subscribers_updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

/**
 * Delete a subscriber
 */
export async function deleteSubscriber(id: string): Promise<void> {
  const { db, isLive } = getFirebaseInstance();

  if (isLive && db) {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
    } catch (err) {
      console.error('Error deleting subscriber from Firestore', err);
    }
  }

  const local = getLocalSubscribers().filter(s => s.id !== id);
  saveLocalSubscribers(local);
}
