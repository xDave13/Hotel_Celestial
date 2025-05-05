// Importación de módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCwHC81T5uFi37lqz3TA_JGNA-_aXXrtgk",
  authDomain: "dave-4f057.firebaseapp.com",
  projectId: "dave-4f057",
  storageBucket: "dave-4f057.firebasestorage.app",
  messagingSenderId: "494701042410",
  appId: "1:494701042410:web:cd4d291727ef7c747f1593",
  measurementId: "G-YQBW95M2MV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//mostrar u ocultar el boton de admin para "clientes"
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    const botonAdmin = document.getElementById("btn-admin");

    if (!botonAdmin) return;

    if (!user) {
      botonAdmin.style.display = "none";
      return;
    }

    const userRef = doc(db, "usuarios", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();

    if (data.rol !== "admin") {
      botonAdmin.style.display = "none";
    } else {
      botonAdmin.style.display = "inline-block";
    }
  });
});


// Proveedores
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Registro de nuevo usuario con correo y contraseña
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre: name,
      email: email,
      uid: cred.user.uid,
      fechaRegistro: new Date(),
      rol: "cliente"
    });

    alert("Usuario registrado correctamente");
    window.location.href = "../html/index.html";
  } catch (error) {
    console.error("Error en registro:", error.message);
    alert("Error al registrar: Usuario ya en uso\n" + error.message);
  }
});

// Login con correo y contraseña
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Sesión iniciada correctamente");

    // Después del login exitoso:
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const userRef = doc(db, "usuarios", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const datos = userSnap.data();
        
        if (datos.rol === "admin") {
          // ✅ Redirigir al panel de administración
          window.location.href = "../html/index.html";
        } else {
          // 🚫 No es administrador
          //alert("Acceso denegado: Esta cuenta no es de administrador.");
          // Puedes redirigir al index o a otra página normal
          window.location.href = "../html/index.html";
        }
      } else {
        alert("Error: El usuario no tiene datos registrados.");
      }
    
  } catch (error) {
    console.error("Error en login:", error.message);
    alert("Error al iniciar sesión: Usuario o contraseña incorrecta\n" + error.message);
  }
});

// Login con Google
document.getElementById('btn-google')?.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Guardar usuario nuevo
      await setDoc(docRef, {
        nombre: user.displayName,
        email: user.email,
        uid: user.uid,
        fechaRegistro: new Date()
      });
    }

    alert("Sesión iniciada con Google: " + user.email);
    window.location.href = "../html/index.html";

  } catch (error) {
    console.error("Error en login con Google:", error.message);
    alert("Error con Google: " + error.message);
  }
});

// Login con GitHub
document.getElementById('btn-github')?.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Guardar usuario nuevo
      await setDoc(docRef, {
        nombre: user.displayName,
        email: user.email,
        uid: user.uid,
        fechaRegistro: new Date()
      });
    }

    alert("Sesión iniciada con GitHub: " + (user.displayName || user.email));
    window.location.href = "../html/index.html";

  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      alert("Este correo ya está registrado con otro método (por ejemplo Google). Inicia sesión con ese método.");
    } else {
      console.error("Error GitHub:", error.message);
      alert("Error al iniciar sesión con GitHub: " + error.message);
    }
  }
});
