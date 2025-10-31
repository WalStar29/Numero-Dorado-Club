// src/firebase/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCQlWah7HWWxuRtmeAexOBfbO4YJn6AO70',
  authDomain: 'numero-dorado-club.firebaseapp.com',
  projectId: 'numero-dorado-club',
  storageBucket: 'numero-dorado-club.firebasestorage.app',
  messagingSenderId: '20638939423',
  appId: '1:20638939423:web:2664516c6b7f93a4cf982a',
  measurementId: 'G-MZ5MJESMY8',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
