import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // Your Firebase config object
}

export const getFirebaseApp = async () => {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  
  return { app, auth, db }
}