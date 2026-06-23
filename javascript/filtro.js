// =========================================================================
// BLOQUE 1: CONTROLADOR DE PRECIOS
// =========================================================================

function inicializarDeslizadoresPrecio() {
    const inputMin = document.getElementById("precioMin");
    const inputMax = document.getElementById("precioMax");
    const labelMin = document.getElementById("labelMin");
    const labelMax = document.getElementById("labelMax");

    if (!inputMin || !inputMax) return;

    const formatearMoneda = valor => "$" + parseInt(valor).toLocaleString("es-AR");

    const actualizarEtiquetas = () => {
        if (labelMin) labelMin.textContent = formatearMoneda(inputMin.value);
        if (labelMax) labelMax.textContent = formatearMoneda(inputMax.value);
    };

    inputMin.addEventListener("input", () => {
        if (parseInt(inputMin.value) > parseInt(inputMax.value)) {
            inputMin.value = inputMax.value;
        }
        actualizarEtiquetas();
    });

    inputMax.addEventListener("input", () => {
        if (parseInt(inputMax.value) < parseInt(inputMin.value)) {
            inputMax.value = inputMin.value;
        }
        actualizarEtiquetas();
    });

    actualizarEtiquetas();
}


// =========================================================================
// BLOQUE 2: GENERACIÓN DINÁMICA DE OPCIONES
// =========================================================================

function cargarColores(productos, contenedorColores, mapaDeColores) {
    if (!contenedorColores) return;

    const coloresUnicos = [...new Set(productos.map(p => normalizarTexto(p.color)).filter(Boolean))];
    contenedorColores.innerHTML = "";

    coloresUnicos.forEach(colorNombre => {
        const colorHex = mapaDeColores[colorNombre] || colorNombre;
        const labelSwatch = document.createElement("label");
        
        labelSwatch.className = "swatch-item";
        labelSwatch.title = colorNombre.toUpperCase();
        labelSwatch.innerHTML = `
            <input type="checkbox" name="color" value="${colorNombre}">
            <div class="swatch-box" style="background-color:${colorHex};"></div>
        `;
        
        contenedorColores.appendChild(labelSwatch);
    });
}

function cargarTalles(productos, contenedorTalles) {
    if (!contenedorTalles) return;

    const tallesDuplicados = productos.flatMap(p => (p.talles || []).map(t => String(t).toUpperCase().trim()));
    const tallesUnicos = [...new Set(tallesDuplicados)];
    const ordenPrioridad = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

    tallesUnicos.sort((a, b) => {
        const ia = ordenPrioridad.indexOf(a);
        const ib = ordenPrioridad.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    contenedorTalles.innerHTML = "";

    tallesUnicos.forEach(talleNombre => {
        const label = document.createElement("label");
        label.className = "talle-item-btn";
        label.innerHTML = `
            <input type="checkbox" name="talles" value="${talleNombre}">
            <div class="talle-text-box">${talleNombre}</div>
        `;
        
        contenedorTalles.appendChild(label);
    });
}

function cargarTipologias(productos, contenedorTipologias) {
    if (!contenedorTipologias) return;

    const tipologiasUnicas = [...new Set(productos.map(p => normalizarTexto(p.tipologia)).filter(Boolean))];
    contenedorTipologias.innerHTML = "";

    tipologiasUnicas.forEach(tipo => {
        const label = document.createElement("label");
        label.className = "tipologia-boton-ajuste";
        label.innerHTML = `
            <input type="checkbox" name="tipologia" value="${tipo}">
            <div class="tipologia-text-box">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</div>
        `;
        
        contenedorTipologias.appendChild(label);
    });
}


// =========================================================================
// BLOQUE 3: MOTOR DE FILTRADO
// =========================================================================

function aplicarFiltros() {
    // Seguridad extra: Si productos no está definido, salimos para no romper nada
    if (typeof productos === "undefined") return;

    let productosFiltrados = [...productos];

    const coloresSeleccionados = [...document.querySelectorAll('input[name="color"]:checked')]
        .map(c => normalizarTexto(c.value));

    if (coloresSeleccionados.length > 0) {
        productosFiltrados = productosFiltrados.filter(p => coloresSeleccionados.includes(normalizarTexto(p.color)));
    }

    const tallesSeleccionados = [...document.querySelectorAll('input[name="talles"]:checked')]
        .map(t => String(t.value).toUpperCase().trim());

    if (tallesSeleccionados.length > 0) {
        productosFiltrados = productosFiltrados.filter(p => {
            const tallesProducto = (p.talles || []).map(t => String(t).toUpperCase().trim());
            return tallesProducto.some(talle => tallesSeleccionados.includes(talle));
        });
    }

    const tipologiasSeleccionadas = [...document.querySelectorAll('input[name="tipologia"]:checked')]
        .map(t => normalizarTexto(t.value));

    if (tipologiasSeleccionadas.length > 0) {
        productosFiltrados = productosFiltrados.filter(p => tipologiasSeleccionadas.includes(normalizarTexto(p.tipologia)));
    }

    // Seguridad al capturar precios
    const inputPrecioMin = document.getElementById("precioMin");
    const inputPrecioMax = document.getElementById("precioMax");
    
    if (inputPrecioMin && inputPrecioMax) {
        const precioMin = Number(inputPrecioMin.value);
        const precioMax = Number(inputPrecioMax.value);
        productosFiltrados = productosFiltrados.filter(p => Number(p.precio) >= precioMin && Number(p.precio) <= precioMax);
    }

    productosActuales = [...productosFiltrados];
    
    if (typeof renderizarProductos === "function") {
        renderizarProductos(productosActuales);
    }
}


// =========================================================================
// BLOQUE 4: EVENTOS DEL DOM Y SEGURIDAD DE INTERFAZ
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    inicializarDeslizadoresPrecio();

    const botonFiltro = document.getElementById("btnToggleFiltros");
    const contenedorFiltro = document.getElementById("contenedorFiltro");
    const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
    const filtroboton = document.querySelector(".botonfiltro");
    const iconofiltro = document.querySelector(".iconofiltro");

    // 1. Manejo del botón para abrir/cerrar panel de filtros
    if (botonFiltro && contenedorFiltro) {
        botonFiltro.addEventListener("click", () => {
            // Cerrar menú de ordenamiento si estuviese abierto
            const contenedorOrdenar = document.getElementById("contenedorOrdenar");
            const iconoOrdenar = document.querySelector(".iconoordenar");
            
            if (contenedorOrdenar) contenedorOrdenar.classList.remove("abierto");
            if (iconoOrdenar) iconoOrdenar.classList.remove("abierto");

            // Alternar filtros
            botonFiltro.classList.toggle("activo");
            contenedorFiltro.classList.toggle("abierto");
        });
    }

    // 2. Cerrar filtros haciendo clic fuera del contenedor (Solución de bloqueo)
    document.addEventListener("click", (e) => {
        // Solo verificamos la contención si los elementos existen en el HTML actual
        if (botonFiltro && contenedorFiltro) {
            const clickEnBoton = botonFiltro.contains(e.target);
            const clickEnFiltro = contenedorFiltro.contains(e.target);

            if (!clickEnBoton && !clickEnFiltro) {
                botonFiltro.classList.remove("activo");
                contenedorFiltro.classList.remove("abierto");
                
                if (iconofiltro) {
                    iconofiltro.classList.remove("iconofiltroabierto");
                }
            }
        }
    });

    // 3. Aplicar filtros al hacer clic en el botón interno
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener("click", aplicarFiltros);
    }

    // 4. Animación extra del ícono de filtros
    if (filtroboton && iconofiltro) {
        filtroboton.addEventListener("click", () => {
            iconofiltro.classList.toggle("iconofiltroabierto");
        });
    }
});