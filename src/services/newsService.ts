import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { getFirebaseInstance } from './firebaseConfig';
import { NewsArticle } from '../types';
import { INITIAL_NEWS_ARTICLES } from '../data/initialNews';

const LOCAL_STORAGE_ARTICLES_KEY = 'mnh_gazipur_articles_v1';

// Seed or retrieve local cache
export function getLocalArticles(): NewsArticle[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local news cache', e);
  }
  // Initialize with authentic Gazipur news
  localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(INITIAL_NEWS_ARTICLES));
  return INITIAL_NEWS_ARTICLES;
}

export function saveLocalArticles(articles: NewsArticle[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(articles));
    window.dispatchEvent(new CustomEvent('mnh_articles_updated', { detail: articles }));
  } catch (e) {
    console.error('Error saving local news articles', e);
  }
}

/**
 * Subscribe to news articles:
 * If Firebase is live & configured, uses Firestore onSnapshot on collection 'news_articles'.
 * Otherwise, uses localStorage with custom event synchronization.
 */
export function subscribeToArticles(callback: (articles: NewsArticle[]) => void): () => void {
  const { db, isLive } = getFirebaseInstance();

  const handleLocalUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      callback(e.detail);
    } else {
      callback(getLocalArticles());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('mnh_articles_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  let firestoreUnsubscribe: (() => void) | null = null;

  if (isLive && db) {
    try {
      const newsCollection = collection(db, 'news_articles');
      const q = query(newsCollection, orderBy('createdAt', 'desc'));

      firestoreUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const articles: NewsArticle[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                title: data.title || '',
                category: data.category || 'গাজীপুর সদর',
                subCategory: data.subCategory || '',
                reporter: data.reporter || 'স্টাফ রিপোর্টার',
                imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80',
                summary: data.summary || '',
                content: data.content || '',
                isFeatured: Boolean(data.isFeatured),
                isBreaking: Boolean(data.isBreaking),
                views: Number(data.views || 0),
                createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
                tags: Array.isArray(data.tags) ? data.tags : [],
                readingTimeMinutes: data.readingTimeMinutes || Math.max(1, Math.ceil((data.content || '').split(' ').length / 180)),
              };
            });
            // Update local cache with remote documents
            saveLocalArticles(articles);
            callback(articles);
          } else {
            // Firestore is empty; fallback to local articles for preview
            const local = getLocalArticles();
            callback(local);
          }
        },
        (error) => {
          console.warn('Firestore subscription error, switching to local store:', error);
          callback(getLocalArticles());
        }
      );
    } catch (err) {
      console.warn('Failed to start Firestore listener:', err);
    }
  } else {
    callback(getLocalArticles());
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mnh_articles_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }
  };
}

/**
 * Create a new article
 */
export async function createArticle(articleData: Omit<NewsArticle, 'id' | 'views'>): Promise<string> {
  const { db, isLive } = getFirebaseInstance();

  if (isLive && db) {
    try {
      const docRef = await addDoc(collection(db, 'news_articles'), {
        ...articleData,
        views: 0,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Firestore create error, saving locally:', err);
    }
  }

  // Local Store
  const localArticles = getLocalArticles();
  const newArticle: NewsArticle = {
    ...articleData,
    id: 'news-' + Date.now(),
    views: 0,
    createdAt: new Date().toISOString(),
  };
  const updated = [newArticle, ...localArticles];
  saveLocalArticles(updated);
  return newArticle.id;
}

/**
 * Update existing article
 */
export async function updateArticle(id: string, updates: Partial<NewsArticle>): Promise<void> {
  const { db, isLive } = getFirebaseInstance();

  if (isLive && db) {
    try {
      const docRef = doc(db, 'news_articles', id);
      await updateDoc(docRef, {
        ...updates,
      });
      return;
    } catch (err) {
      console.error('Firestore update error, updating locally:', err);
    }
  }

  // Local Store
  const localArticles = getLocalArticles();
  const updated = localArticles.map(a => a.id === id ? { ...a, ...updates } : a);
  saveLocalArticles(updated);
}

/**
 * Delete an article
 */
export async function deleteArticle(id: string): Promise<void> {
  const { db, isLive } = getFirebaseInstance();

  if (isLive && db) {
    try {
      const docRef = doc(db, 'news_articles', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore delete note (updating local store as well):', err);
    }
  }

  // Always update local cache and dispatch reactive event
  const localArticles = getLocalArticles();
  const updated = localArticles.filter(a => a.id !== id);
  saveLocalArticles(updated);
}

/**
 * Increment views
 */
export async function incrementArticleViews(id: string): Promise<void> {
  const { db, isLive } = getFirebaseInstance();

  if (isLive && db) {
    try {
      const docRef = doc(db, 'news_articles', id);
      await updateDoc(docRef, {
        views: increment(1)
      });
      return;
    } catch (err) {
      // Fallback
    }
  }

  // Local Store
  const localArticles = getLocalArticles();
  const updated = localArticles.map(a => a.id === id ? { ...a, views: (a.views || 0) + 1 } : a);
  saveLocalArticles(updated);
}

/**
 * Reset local news to authentic initial sample data
 */
export function resetToInitialArticles() {
  saveLocalArticles(INITIAL_NEWS_ARTICLES);
}
