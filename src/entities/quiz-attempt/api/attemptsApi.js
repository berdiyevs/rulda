import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../shared/api/firebase'

export async function saveAttempt(uid, attempt) {
  const ref = collection(db, 'users', uid, 'attempts')
  await addDoc(ref, {
    ...attempt,
    createdAt: serverTimestamp(),
  })
}

export async function fetchLatestAttempt(uid, topic) {
  const ref = collection(db, 'users', uid, 'attempts')
  const q = query(ref, where('topic', '==', topic))
  const snap = await getDocs(q)
  if (snap.empty) return null

  const docs = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))

  return docs[0]
}

export async function fetchAllLatestAttempts(uid, topics) {
  const results = await Promise.all(topics.map((topic) => fetchLatestAttempt(uid, topic)))
  return Object.fromEntries(topics.map((topic, i) => [topic, results[i]]))
}

export async function fetchAllAttempts(uid) {
  const ref = collection(db, 'users', uid, 'attempts')
  const snap = await getDocs(ref)

  return snap.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? null,
      }
    })
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
}
