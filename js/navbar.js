import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const loginNav = document.getElementById("nav-login");
const usuarioNav = document.getElementById("nav-usuario");
const userName = document.getElementById("user-name");
const cerrarSesionBtn = document.getElementById("cerrar-sesion");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginNav.style.display = "none";
    usuarioNav.style.display = "inline-block";
    userName.textContent = user.displayName || user.email;
  } else {
    loginNav.style.display = "inline-block";
    usuarioNav.style.display = "none";
  }
});

if (cerrarSesionBtn) {
  cerrarSesionBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      alert("👋 Sesión cerrada correctamente");
      window.location.reload();
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  });
}
