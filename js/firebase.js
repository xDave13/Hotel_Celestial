// js/firebase.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCwHC81T5uFi37lqz3TA_JGNA-_aXXrtgk",
  authDomain: "dave-4f057.firebaseapp.com",
  projectId: "dave-4f057",
  storageBucket: "dave-4f057.appspot.com",
  messagingSenderId: "494701042410",
  appId: "1:494701042410:web:cd4d291727ef7c747f1593"
};

// Verificar si ya hay una instancia creada
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Inicializar Firestore y Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar para usar en otros scripts
export { app, db, auth };
