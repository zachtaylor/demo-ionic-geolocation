// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore/lite'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBByqTUF8AWZynn9PPGVPt6tsoAy9UFWzU',
  authDomain: 'igbo-8c47e.firebaseapp.com',
  projectId: 'igbo-8c47e',
  storageBucket: 'igbo-8c47e.appspot.com',
  messagingSenderId: '664312728462',
  appId: '1:664312728462:web:46daa6c1071326e1cf72df',
  measurementId: 'G-DGGW7KYDQ5',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const db = getFirestore(app)

export default app
