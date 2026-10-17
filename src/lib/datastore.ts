import { doc, getDoc, setDoc, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { app } from './firebase';
const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
import type { LessonProgress } from '../types/progress';
export interface DataStore {
  getLesson(uid: string, lessonId: string): Promise<LessonProgress | null>;
  saveLesson(uid: string, lessonId: string, progress: LessonProgress): Promise<void>;
}
// Components depend on this interface so the remote backend can be replaced later.
export const dataStore: DataStore = {
  async getLesson(uid, lessonId) { const snapshot = await getDoc(doc(db, 'users', uid, 'lessons', lessonId)); return snapshot.exists() ? snapshot.data() as LessonProgress : null; },
  async saveLesson(uid, lessonId, progress) { await setDoc(doc(db, 'users', uid, 'lessons', lessonId), progress); },
};
