// js/index.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const botonAdmin = document.getElementById("btn-admin");
  if (!botonAdmin) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      botonAdmin.style.display = "none";
      return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (!data || data.rol !== "admin") {
      botonAdmin.style.display = "none";
    } else {
      botonAdmin.style.display = "inline-block";
    }
  });
});
