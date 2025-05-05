// admin.js
import { db, auth } from './firebase.js';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { datosHabitaciones } from "./habitaciones.js";


// Secciones del panel
function ocultarTodasLasSecciones() {
  const secciones = document.querySelectorAll('.seccion-panel');
  secciones.forEach(seccion => seccion.style.display = 'none');
}

// Dashboard
document.getElementById("link-dashboard").addEventListener("click", () => {
  ocultarTodasLasSecciones();
  const panel = document.getElementById("admin-content");
  panel.style.display = "block";
  panel.innerHTML = `
    <h3>Bienvenido al Panel de Administración</h3>
    <p>Selecciona una opción del menú lateral para comenzar.</p>
  `;
});

// Reservas
let idReservaAEliminar = null;
document.getElementById("link-reservas").addEventListener("click", () => {
  ocultarTodasLasSecciones();
  const seccion = document.getElementById("seccion-reservas");
  seccion.style.display = "block";
  seccion.innerHTML = `
  <h2 class="mb-4 text-center">Reservaciones</h2>
    <div class="row mb-3">
      <div class="col-md-4">
        <input type="text" id="filtro-id" class="form-control" placeholder="Buscar por ID de reservación">
      </div>
      <div class="col-md-4">
        <input type="email" id="filtro-correo" class="form-control" placeholder="Filtrar por correo del cliente">
      </div>
      <div class="col-md-3">
        <input type="date" id="filtro-fecha-inicio" class="form-control">
      </div>
      <div class="col-md-3">
        <input type="date" id="filtro-fecha-fin" class="form-control">
      </div>
      <div class="col-md-4">
        <select id="filtro-estado" class="form-select">
          <option value="todas">Todas</option>
          <option value="activa">Activas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>
      <div class="col-md-2">
        <button id="btn-aplicar-filtros" class="btn btn-primary w-100">Filtrar</button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-hover" id="tabla-reservas">
        <thead class="table-dark">
          <tr>
            <th>Identificador</th>
            <th>Cliente</th>
            <th>Correo</th>
            <th>Habitación</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Extras</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  document.getElementById("btn-aplicar-filtros").addEventListener("click", () => {
    const filtros = {
      correo: document.getElementById("filtro-correo").value.trim().toLowerCase(),
      fechaInicio: document.getElementById("filtro-fecha-inicio").value,
      fechaFin: document.getElementById("filtro-fecha-fin").value,
      estado: document.getElementById("filtro-estado").value,
      id: document.getElementById("filtro-id").value.trim().toLowerCase()
    };
    cargarReservaciones(filtros);
  });

  cargarReservaciones();
});

async function cargarReservaciones(filtros = {}) {
  const tabla = document.querySelector("#tabla-reservas tbody");
  if (!tabla) return;
  tabla.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "reservaciones"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const correoDato = data.correoCliente || data.correo || "";
      const estadoDato = data.estado?.toLowerCase() || "activa";
      const idDato = (data.identificador || '').toLowerCase();
      const fechaReserva = new Date(data.fechaEntrada);
      const desde = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
      const hasta = filtros.fechaFin ? new Date(filtros.fechaFin) : null;

      if (filtros.correo && !correoDato.includes(filtros.correo)) return;
      if (filtros.estado && filtros.estado !== "todas" && estadoDato !== filtros.estado) return;
      if (filtros.id && !idDato.includes(filtros.id)) return;
      if ((desde && fechaReserva < desde) || (hasta && fechaReserva > hasta)) return;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${data.identificador || '-'}</td>
        <td>${data.nombre || '-'}</td>
        <td>${data.correo || '-'}</td>
        <td>${data.habitacion || '-'}</td>
        <td>${data.fechaEntrada || '-'}</td>
        <td>${data.fechaSalida || '-'}</td>
        <td>${(data.extras || []).join(", ") || '-'}</td>
        <td>$${data.total || 0}</td>
        <td>${data.estado || 'Activa'}</td>
        <td><button class="btn btn-danger btn-sm cancelar-btn" data-id="${docSnap.id}">Cancelar</button></td>
        `;
      tabla.appendChild(fila);
    });

    document.querySelectorAll(".cancelar-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        idReservaAEliminar = btn.getAttribute("data-id");
        new bootstrap.Modal(document.getElementById("modalConfirmarCancelacion")).show();
      });
    });

    document.getElementById("btn-confirmar-cancelacion").addEventListener("click", async () => {
      if (idReservaAEliminar) {
        await updateDoc(doc(db, "reservaciones", idReservaAEliminar), {
          estado: "Cancelada"
        });
        bootstrap.Modal.getInstance(document.getElementById("modalConfirmarCancelacion")).hide();
        cargarReservaciones(filtros);
      }
    });
  } catch (err) {
    console.error("Error al cargar reservaciones:", err);
  }
}

// Usuarios
async function contarReservasPorUid(uid) {
  const snapshot = await getDocs(collection(db, "reservaciones"));
  return snapshot.docs.filter(res => res.data().usuarioId === uid).length;
}

async function cargarUsuarios() {
  const tbody = document.querySelector("#tabla-usuarios tbody");
  tbody.innerHTML = "";
  const snapshot = await getDocs(collection(db, "usuarios"));

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;
    const numReservas = await contarReservasPorUid(uid);

    const fila = document.createElement("tr");
    fila.innerHTML = `
    <td>${data.nombre}</td>
        <td>${data.email}</td>
        <td>${data.rol || '-'}</td>
        <td>${numReservas}</td>
        <td>
          <button class="btn btn-sm btn-danger btn-eliminar-usuario" data-id="${uid}">Eliminar</button>
        </td>
        `;
    tbody.appendChild(fila);
  }

  document.querySelectorAll(".btn-eliminar-usuario").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Eliminar este usuario?")) {
        await deleteDoc(doc(db, "usuarios", id));
        alert("Usuario eliminado");
        cargarUsuarios();
      }
    });
  });
}

document.getElementById("link-usuarios").addEventListener("click", () => {
  ocultarTodasLasSecciones();
  document.getElementById("seccion-usuarios").style.display = "block";
  cargarUsuarios();
});

document.getElementById("buscar-usuario").addEventListener("input", function () {
  const filtro = this.value.trim().toLowerCase();
  document.querySelectorAll("#tabla-usuarios tbody tr").forEach(fila => {
    fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? "" : "none";
  });
});

// Disponibilidad
const habitacionesDisponibles = {
  estandar: 5,
  deluxe: 4,
  familiar: 3,
  villa: 2,
  presidencial: 1
};

document.getElementById("btn-disponibilidad").addEventListener("click", () => {
  ocultarTodasLasSecciones();
  document.getElementById("disponibilidad").style.display = "block";
  cargarDisponibilidad();
  generarCalendarioOcupacion(14); // se muestra la disponibilidad en los sigueintes 14 dias
});

async function cargarDisponibilidad(fechaInicio = null, fechaFin = null) {
  const snapshot = await getDocs(collection(db, "reservaciones"));
  const reservas = snapshot.docs.map(doc => doc.data());

  const tabla = document.getElementById("tabla-disponibilidad");
  tabla.innerHTML = "";

  // Si no hay rango, usar hoy
  const inicio = fechaInicio ? new Date(fechaInicio).getTime() : new Date().getTime();
  const fin = fechaFin ? new Date(fechaFin).getTime() : inicio + 24 * 60 * 60 * 1000; // +1 día si no hay fin

  Object.keys(habitacionesDisponibles).forEach(tipo => {
    const ocupadas = reservas.filter(r => {
      const tipoHab = (r.habitacionId || r.habitacion || "").toLowerCase();
      const entrada = new Date(r.fechaEntrada).getTime();
      const salida = new Date(r.fechaSalida).getTime();

      const cruce = tipoHab === tipo &&
        r.estado === "activa" &&
        inicio < salida &&
        fin > entrada;

      return cruce;
    }).length;

    const total = habitacionesDisponibles[tipo];
    const disponibles = total - ocupadas;
    const estado = disponibles > 0
      ? `<span class='badge bg-success'>Disponible (${disponibles}/${total})</span>`
      : `<span class='badge bg-danger'>Ocupadas (${total}/${total})</span>`;

    tabla.innerHTML += `
      <tr>
        <td>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</td>
        <td>${estado}</td>
      </tr>`;
  });
}


//buscar la disponibilidad de habitaciones por rango de fecha
const formBuscar = document.getElementById("form-buscar-disponibilidad");

formBuscar.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fechaInicio = document.getElementById("fechaInicio").value;
  const fechaFin = document.getElementById("fechaFin").value;

  if (new Date(fechaInicio) >= new Date(fechaFin)) {
    alert("La fecha de salida debe ser posterior a la de entrada.");
    return;
  }

  const habitacionesOcupadas = new Set();

  const snapshot = await getDocs(collection(db, "reservaciones"));

 
  
  snapshot.forEach((doc) => {
    const res = doc.data();
  
    const entrada = new Date(res.fechaEntrada).getTime();
    const salida = new Date(res.fechaSalida).getTime();
    const seleccionInicio = new Date(fechaInicio).getTime();
    const seleccionFin = new Date(fechaFin).getTime();
  
    // Verificar cruce
    const hayCruce = seleccionInicio < salida && seleccionFin > entrada;
  
    // ✅ Nuevo código para capturar correctamente el tipo de habitación
    const tipo = (res.habitacionId || res.habitacion || "").toLowerCase();
  
    console.log("Evaluando reservación:", {
      habitacion: tipo,
      entrada: res.fechaEntrada,
      salida: res.fechaSalida,
      seleccionInicio: fechaInicio,
      seleccionFin: fechaFin
    });
  
    if (hayCruce && tipo) {
      habitacionesOcupadas.add(tipo);
      console.log(`→ Añadiendo como ocupada: ${tipo}`);
    }
  });
  

  // Mostrar habitaciones disponibles
  cargarDisponibilidad(fechaInicio, fechaFin);

  mostrarHabitacionesDisponibles(habitacionesOcupadas);
});

function mostrarHabitacionesDisponibles(habitacionesOcupadas) {
  const contenedor = document.getElementById("resultado-disponibilidad");
  contenedor.innerHTML = "<h5>Habitaciones disponibles:</h5>";

  let hayDisponibles = false;

  for (const [clave, habitacion] of Object.entries(datosHabitaciones)) {
    if (!habitacionesOcupadas.has(clave)) {
      hayDisponibles = true;
      contenedor.innerHTML += `
        <div class="card my-2 p-3 shadow">
          <h6>${habitacion.nombre}</h6>
          <p>${habitacion.descripcion}</p>
          <strong>Precio: $${habitacion.precio} MXN</strong>
        </div>
      `;
    }
  }

  if (!hayDisponibles) {
    contenedor.innerHTML += `<p class="text-danger">No hay habitaciones disponibles en ese rango.</p>`;
  }
}

async function generarCalendarioOcupacion(dias = 14) {
  const tabla = document.getElementById("tabla-calendario");
  if (!tabla) return;

  // Crear encabezados de días
  const hoy = new Date();
  const fechas = [];
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    fechas.push(fecha.toISOString().split("T")[0]); // formato YYYY-MM-DD
  }

  let html = "<thead><tr><th>Habitación</th>";
  fechas.forEach(f => html += `<th>${f.slice(5)}</th>`);
  html += "</tr></thead><tbody>";

  // Obtener reservaciones
  const snapshot = await getDocs(collection(db, "reservaciones"));
  const reservas = snapshot.docs.map(doc => doc.data());

  // Por cada tipo de habitación
  for (const [clave, habitacion] of Object.entries(datosHabitaciones)) {
    html += `<tr><td><strong>${habitacion.nombre}</strong></td>`;
    fechas.forEach(f => {
      const ocupada = reservas.some(r =>
      (r.habitacionId?.toLowerCase() === clave || r.habitacion?.toLowerCase() === clave) &&
        r.estado === "activa" &&
        f >= r.fechaEntrada &&
        f < r.fechaSalida
      );
      html += `<td class="${ocupada ? 'bg-danger text-white' : 'bg-success text-white'}">
        ${ocupada ? "Ocupado" : "Libre"}</td>`;
    });
    html += "</tr>";
  }

  html += "</tbody>";
  tabla.innerHTML = html;
}


// Cerrar sesión
document.getElementById("link-salir").addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Sesión cerrada");
    window.location.href = "../html/index.html";
  }).catch(console.error);
});