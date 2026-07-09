import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC-C9aXwJMKxxjvf-DCkdsjADZtToZh7yQ',
  authDomain: 'jangora-ad394.firebaseapp.com',
  projectId: 'jangora-ad394',
  storageBucket: 'jangora-ad394.firebasestorage.app',
  messagingSenderId: '846797730055',
  appId: '1:846797730055:web:f70326250ea6261a7d55a2',
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
