import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../../../shared/api/firebase'
import { ROUTES } from '../../../shared/config/routes'

export function useAuthActions() {
  const navigate = useNavigate()

  const signUpWithEmail = async ({ name, email, password }) => {
    if (!email || !password || !name) {
      alert("Iltimos, ism, email va parolni to'ldiring!")
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await sendEmailVerification(user)

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email,
        isVerified: false,
        createdAt: serverTimestamp(),
      })

      alert("Ro'yxatdan o'tdingiz! Tasdiqlash xati yuborildi. Iltimos, pochtangizni tekshiring.")
      await signOut(auth)
    } catch (error) {
      alert('SignUp xatosi: ' + error.message)
    }
  }

  const loginWithEmail = async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user.emailVerified) {
        navigate(ROUTES.CATEGORIES)
      } else {
        alert('Avval emailingizni tasdiqlang! Link yuborilgan.')
        await signOut(auth)
      }
    } catch (error) {
      alert("Email yoki parol noto'g'ri!")
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      )

      navigate(ROUTES.CATEGORIES)
    } catch (error) {
      console.error('Google xatosi:', error)
    }
  }

  return { signUpWithEmail, loginWithEmail, loginWithGoogle }
}
