// Agregar al final de app.js

// Detectar si la PWA se puede instalar
let deferredPrompt;
const installBtn = document.createElement('button');
installBtn.textContent = '📱 Instalar App';
installBtn.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 500;
  transition: all 0.3s;
`;

// Cargar tareas desde localStorage
function cargarTareas() {
  const tareasGuardadas = localStorage.getItem('tareasApp');
  if (tareasGuardadas) {
    return JSON.parse(tareasGuardadas);
  }
  return [];
}

// Guardar tareas en localStorage
function guardarTareas(tareas) {
  localStorage.setItem('tareasApp', JSON.stringify(tareas));
}

// Mostrar tareas en la lista
function mostrarTareas() {
  const listaTareas = document.getElementById('listaTareas');
  const tareas = cargarTareas();
  
  listaTareas.innerHTML = '';
  
  tareas.forEach((tarea, index) => {
    const li = document.createElement('li');
    if (tarea.completada) {
      li.classList.add('done');
    }
    
    li.innerHTML = `
      <input type="checkbox" ${tarea.completada ? 'checked' : ''} 
             onchange="toggleTarea(${index})" 
             aria-label="${tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}">
      <span>${tarea.texto}</span>
      <button onclick="eliminarTarea(${index})" aria-label="Eliminar tarea">🗑️</button>
    `;
    
    listaTareas.appendChild(li);
  });
}

// Agregar nueva tarea
function agregarTarea() {
  const input = document.getElementById('nuevaTarea');
  const texto = input.value.trim();
  
  if (texto === '') {
    // Feedback visual
    input.style.borderColor = '#ef5350';
    setTimeout(() => {
      input.style.borderColor = '#f4d19b';
    }, 1000);
    return;
  }
  
  const tareas = cargarTareas();
  tareas.push({
    texto: texto,
    completada: false,
    fecha: new Date().toISOString()
  });
  
  guardarTareas(tareas);
  input.value = '';
  mostrarTareas();
}

// Alternar estado de tarea
function toggleTarea(index) {
  const tareas = cargarTareas();
  tareas[index].completada = !tareas[index].completada;
  guardarTareas(tareas);
  mostrarTareas();
}

// Eliminar tarea individual
function eliminarTarea(index) {
  const tareas = cargarTareas();
  tareas.splice(index, 1);
  guardarTareas(tareas);
  mostrarTareas();
}

// Eliminar tareas completadas
function eliminarTareasHechas() {
  const tareas = cargarTareas().filter(tarea => !tarea.completada);
  guardarTareas(tareas);
  mostrarTareas();
}

// Eliminar todas las tareas
function eliminarTodasTareas() {
  if (confirm('¿Estás seguro de que quieres eliminar todas las tareas?')) {
    guardarTareas([]);
    mostrarTareas();
  }
}

// Event listeners mejorados
document.addEventListener('DOMContentLoaded', function() {
  mostrarTareas();
  
  document.getElementById('agregarTarea').addEventListener('click', agregarTarea);
  
  document.getElementById('nuevaTarea').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      agregarTarea();
    }
  });
  
  document.getElementById('eliminarHechas').addEventListener('click', eliminarTareasHechas);
  document.getElementById('eliminarTodas').addEventListener('click', eliminarTodasTareas);
});

// Instalación PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (!document.querySelector('#installBtn')) {
    installBtn.id = 'installBtn';
    document.body.appendChild(installBtn);
  }
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('Usuario aceptó instalar la PWA');
    installBtn.style.display = 'none';
  }
  
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalada');
  installBtn.style.display = 'none';
  deferredPrompt = null;
});

// Hacer funciones globales para los event handlers en HTML
window.toggleTarea = toggleTarea;
window.eliminarTarea = eliminarTarea;
