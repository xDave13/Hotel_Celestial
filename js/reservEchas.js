import { app } from "./firebase.js";
import { auth } from "./firebase.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const db = getFirestore(app);


onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
  
      try {
        const q = query(
          collection(db, "reservaciones"), // ✅ debe decir reservaciones
          where("uid", "==", uid),
          orderBy("fechaCreacion", "desc")
        );
        
        const snapshot = await getDocs(q);
        const tbody = document.getElementById("contenido-reservaciones");
        tbody.innerHTML = ""; // Limpiar tabla antes de llenar
  
        if (snapshot.empty) {
          // 🟡 Mostrar mensaje si no hay reservaciones
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td colspan="7" class="text-center text-muted">
              No tienes reservaciones registradas aún.
            </td>
          `;
          tbody.appendChild(fila);
          return;
        }
  
        // 🟢 Si hay reservaciones, se muestran normalmente
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const id = docSnap.id;
  
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${data.identificador}</td>
            <td>${data.nombre}</td>
            <td>${data.habitacion}</td>
            <td>${data.fechaEntrada}</td>
            <td>${data.fechaSalida}</td>
            <td>${data.noches || "-"}</td>
            <td>$${data.total}</td>
            <td>${data.estado || "activa"}</td>
            <td>
              ${data.estado === "activa"
                ? `<button class="btn btn-danger btn-sm" onclick="cancelarReservacion('${id}', ${data.total})">Cancelar</button>`
                : `<span class="text-muted">No disponible</span>`}
            </td>
          `;
          tbody.appendChild(fila);
        });
      } catch (error) {
        console.error("❌ Error al obtener reservaciones:", error);
      }
    } else {
      console.log("🔒 Usuario no autenticado, no se puede mostrar historial");
    }
  });
  

  window.cancelarReservacion = async function(id, totalOriginal) {
    const confirmar = confirm("¿Estás seguro de cancelar esta reservación? Se aplicará una comisión del 10%.");
    if (!confirmar) return;
  
    const penalizacion = totalOriginal * 0.1;
    const nuevoTotal = totalOriginal - penalizacion;
  
    try {
      const docRef = doc(db, "reservaciones", id);
      await updateDoc(docRef, {
        estado: "cancelada",
        total: nuevoTotal,
        fechaCancelacion: new Date()
      });
  
      alert(`✅ Reservación cancelada. Total reembolsado: $${nuevoTotal}`);
      location.reload();
    } catch (error) {
      console.error("❌ Error al cancelar:", error);
      alert("Error al cancelar la reservación.");
    }
  }
  
