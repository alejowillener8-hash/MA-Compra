// =========================================================================
// BLOQUE 1: INTERFAZ DEL MENÚ (DESPLEGAR, CERRAR Y CLICS EXTERNOS)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const botonOrdenar = document.getElementById("btnToggleOrdenar");
    const contenedorOrdenar = document.getElementById("contenedorOrdenar");
    const iconoOrdenar = document.querySelector(".iconoordenar");
    const opcionesOrdenar = document.querySelectorAll(".opcion-ordenar");

    // Si los elementos principales de ordenamiento no existen en la página actual, salimos pacíficamente
    if (!botonOrdenar || !contenedorOrdenar) return;

    // Apertura y cierre del menú de ordenamiento
    botonOrdenar.addEventListener("click", (e) => {
        e.stopPropagation();

        // Regla de UX: Al abrir el ordenamiento, cerramos el panel de filtros por completo
        const contenedorFiltro = document.getElementById("contenedorFiltro");
        const botonFiltro = document.getElementById("btnToggleFiltros");
        const iconoFiltro = document.querySelector(".iconofiltro");

        if (contenedorFiltro) contenedorFiltro.classList.remove("abierto");
        if (botonFiltro) botonFiltro.classList.remove("activo");
        if (iconoFiltro) iconoFiltro.classList.remove("iconofiltroabierto");

        // Alternar el estado de este menú
        contenedorOrdenar.classList.toggle("abierto");
        if (iconoOrdenar) iconoOrdenar.classList.toggle("abierto");
    });

    // Cerrar el menú si el usuario hace clic en cualquier otra parte vacía de la pantalla
    document.addEventListener("click", (e) => {
        if (!contenedorOrdenar.contains(e.target) && !botonOrdenar.contains(e.target)) {
            contenedorOrdenar.classList.remove("abierto");
            if (iconoOrdenar) iconoOrdenar.classList.remove("abierto");
        }
    });

    // Asignar los eventos de clic a cada opción de orden dinámica
    opcionesOrdenar.forEach(opcion => {
        opcion.addEventListener("click", () => {
            const tipoOrden = opcion.dataset.order;
            
            ordenarProductos(tipoOrden);

            // Una vez seleccionado el criterio, cerramos el menú desplegable
            contenedorOrdenar.classList.remove("abierto");
            if (iconoOrdenar) iconoOrdenar.classList.remove("abierto");
        });
    });
});


// =========================================================================
// BLOQUE 2: MOTOR DE ORDENAMIENTO (LÓGICA SOBRE EL ARREGLO GLOBAL)
// =========================================================================

/**
 * Ordena la lista de productos que se está mostrando actualmente.
 * Depende de la existencia de 'productosActuales' y la función global 'renderizarProductos'.
 */
function ordenarProductos(tipo) {
    // Control de seguridad por si las variables globales aún no están declaradas
    if (typeof productosActuales === "undefined" || !Array.isArray(productosActuales)) return;

    // Clonamos el arreglo actual para ordenarlo sin mutar destructivamente el estado original
    let productosOrdenados = [...productosActuales];

    switch (tipo) {
        case "mayor":
            // Ordenar de mayor precio a menor precio
            productosOrdenados.sort((a, b) => Number(b.precio) - Number(a.precio));
            break;

        case "menor":
            // Ordenar de menor precio a mayor precio
            productosOrdenados.sort((a, b) => Number(a.precio) - Number(b.precio));
            break;

        case "recientes":
            // Novedades: IDs más altos primero (asumiendo autoincrementales en tu base de datos)
            productosOrdenados.sort((a, b) => b.id - a.id);
            break;

        case "antiguos":
            // Clásicos: IDs más bajos primero
            productosOrdenados.sort((a, b) => a.id - b.id);
            break;

        default:
            return; // Si mandan un tipo de orden inexistente, frena el flujo
    }

    // Volvemos a dibujar la grilla del catálogo con los productos en su nueva posición
    if (typeof renderizarProductos === "function") {
        renderizarProductos(productosOrdenados);
    }
}