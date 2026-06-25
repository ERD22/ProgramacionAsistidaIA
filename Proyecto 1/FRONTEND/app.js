const API_URL = '/api/eventos';
const AUTH_URL = '/api/auth';

let eventos = [];
let usuarioActual = null;
let mapa = null;
let marcador = null;

// Cargar eventos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
});

// Verificar si hay sesión activa
function verificarSesion() {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    usuarioActual = JSON.parse(usuario);
    mostrarAgenda();
    cargarEventos();
  } else {
    mostrarAuth();
  }
}

// Mostrar sección de autenticación
function mostrarAuth() {
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('agendaSection').classList.add('hidden');
}

// Mostrar sección de agenda
function mostrarAgenda() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('agendaSection').classList.remove('hidden');
}

// Mostrar formulario de login
function showLogin() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginTab').classList.remove('bg-gray-300', 'text-gray-700');
  document.getElementById('loginTab').classList.add('bg-blue-500', 'text-white');
  document.getElementById('registerTab').classList.remove('bg-green-500', 'text-white');
  document.getElementById('registerTab').classList.add('bg-gray-300', 'text-gray-700');
}

// Mostrar formulario de registro
function showRegister() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginTab').classList.remove('bg-blue-500', 'text-white');
  document.getElementById('loginTab').classList.add('bg-gray-300', 'text-gray-700');
  document.getElementById('registerTab').classList.remove('bg-gray-300', 'text-gray-700');
  document.getElementById('registerTab').classList.add('bg-green-500', 'text-white');
}

// Manejar login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      usuarioActual = data.usuario;
      localStorage.setItem('usuario', JSON.stringify(usuarioActual));
      mostrarAgenda();
      cargarEventos();
      alert('¡Login exitoso!');
    } else {
      alert(data.mensaje || 'Error al hacer login');
    }
  } catch (error) {
    console.error('Error al hacer login:', error);
    alert('Error al conectar con el servidor');
  }
}

// Manejar registro
async function handleRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const nombre = document.getElementById('registerNombre').value;
  const apellido = document.getElementById('registerApellido').value;
  
  try {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre, apellido })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      showLogin();
      document.getElementById('registerForm').querySelector('form').reset();
    } else {
      alert(data.mensaje || 'Error al registrar usuario');
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    alert('Error al conectar con el servidor');
  }
}

// Cerrar sesión
function logout() {
  usuarioActual = null;
  localStorage.removeItem('usuario');
  mostrarAuth();
  document.getElementById('loginForm').querySelector('form').reset();
}

// Formulario submit
document.getElementById('eventoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const evento = {
    titulo: document.getElementById('titulo').value,
    descripcion: document.getElementById('descripcion').value,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    latitud: document.getElementById('latitud').value || null,
    longitud: document.getElementById('longitud').value || null
  };
  
  await crearEvento(evento);
  document.getElementById('eventoForm').reset();
  document.getElementById('mapa').style.display = 'none';
  document.getElementById('ubicacionTexto').textContent = '';
  if (mapa) {
    mapa.remove();
    mapa = null;
  }
});

async function cargarEventos() {
  try {
    const response = await fetch(API_URL);
    eventos = await response.json();
    renderizarEventos();
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    document.getElementById('eventosList').innerHTML = 
      '<p class="text-red-500 text-center">Error al cargar eventos</p>';
  }
}

async function crearEvento(evento) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento)
    });
    
    if (response.ok) {
      await cargarEventos();
    }
  } catch (error) {
    console.error('Error al crear evento:', error);
    alert('Error al crear evento');
  }
}

async function eliminarEvento(id) {
  if (!confirm('¿Estás seguro de eliminar este evento?')) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    
    if (response.ok) {
      await cargarEventos();
    }
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    alert('Error al eliminar evento');
  }
}

function renderizarEventos() {
  const contenedor = document.getElementById('eventosList');
  
  if (eventos.length === 0) {
    contenedor.innerHTML = '<p class="text-gray-500 text-center">No hay eventos</p>';
    return;
  }
  
  // Ordenar por fecha y hora
  const eventosOrdenados = [...eventos].sort((a, b) => {
    const fechaA = new Date(`${a.fecha} ${a.hora || '00:00'}`);
    const fechaB = new Date(`${b.fecha} ${b.hora || '00:00'}`);
    return fechaA - fechaB;
  });
  
  contenedor.innerHTML = eventosOrdenados.map(evento => `
    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800">${evento.titulo}</h3>
          ${evento.descripcion ? `<p class="text-gray-600 text-sm mt-1">${evento.descripcion}</p>` : ''}
          <div class="flex gap-4 mt-2 text-sm text-gray-500">
            <span>📆 ${formatearFecha(evento.fecha)}</span>
            ${evento.hora ? `<span>⏰ ${evento.hora}</span>` : ''}
            ${evento.latitud && evento.longitud ? `<span>📍 <button onclick="verUbicacion(${evento.latitud}, ${evento.longitud})" class="text-blue-500 hover:text-blue-700 underline">Ver ubicación</button></span>` : ''}
          </div>
        </div>
        <button onclick="eliminarEvento('${evento.id}')"
          class="text-red-500 hover:text-red-700 text-sm font-medium ml-4">
          Eliminar
        </button>
      </div>
    </div>
  `).join('');
}

function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
}

// Función para obtener ubicación actual
function obtenerUbicacion() {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      document.getElementById('latitud').value = lat;
      document.getElementById('longitud').value = lng;
      document.getElementById('ubicacionTexto').textContent = `📍 Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      // Mostrar mapa
      document.getElementById('mapa').style.display = 'block';
      
      // Inicializar mapa si no existe
      if (!mapa) {
        mapa = L.map('mapa').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
      } else {
        mapa.setView([lat, lng], 13);
      }
      
      // Agregar o actualizar marcador
      if (marcador) {
        mapa.removeLayer(marcador);
      }
      marcador = L.marker([lat, lng]).addTo(mapa);
    },
    (error) => {
      alert('Error al obtener ubicación: ' + error.message);
    }
  );
}

// Función para ver ubicación de un evento
function verUbicacion(lat, lng) {
  if (!lat || !lng) return;
  
  // Crear modal para mostrar el mapa
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">Ubicación del evento</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      <div id="mapaModal" style="height: 400px;"></div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Inicializar mapa en el modal
  const mapaModal = L.map('mapaModal').setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapaModal);
  L.marker([lat, lng]).addTo(mapaModal);
  
  // Limpiar mapa al cerrar modal
  modal.querySelector('button').onclick = function() {
    mapaModal.remove();
    modal.remove();
  };
}
