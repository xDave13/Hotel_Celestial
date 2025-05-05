import { auth, db } from "./firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const user = auth.currentUser;

function generarIDUnico() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`.toUpperCase();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reserva");
  const selectExtras = document.getElementById("usar-extras");
  const contenedorExtras = document.getElementById("opciones-extras");
  const personasExtras = document.getElementById("seleccion-personas-extras");
  const campoPersonasExtra = document.getElementById("campo-personas-extras");
  const inputPersonasExtra = document.getElementById("input-personas-extras");
  const tipoHabitacion = document.getElementById("tipo-habitacion");
  const imagen = document.getElementById("imagen-habitacion");
  const nombre = document.getElementById("nombre-habitacion");
  const descripcion = document.getElementById("descripcion-habitacion");
  const precio = document.getElementById("precio-habitacion");

  const datosHabitaciones = {
    estandar: {
      nombre: "Habitación Estándar",
      descripcion: "Cómoda habitación con cama matrimonial, baño privado y aire acondicionado.",
      precio: 700,
      imagen: "../img/habitaciones/hEstandar/1.png",
      imagenes: [
        "../img/habitaciones/hEstandar/1.png",
        "../img/habitaciones/hEstandar/2.png",
        "../img/habitaciones/hEstandar/3.png",
        "../img/habitaciones/hEstandar/4.png",
        "../img/habitaciones/hEstandar/5.png"
      ]
    },
    deluxe: {
      nombre: "Habitación Deluxe",
      descripcion: "Espacio amplio con cama king size, minibar y balcón privado.",
      precio: 950,
      imagen: "../img/habitaciones/hDeluxe/1.png",
      imagenes: [
        "../img/habitaciones/hDeluxe/1.png",
        "../img/habitaciones/hDeluxe/2.png",
        "../img/habitaciones/hDeluxe/3.png",
        "../img/habitaciones/hDeluxe/4.png", 
        "../img/habitaciones/hDeluxe/5.png"
      ]
    },
    familiar: {
      nombre: "Habitación Familiar",
      descripcion: "Ideal para familias, con dos camas dobles, área de estar y baño completo.",
      precio: 1200,
      imagen: "../img/habitaciones/hSuiteFam/1.png",
      imagenes: [
        "../img/habitaciones/hSuiteFam/1.png",
        "../img/habitaciones/hSuiteFam/2.png",
        "../img/habitaciones/hSuiteFam/3.png",
        "../img/habitaciones/hSuiteFam/4.png",
        "../img/habitaciones/hSuiteFam/5.png"
      ]
    },
    villa: {
      nombre: "Villa",
      descripcion: "Experiencia privada con sala, cocina, terraza y jacuzzi.",
      precio: 1800,
      imagen: "../img/habitaciones/hVilla/1.png",
      imagenes: [
        "../img/habitaciones/hVilla/1.png",
        "../img/habitaciones/hVilla/2.png",
        "../img/habitaciones/hVilla/3.png",
        "../img/habitaciones/hVilla/4.png",
        "../img/habitaciones/hVilla/5.png"
      ]
    },
    presidencial: {
      nombre: "Suite Presidencial",
      descripcion: "Lujo total con vista panorámica, jacuzzi, sala ejecutiva y comedor privado.",
      precio: 2500,
      imagen: "../img/habitaciones/hPresidencial/1.png",
      imagenes: [
        "../img/habitaciones/hPresidencial/1.png",
        "../img/habitaciones/hPresidencial/2.png",
        "../img/habitaciones/hPresidencial/3.png",
        "../img/habitaciones/hPresidencial/4.png",
        "../img/habitaciones/hPresidencial/5.png"
      ]
    }
  };

  // Autopreselección de habitación desde la URL (si existe)
  const params = new URLSearchParams(window.location.search);
  const tipoPreseleccionado = params.get("tipo");
  if (tipoPreseleccionado && datosHabitaciones[tipoPreseleccionado]) {
    tipoHabitacion.value = tipoPreseleccionado;
    tipoHabitacion.dispatchEvent(new Event("change"));
  }

  if (tipoHabitacion) {
    tipoHabitacion.addEventListener("change", () => {
      const seleccion = tipoHabitacion.value;
      const datos = datosHabitaciones[seleccion];

      if (datos) {
        imagen.src = datos.imagen;
        nombre.textContent = datos.nombre;
        descripcion.textContent = datos.descripcion;
        precio.textContent = `$${datos.precio} MXN por noche`;
        imagen.style.display = "block";
      } else {
        imagen.src = "";
        nombre.textContent = "Cargando...";
        descripcion.textContent = "";
        precio.textContent = "";
      }
    });
  }

  if (selectExtras) {
    selectExtras.addEventListener("change", () => {
      contenedorExtras.style.display = (selectExtras.value === "si") ? "block" : "none";
      if (selectExtras.value === "no") {
        contenedorExtras.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
      }
    });
  }

  if (personasExtras) {
    personasExtras.addEventListener("change", () => {
      if (personasExtras.value === "si") {
        campoPersonasExtra.style.display = "block";
        inputPersonasExtra.required = true;
      } else {
        campoPersonasExtra.style.display = "none";
        inputPersonasExtra.value = "";
        inputPersonasExtra.required = false;
      }
    });
  }

  document.querySelectorAll(".ver-fotos-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tipo = btn.getAttribute("data-habitacion");
      const data = datosHabitaciones[tipo];

      if (data) {
        document.getElementById("titulo-modal-habitacion").textContent = data.nombre;
        document.getElementById("descripcion-modal-habitacion").textContent = data.descripcion;

        const galeria = document.getElementById("galeria-modal");
        galeria.innerHTML = "";
        data.imagenes.forEach(src => {
          const img = document.createElement("img");
          img.src = src;
          img.alt = tipo;
          img.className = "img-thumbnail";
          img.style.maxWidth = "200px";
          galeria.appendChild(img);
        });

        const btnReservar = document.getElementById("btn-modal-reservar");
        btnReservar.setAttribute("href", "#reservar");
        btnReservar.addEventListener("click", () => {
          // Preseleccionar habitación si se puede
          if (tipoHabitacion && tipo) {
            tipoHabitacion.value = tipo;
            tipoHabitacion.dispatchEvent(new Event("change"));
          }

           // Cierra el modal después de hacer clic
          const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalHabitacion"));
          if (modalInstance) modalInstance.hide();
        });


        const modal = new bootstrap.Modal(document.getElementById("modalHabitacion"));
        modal.show();
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const habitacion = tipoHabitacion.value;
    const fechaEntrada = document.getElementById("fecha-entrada").value;
    const fechaSalida = document.getElementById("fecha-salida").value;
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const numeroPersonasExtra = parseInt(inputPersonasExtra.value || "0");

    const extrasSeleccionados = Array.from(
      document.querySelectorAll('#opciones-extras input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    const noches = Math.ceil((new Date(fechaSalida) - new Date(fechaEntrada)) / (1000 * 60 * 60 * 24));
    const preciosBase = { estandar: 650, deluxe: 900, familiar: 1000, villa: 1200, presidencial: 1500 };
    const extrasPrecios = { desayuno: 100, spa: 150, gimnasio: 90, traslado: 200 };

    const precioNoche = preciosBase[habitacion] || 0;
    const costoBase = precioNoche * noches;
    const costoExtras = extrasSeleccionados.reduce((acc, e) => acc + (extrasPrecios[e] || 0), 0) * (1 + numeroPersonasExtra);
    const costoPersonasExtra = numeroPersonasExtra * 200;
    const total = costoBase + costoExtras + costoPersonasExtra;

    onAuthStateChanged(auth, (user) => {
      const uid = user ? user.uid : null;

      window.datosReservaPendiente = {
        uid,
        habitacion,
        fechaEntrada,
        fechaSalida,
        noches,
        personasExtras: numeroPersonasExtra,
        nombre,
        correo,
        telefono,
        extras: extrasSeleccionados,
        total
      };
    });

    const resumenHTML = `
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Correo:</strong> ${correo}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <p><strong>Habitación:</strong> ${habitacion}</p>
      <p><strong>Fechas:</strong> ${fechaEntrada} a ${fechaSalida}</p>
      <p><strong>Noches:</strong> ${noches}</p>
      <p><strong>Extras:</strong> ${extrasSeleccionados.join(", ") || "Ninguno"}</p>
      <p><strong>Personas extra:</strong> ${numeroPersonasExtra}</p>
      <p><strong>Total:</strong> $${total}</p>
    `;
    document.getElementById("resumen-contenido").innerHTML = resumenHTML;

    const modal = new bootstrap.Modal(document.getElementById("resumenReservaModal"));
    modal.show();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fecha-entrada").addEventListener("change", verificarFechas);
    document.getElementById("fecha-salida").addEventListener("change", verificarFechas);
  
    function verificarFechas() {
      const entrada = document.getElementById("fecha-entrada").value;
      const salida = document.getElementById("fecha-salida").value;
  
      if (entrada && salida && entrada < salida) {
        actualizarOpcionesDeHabitacion(entrada, salida);
      }
    }
  
    async function actualizarOpcionesDeHabitacion(fechaInicio, fechaFin) {
      const snapshot = await getDocs(collection(db, "reservaciones"));
      const habitacionesOcupadas = new Set();
  
      const inicio = new Date(fechaInicio).getTime();
      const fin = new Date(fechaFin).getTime();
  
      snapshot.forEach(doc => {
        const res = doc.data();
        const tipo = (res.habitacion || "").toLowerCase();
        const entrada = new Date(res.fechaEntrada).getTime();
        const salida = new Date(res.fechaSalida).getTime();
  
        const hayCruce = inicio < salida && fin > entrada;
        if (res.estado === "activa" && hayCruce) {
          habitacionesOcupadas.add(tipo);
        }
      });

      console.log("Habitaciones ocupadas:", [...habitacionesOcupadas]);
  
      const select = document.getElementById("tipo-habitacion");
      if (!select) return; // prevención por si el select no está en esta página
  
      [...select.options].forEach(opt => {
        const clave = opt.value.toLowerCase();
        if (habitacionesOcupadas.has(clave)) {
          opt.disabled = true;
          opt.textContent = opt.textContent.replace(" (No disponible)", "") + " (No disponible)";
        } else {
          opt.disabled = false;
          opt.textContent = opt.textContent.replace(" (No disponible)", "");
        }
      });


    }
  });
  
  

  document.getElementById("confirmarReservaBtn").addEventListener("click", async () => {
    const datos = window.datosReservaPendiente;
    if (!datos) return;

    try {
      const idUnico = generarIDUnico();
      datos.identificador = idUnico;

      await addDoc(collection(db, "reservaciones"), {
        ...window.datosReservaPendiente,
        usuarioId: window.datosReservaPendiente.uid,
        estado: "activa",
        fechaCreacion: new Date(),
        identificador: idUnico
      });

      // Enviar correo      

      await emailjs.send("service_axrfmoi", "template_4e9nx29", {
        message: `
          ¡Gracias por reservar en Celestial Dreams!
          Tu código de reservación es: ${idUnico}
          Guárdalo para futuras consultas o cancelaciones.`,
        codigo_reserva: datos.identificador,
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono,
        habitacion: datos.habitacion,
        fechaEntrada: datos.fechaEntrada,
        fechaSalida: datos.fechaSalida,
        noches: datos.noches,
        personasExtras: datos.personasExtras,
        extras: datos.extras.join(", ") || "Ninguno",
        total: `$${datos.total}`
      });
      

      alert("✅ Reservación confirmada y registrada.");
      form.reset();
    } catch (error) {
      console.error("❌ Error al guardar en Firestore:", error);
      alert("Ocurrió un error al guardar la reservación.");
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById("resumenReservaModal"));
    modal.hide();
    window.datosReservaPendiente = null;
  });
});

