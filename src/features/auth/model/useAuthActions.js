import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { notifications } from '@mantine/notifications'
import { auth, googleProvider, db } from '../../../shared/api/firebase'
import { ROUTES } from '../../../shared/config/routes'

export function useAuthActions() {
  const navigate = useNavigate()

  const signUpWithEmail = async ({ name, email, password }) => {
    if (!email || !password || !name) {
      notifications.show({
        color: 'danger',
        title: "To'ldirilmagan maydonlar",
        message: "Iltimos, ism, email va parolni to'ldiring!",
      })
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

      notifications.show({
        color: 'success',
        title: "Ro'yxatdan o'tdingiz",
        message: 'Tasdiqlash xati yuborildi. Iltimos, pochtangizni tekshiring.',
      })
      await signOut(auth)
    } catch (error) {
      notifications.show({
        color: 'danger',
        title: "Ro'yxatdan o'tishda xatolik",
        message: error.message,
      })
    }
  }

  const loginWithEmail = async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user.emailVerified) {
        navigate(ROUTES.CATEGORIES)
      } else {
        notifications.show({
          color: 'warning',
          title: 'Email tasdiqlanmagan',
          message: 'Avval emailingizni tasdiqlang! Link yuborilgan.',
        })
        await signOut(auth)
      }
    } catch (error) {
      notifications.show({
        color: 'danger',
        title: 'Kirishda xatolik',
        message: "Email yoki parol noto'g'ri!",
      })
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
