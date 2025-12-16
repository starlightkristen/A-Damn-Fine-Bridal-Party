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
  lastWriteTimestamps: {}, // Track last write timestamp per dataset for conflict resolution
  isSaving: false, // Global save lock
  saveQueue: [], // Queue for pending saves

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

  // Read metadata document
  async readMeta() {
    try {
      const docRef = doc(db, 'app', 'meta');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  },

  // Write metadata document
  async writeMeta(metaData) {
    try {
      const docRef = doc(db, 'app', 'meta');
      await setDoc(docRef, {
        ...metaData,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log('Metadata saved successfully');
      return true;
    } catch (error) {
      console.error('Error writing metadata:', error);
      return false;
    }
  },

  // Load data from Firestore with version info
  async loadData(datasetName) {
    try {
      const docRef = doc(db, 'datasets', datasetName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const docData = docSnap.data();
        // Store the version and timestamp for conflict resolution
        if (docData.version !== undefined) {
          this.lastWriteTimestamps[datasetName] = {
            updatedAt: docData.updatedAt,
            version: docData.version
          };
        }
        return docData.data;
      } else {
        // Document doesn't exist, return null (will load from JSON files)
        return null;
      }
    } catch (error) {
      console.error(`Error loading ${datasetName}:`, error);
      return null;
    }
  },

  // Save data to Firestore with versioning
  async saveData(datasetName, data) {
    try {
      const docRef = doc(db, 'datasets', datasetName);
      
      // Get current version
      const docSnap = await getDoc(docRef);
      const currentVersion = docSnap.exists() ? (docSnap.data().version || 0) : 0;
      const newVersion = currentVersion + 1;
      const updatedAt = new Date().toISOString();
      
      await setDoc(docRef, {
        data: data,
        updatedAt: updatedAt,
        version: newVersion,
        updatedBy: this.currentUser?.email || 'unknown'
      });
      
      // Update local tracking
      this.lastWriteTimestamps[datasetName] = {
        updatedAt: updatedAt,
        version: newVersion
      };
      
      console.log(`${datasetName} saved successfully (v${newVersion})`);
      
      // Notify UI of successful save
      if (typeof window.notifySaveSuccess === 'function') {
        window.notifySaveSuccess(datasetName);
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving ${datasetName}:`, error);
      
      // Notify UI of failed save
      if (typeof window.notifySaveError === 'function') {
        window.notifySaveError(datasetName, error);
      }
      
      return false;
    }
  },

  // Set up real-time listener for a dataset with conflict protection
  listenToData(datasetName, callback) {
    const docRef = doc(db, 'datasets', datasetName);
    
    // Unsubscribe from previous listener if exists
    if (this.listeners[datasetName]) {
      this.listeners[datasetName]();
    }
    
    // Set up new listener with version checking
    this.listeners[datasetName] = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const incomingData = docSnap.data();
        const incomingVersion = incomingData.version || 0;
        const incomingTimestamp = incomingData.updatedAt;
        
        // Check if we have a more recent local write
        const lastWrite = this.lastWriteTimestamps[datasetName];
        if (lastWrite) {
          // Compare versions - ignore if incoming is older or same
          if (incomingVersion <= lastWrite.version) {
            console.log(`Ignoring stale update for ${datasetName} (incoming v${incomingVersion} <= local v${lastWrite.version})`);
            return;
          }
          
          // Also check timestamps as a fallback
          if (incomingTimestamp && lastWrite.updatedAt) {
            const incomingTime = new Date(incomingTimestamp).getTime();
            const lastWriteTime = new Date(lastWrite.updatedAt).getTime();
            
            if (incomingTime < lastWriteTime) {
              console.log(`Ignoring older update for ${datasetName} based on timestamp`);
              return;
            }
          }
        }
        
        // Update local tracking
        this.lastWriteTimestamps[datasetName] = {
          updatedAt: incomingTimestamp,
          version: incomingVersion
        };
        
        console.log(`Applying Firestore update for ${datasetName} (v${incomingVersion})`);
        callback(incomingData.data);
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
