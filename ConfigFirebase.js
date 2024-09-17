import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWJp-Mr4p7yosMvIOcUYdxkWlRpM7OM6M",
  authDomain: "univmap-35435.firebaseapp.com",
  projectId: "univmap-35435",
  storageBucket: "univmap-35435.appspot.com",
  messagingSenderId: "995342345382",
  appId: "1:995342345382:web:ccc255998adbd92e2dc067"
};
  
const app = initializeApp(firebaseConfig);

// Initialisez Firebase Auth avec AsyncStorage pour la persistance
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { db, auth, app };
