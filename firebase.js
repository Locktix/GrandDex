// firebase.js (module ES)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcZSh0tDuP3dQya_atwjNM8q2lNTOGFbU",
  authDomain: "granddex-124cc.firebaseapp.com",
  projectId: "granddex-124cc",
  storageBucket: "granddex-124cc.firebasestorage.app",
  messagingSenderId: "824912868781",
  appId: "1:824912868781:web:480e04cb72e995ee509d24",
  measurementId: "G-ZG4Z5Q36XN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function getDeviceId() {
  let id = localStorage.getItem('granddex-device-id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2));
    localStorage.setItem('granddex-device-id', id);
  }
  return id;
}

async function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await signInAnonymously(auth);
        }
        resolve(auth.currentUser);
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function saveCloud(deviceId, data) {
  await ensureSignedIn();
  const ref = doc(db, 'granddex', deviceId);
  await setDoc(ref, { data, updatedAt: serverTimestamp() }, { merge: true });
}

async function loadCloud(deviceId) {
  await ensureSignedIn();
  const ref = doc(db, 'granddex', deviceId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().data || null;
  }
  return null;
}

// Expose au scope global (pour scripts non-modules)
window.firebaseCloud = {
  getDeviceId,
  saveCloud,
  loadCloud,
};
