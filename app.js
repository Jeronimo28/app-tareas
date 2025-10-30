// Variables globales
let criterioOrden = localStorage.getItem('criterioOrden') || 'fecha';
let ascendente = localStorage.getItem('ascendente') !== 'false';

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

// Obtener valor numérico de la prioridad
function obtenerValorPrioridad(prioridad) {
    switch(prioridad) {
        case 'alta': return 3;
        case 'media': return 2;
        case 'baja': return 1;
        default: return 0;
    }
}

// Obtener emoji de prioridad
function obtenerEmojiPrioridad(prioridad) {
    switch(prioridad) {
        case 'alta': return '🔴';
        case 'media': return '🟡';
        case 'baja': return '🟢';
        default: return '⚪';
    }
}

// Función para formatear fecha
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Aplicar ordenamiento a las tareas
function ordenarTareas(tareas) {
    const tareasOrdenadas = [...tareas];
    
    switch(criterioOrden) {
        case 'prioridad':
            tareasOrdenadas.sort((a, b) => {
                const prioridadA = obtenerValorPrioridad(a.prioridad);
                const prioridadB = obtenerValorPrioridad(b.prioridad);
                return ascendente ? prioridadB - prioridadA : prioridadA - prioridadB;
            });
            break;
            
        case 'estado':
            tareasOrdenadas.sort((a, b) => {
                if (a.completada !== b.completada) {
                    return ascendente ? (a.completada ? 1 : -1) : (a.completada ? -1 : 1);
                }
                // Si mismo estado, ordenar por fecha de tarea o creación
                const fechaA = a.fechaTarea ? new Date(a.fechaTarea) : new Date(a.fecha);
                const fechaB = b.fechaTarea ? new Date(b.fechaTarea) : new Date(b.fecha);
                return fechaB - fechaA;
            });
            break;
            
        case 'fecha':
        default:
            tareasOrdenadas.sort((a, b) => {
                // Usar fecha de tarea si existe, sino fecha de creación
                const fechaA = a.fechaTarea ? new Date(a.fechaTarea) : new Date(a.fecha);
                const fechaB = b.fechaTarea ? new Date(b.fechaTarea) : new Date(b.fecha);
                return ascendente ? fechaB - fechaA : fechaA - fechaB;
            });
            break;
    }
    
    return tareasOrdenadas;
}

// Cambiar prioridad de una tarea
function cambiarPrioridad(index) {
    const tareas = cargarTareas();
    const tarea = tareas[index];
    
    if (!tarea.prioridad || tarea.prioridad === 'ninguna') {
        tarea.prioridad = 'baja';
    } else if (tarea.prioridad === 'baja') {
        tarea.prioridad = 'media';
    } else if (tarea.prioridad === 'media') {
        tarea.prioridad = 'alta';
    } else {
        tarea.prioridad = 'ninguna';
    }
    
    guardarTareas(tareas);
    mostrarTareas();
}

// Actualizar interfaz de ordenamiento
function actualizarUIOrdenamiento() {
    const criterioSelect = document.getElementById('criterioOrden');
    const btnDireccion = document.getElementById('direccionOrden');
    
    if (criterioSelect) criterioSelect.value = criterioOrden;
    if (btnDireccion) {
        btnDireccion.textContent = ascendente ? '↑' : '↓';
        btnDireccion.title = ascendente ? 'Orden ascendente' : 'Orden descendente';
        
        if (criterioOrden !== 'fecha' || !ascendente) {
            btnDireccion.classList.add('ordenamiento-activo');
        } else {
            btnDireccion.classList.remove('ordenamiento-activo');
        }
    }
}

// Cambiar criterio de ordenamiento
function cambiarCriterioOrden(nuevoCriterio) {
    criterioOrden = nuevoCriterio;
    localStorage.setItem('criterioOrden', criterioOrden);
    mostrarTareas();
    actualizarUIOrdenamiento();
}

// Alternar dirección del ordenamiento
function alternarDireccionOrden() {
    ascendente = !ascendente;
    localStorage.setItem('ascendente', ascendente);
    mostrarTareas();
    actualizarUIOrdenamiento();
}

// Mostrar tareas en la lista
function mostrarTareas() {
    const listaTareas = document.getElementById('listaTareas');
    if (!listaTareas) return;
    
    const tareas = cargarTareas();
    const tareasOrdenadas = ordenarTareas(tareas);
    
    listaTareas.innerHTML = '';
    
    if (tareasOrdenadas.length === 0) {
        listaTareas.innerHTML = '<li style="text-align: center; color: #888; font-style: italic;">No hay tareas. ¡Agrega una nueva!</li>';
        return;
    }
    
    tareasOrdenadas.forEach((tarea, indexOrdenado) => {
        const tareasOriginales = cargarTareas();
        const indiceOriginal = tareasOriginales.findIndex(t => 
            t.fecha === tarea.fecha && t.texto === tarea.texto
        );
        
        const li = document.createElement('li');
        if (tarea.completada) {
            li.classList.add('done');
        }
        
        if (tarea.prioridad && tarea.prioridad !== 'ninguna') {
            li.classList.add(`prioridad-${tarea.prioridad}`);
        }
        
        li.innerHTML = `
            <input type="checkbox" ${tarea.completada ? 'checked' : ''} 
                   onchange="toggleTarea(${indiceOriginal})" 
                   aria-label="${tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}">
            <button class="btn-prioridad" onclick="cambiarPrioridad(${indiceOriginal})" aria-label="Cambiar prioridad">
                ${obtenerEmojiPrioridad(tarea.prioridad)}
            </button>
            <span>
                ${tarea.texto}
                ${tarea.fechaTarea ? `<br><small style="color: #888; font-size: 12px;">📅 ${formatearFecha(tarea.fechaTarea)}</small>` : ''}
            </span>
            <button onclick="eliminarTarea(${indiceOriginal})" aria-label="Eliminar tarea">🗑️</button>
        `;
        
        listaTareas.appendChild(li);
    });
}

// AGREGAR NUEVA TAREA - FUNCIÓN PRINCIPAL
function agregarTarea() {
    console.log('Función agregarTarea ejecutada');
    
    const input = document.getElementById('nuevaTarea');
    const inputFecha = document.getElementById('fechaTarea');
    
    if (!input || !inputFecha) {
        console.error('No se encontraron los inputs necesarios');
        return;
    }
    
    const texto = input.value.trim();
    const fechaSeleccionada = inputFecha.value;
    
    console.log('Texto ingresado:', texto);
    console.log('Fecha seleccionada:', fechaSeleccionada);
    
    if (texto === '') {
        input.style.borderColor = '#ef5350';
        setTimeout(() => {
            input.style.borderColor = '#f4d19b';
        }, 1000);
        return;
    }
    
    const tareas = cargarTareas();
    const nuevaTarea = {
        texto: texto,
        completada: false,
        fecha: new Date().toISOString(), // Fecha de creación
        fechaTarea: fechaSeleccionada || null, // Fecha opcional para la tarea
        prioridad: 'ninguna'
    };
    
    console.log('Nueva tarea a agregar:', nuevaTarea);
    tareas.push(nuevaTarea);
    guardarTareas(tareas);
    
    input.value = '';
    inputFecha.value = ''; // Limpiar campo de fecha
    mostrarTareas();
    console.log('Tarea agregada exitosamente');
}

// Alternar estado de tarea
function toggleTarea(index) {
    const tareas = cargarTareas();
    if (tareas[index]) {
        tareas[index].completada = !tareas[index].completada;
        guardarTareas(tareas);
        mostrarTareas();
    }
}

// Eliminar tarea individual
function eliminarTarea(index) {
    const tareas = cargarTareas();
    if (tareas[index]) {
        tareas.splice(index, 1);
        guardarTareas(tareas);
        mostrarTareas();
    }
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

// INICIALIZACIÓN - Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Inicializando app');
    
    // Mostrar tareas existentes
    mostrarTareas();
    actualizarUIOrdenamiento();
    
    // Configurar event listeners
    const agregarBtn = document.getElementById('agregarTarea');
    const inputTarea = document.getElementById('nuevaTarea');
    const inputFecha = document.getElementById('fechaTarea');
    const criterioSelect = document.getElementById('criterioOrden');
    const direccionBtn = document.getElementById('direccionOrden');
    const eliminarHechasBtn = document.getElementById('eliminarHechas');
    const eliminarTodasBtn = document.getElementById('eliminarTodas');
    
    // Verificar que los elementos existen
    console.log('Elementos encontrados:', {
        agregarBtn: !!agregarBtn,
        inputTarea: !!inputTarea,
        inputFecha: !!inputFecha,
        criterioSelect: !!criterioSelect,
        direccionBtn: !!direccionBtn,
        eliminarHechasBtn: !!eliminarHechasBtn,
        eliminarTodasBtn: !!eliminarTodasBtn
    });
    
    // Configurar event listeners solo si los elementos existen
    if (agregarBtn) {
        agregarBtn.addEventListener('click', agregarTarea);
        console.log('Event listener agregado al botón Agregar');
    }
    
    if (inputTarea) {
        inputTarea.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                agregarTarea();
            }
        });
        console.log('Event listener agregado al input de texto');
    }
    
    if (inputFecha) {
        inputFecha.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                agregarTarea();
            }
        });
        console.log('Event listener agregado al input de fecha');
    }
    
    if (criterioSelect) {
        criterioSelect.addEventListener('change', function(e) {
            cambiarCriterioOrden(e.target.value);
        });
    }
    
    if (direccionBtn) {
        direccionBtn.addEventListener('click', alternarDireccionOrden);
    }
    
    if (eliminarHechasBtn) {
        eliminarHechasBtn.addEventListener('click', eliminarTareasHechas);
    }
    
    if (eliminarTodasBtn) {
        eliminarTodasBtn.addEventListener('click', eliminarTodasTareas);
    }
    
    console.log('App inicializada correctamente');
});

// Hacer funciones globales
window.toggleTarea = toggleTarea;
window.eliminarTarea = eliminarTarea;
window.cambiarPrioridad = cambiarPrioridad;
window.cambiarCriterioOrden = cambiarCriterioOrden;
window.alternarDireccionOrden = alternarDireccionOrden;
window.agregarTarea = agregarTarea;
