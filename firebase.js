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
  // Utilise le PIN comme identifiant unique pour séparer les utilisateurs
  const pin = localStorage.getItem('granddex-pin');
  if (pin) return `user_${pin}`;
  
  // Fallback pour compatibilité
  let id = localStorage.getItem('granddex-device-id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2));
    localStorage.setItem('granddex-device-id', id);
  }
  return id;
}

let signingInPromise = null;
async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  if (!signingInPromise) {
    signingInPromise = signInAnonymously(auth)
      .then((cred) => cred.user)
      .catch((err) => {
        signingInPromise = null;
        throw err;
      });
  }
  return signingInPromise;
}

async function saveCloud(deviceId, data) {
  await ensureSignedIn();
  // Utilise le deviceId (basé sur le PIN) comme identifiant de document
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

function subscribeCloud(deviceId, onData) {
  // S'assure d'être connecté avant de s'abonner, et renvoie un unsubscribe sûr
  let unsubscribe = null;
  ensureSignedIn()
    .then(() => {
      unsubscribe = onSnapshot(doc(db, 'granddex', deviceId), (snap) => {
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
      }, (err) => {
        console.warn('Abonnement Firestore refusé:', err?.message || err);
      });
    })
    .catch((err) => {
      console.warn('Connexion anonyme impossible pour le temps réel:', err?.message || err);
    });

  return function safeUnsubscribe() {
    try { unsubscribe && unsubscribe(); } catch (_) {}
    unsubscribe = null;
  };
}

// Expose au scope global (pour scripts non-modules)
window.firebaseCloud = {
  getDeviceId,
  saveCloud,
  loadCloud,
  subscribeCloud,
};
