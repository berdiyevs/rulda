import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDgaqZvg85uLW5TxUcOWGfXyFgzx6-LI5E',
  authDomain: 'pravaquiz.firebaseapp.com',
  projectId: 'pravaquiz',
  storageBucket: 'pravaquiz.firebasestorage.app',
  messagingSenderId: '840733117812',
  appId: '1:840733117812:web:f0507b70ed517213853021',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
