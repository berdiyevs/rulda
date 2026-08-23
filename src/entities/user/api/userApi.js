import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../../shared/api/firebase'

export async function updateExamDate(uid, examDate) {
  await setDoc(doc(db, 'users', uid), { examDate }, { merge: true })
}
