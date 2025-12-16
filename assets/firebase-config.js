// Firebase Configuration and Integration Module
// This module handles Firebase initialization, authentication, and Firestore operations

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  enableIndexedDbPersistence 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPgOFesGt3LWN26D_OyzFMMLkDB7dAbj4",
  authDomain: "bridal-party-planner.firebaseapp.com",
  projectId: "bridal-party-planner",
  storageBucket: "bridal-party-planner.firebasestorage.app",
  messagingSenderId: "583661723414",
  appId: "1:583661723414:web:b26114fc100ab526f6fa37",
  measurementId: "G-8ZMK1VR3VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence only enabled in one tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support persistence.');
  }
});

// Firebase manager object
const FirebaseManager = {
  auth,
  db,
  currentUser: null,
  listeners: {},

  // Initialize authentication state checking
  init() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUser = user;
          console.log('User authenticated:', user.email);
          resolve(user);
        } else {
          // Not logged in, redirect to login page
          if (!window.location.pathname.includes('login.html')) {
            window.location.href = './login.html';
          }
          reject(new Error('Not authenticated'));
        }
      });
    });
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      window.location.href = './login.html';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  // Load data from Firestore
  async loadData(datasetName) {
    try {
      const docRef = doc(db, 'datasets', datasetName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().data;
      } else {
        // Document doesn't exist, return null (will load from JSON files)
        return null;
      }
    } catch (error) {
      console.error(`Error loading ${datasetName}:`, error);
      return null;
    }
  },

  // Save data to Firestore
  async saveData(datasetName, data) {
    try {
      const docRef = doc(db, 'datasets', datasetName);
      await setDoc(docRef, {
        data: data,
        updatedAt: new Date().toISOString(),
        updatedBy: this.currentUser?.email || 'unknown'
      });
      console.log(`${datasetName} saved successfully`);
      return true;
    } catch (error) {
      console.error(`Error saving ${datasetName}:`, error);
      return false;
    }
  },

  // Set up real-time listener for a dataset
  listenToData(datasetName, callback) {
    const docRef = doc(db, 'datasets', datasetName);
    
    // Unsubscribe from previous listener if exists
    if (this.listeners[datasetName]) {
      this.listeners[datasetName]();
    }
    
    // Set up new listener
    this.listeners[datasetName] = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().data);
      }
    }, (error) => {
      console.error(`Error listening to ${datasetName}:`, error);
    });
  },

  // Clean up all listeners
  cleanupListeners() {
    Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
    this.listeners = {};
  }
};

export default FirebaseManager;
