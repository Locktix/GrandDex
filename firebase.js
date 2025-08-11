// firebase.js (module ES)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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
  // Pour compat: renvoie l'UID Firebase si disponible; sinon un ID local provisoire
  const user = auth.currentUser;
  if (user?.uid) return user.uid;
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
  // Forcer l'utilisation de l'UID comme identifiant de document (aligné avec les règles)
  const uid = auth.currentUser.uid;
  const ref = doc(db, 'granddex', uid);
  await setDoc(ref, { data, updatedAt: serverTimestamp() }, { merge: true });
}

async function loadCloud(deviceId) {
  await ensureSignedIn();
  const uid = auth.currentUser.uid;
  const ref = doc(db, 'granddex', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().data || null;
  }
  return null;
}

function subscribeCloud(deviceId, onData) {
  // Renvoie une fonction d'unsubscribe
  const uid = auth.currentUser?.uid || deviceId;
  return onSnapshot(doc(db, 'granddex', uid), (snap) => {
    try {
      if (snap.exists()) {
        const payload = snap.data();
        onData && onData(payload?.data ?? null);
      } else {
        onData && onData(null);
      }
    } catch (e) {
      console.warn('Erreur onSnapshot:', e);
    }
  });
}

// Expose au scope global (pour scripts non-modules)
window.firebaseCloud = {
  getDeviceId,
  saveCloud,
  loadCloud,
  subscribeCloud,
};
