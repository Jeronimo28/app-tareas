const agregarBtn = document.getElementById('agregarTarea');
const lista = document.getElementById('listaTareas');
const eliminarTodasBtn = document.getElementById('eliminarTodas');
const eliminarHechasBtn = document.getElementById('eliminarHechas');
const nuevaTareaInput = document.getElementById('nuevaTarea');

let tareas = JSON.parse(localStorage.getItem('tareas')) || [];

function guardarTareas() {
  localStorage.setItem('tareas', JSON.stringify(tareas));
}

function renderizarTareas() {
  lista.innerHTML = '';
  tareas.forEach((tarea, index) => {
    const li = document.createElement('li');

    // Checkbox para marcar hecha
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarea.hecha;
    checkbox.addEventListener('change', () => {
      tareas[index].hecha = checkbox.checked;
      guardarTareas();
      renderizarTareas();
    });

    const span = document.createElement('span');
    span.textContent = tarea.texto;

    // Botón para eliminar tarea individual
    const eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'X';
    eliminarBtn.addEventListener('click', () => {
      tareas.splice(index, 1);
      guardarTareas();
      renderizarTareas();
    });

    if (tarea.hecha) li.classList.add('done');

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(eliminarBtn);
    lista.appendChild(li);
  });
}

// Agregar nueva tarea
agregarBtn.addEventListener('click', () => {
  const texto = nuevaTareaInput.value.trim();
  if (!texto) return;
  tareas.push({ texto, hecha: false });
  guardarTareas();
  renderizarTareas();
  nuevaTareaInput.value = '';
});

// Eliminar todas las tareas
eliminarTodasBtn.addEventListener('click', () => {
  if (confirm('¿Seguro que quieres eliminar todas las tareas?')) {
    tareas = [];
    guardarTareas();
    renderizarTareas();
  }
});

// Eliminar tareas hechas
eliminarHechasBtn.addEventListener('click', () => {
  tareas = tareas.filter(t => !t.hecha);
  guardarTareas();
  renderizarTareas();
});

// Inicializar
renderizarTareas();
