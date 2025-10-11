// src/firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyADvt9LfbroSoQR7QBgB10nim29F5UI5Jc',
  authDomain: 'numerodarado.firebaseapp.com',
  projectId: 'numerodarado',
  storageBucket: 'numerodarado.firebasestorage.app',
  messagingSenderId: '446510724979',
  appId: '1:446510724979:web:6155ee0e3b318da9717706',
  measurementId: 'G-3FXXBYEJ3P',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
