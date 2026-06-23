// =========================================================================
// BLOQUE 1: VARIABLES GLOBALES, CONFIGURACIÓN Y FUNCIONES AYUDANTES
// =========================================================================

// Arreglos globales para guardar el estado de los productos
let productos = [];          // Guarda la lista original intacta que viene de la base de datos
let productosActuales = [];  // Guarda la lista filtrada u ordenada que se muestra en pantalla

/**
 * ⚡ OPTIMIZACIÓN CENTRAL DE URL:
 * Centralizamos la URL del backend. Cuando vayas a desplegar en Render/Railway,
 * solo cambias este string por tu URL pública y todo tu frontend se actualizará mágicamente.
 */


/**
 * Función ayudante para construir la ruta correcta de las imágenes.
 * @param {string} urlImagen - La ruta guardada en la base de datos.
 * @returns {string} - Ruta absoluta lista para la etiqueta <img>.
 */
function obtenerRutaImagen(urlImagen) {
    // Si no hay imagen, devuelve una imagen por defecto (evita cajas vacías rotas)
    if (!urlImagen) return "imagenes/placeholder.jpg";

    // Si la ruta empieza con /uploads, significa que está guardada localmente en el backend
    if (urlImagen.startsWith("/uploads")) {
        return `${API_BASE_URL}${urlImagen}`;
    }

    // Si ya es una URL completa (ej: de un servidor externo), la deja como está
    return urlImagen;
}

/**
 * Normaliza textos eliminando mayúsculas y espacios en blanco rebeldes.
 * Muy útil para hacer comparaciones y filtros precisos de texto.
 */
function normalizarTexto(texto) {
    return String(texto || "").toLowerCase().trim();
}


// =========================================================================
// BLOQUE 2: RENDERIZADO DINÁMICO DE TARJETAS EN EL DOM
// =========================================================================
/**
 * Se encarga de limpiar el contenedor HTML y dibujar las tarjetas de productos en pantalla.
 * @param {Array} lista - El arreglo de productos a renderizar.
 */
function renderizarProductos(lista) {

    // Selecciona el contenedor en tu catálogo HTML
    const contenedor = document.querySelector(".contenedorcatalogo");
    if (!contenedor) return; // Red de seguridad: si no encuentra el contenedor, frena la ejecución

    // Limpia el contenedor (borra los productos anteriores antes de dibujar los nuevos)
    contenedor.innerHTML = "";

    // Bucle para procesar cada producto individualmente
    lista.forEach(producto => {

        // Crea el elemento contenedor de la tarjeta
        const card = document.createElement("div");
        card.classList.add("cardcatalogo");

        // Resuelve las rutas de imagen principal y secundaria usando el helper del Bloque 1
        const imgPrincipal = obtenerRutaImagen(producto.imagen_principal);
        // Si no hay imagen secundaria, duplica la principal para que el efecto visual no falle
        const imgSecundaria = obtenerRutaImagen(
            producto.imagen_secundaria || producto.imagen_principal
        );

        // Mapea el array de talles del backend y genera pequeños spans HTML por cada uno
        const tallesHTML = (producto.talles || [])
            .map(talle => `<span class="mini-talle">${talle.talle || talle}</span>`)
            .join(""); // .join("") une los strings eliminando las comas intermedias

        // Inyecta la estructura HTML interna dentro de la tarjeta
        card.innerHTML = `
            <div class="contenedor-imagen">

                <img class="img-principal"
                    src="${imgPrincipal}"
                    alt="${producto.nombre}">

                <img class="img-secundaria"
                    src="${imgSecundaria}"
                    alt="${producto.nombre}">

                <div class="contenedorcontalle">
                    <div class="mini-talles-container">
                        ${tallesHTML}
                    </div>
                </div>

            </div>

            <div class="titulo-y-talles">
                <h3>${producto.nombre}</h3>
            </div>

            <p>$ ${Number(producto.precio).toLocaleString("es-AR")}</p>
        `;

        // MANEJO DEL CLICK: Al hacer clic en la imagen, guarda el ID y redirige al detalle de compra
        const contenedorImagen = card.querySelector(".contenedor-imagen");
        contenedorImagen.addEventListener("click", () => {
            // Guarda temporalmente el ID en la memoria del navegador para que lo lea "orden.js"
            localStorage.setItem("producto", producto.id);
            window.location.href = "orden.html"; // Redirección
        });

        // Agrega la tarjeta terminada al contenedor principal de la página
        contenedor.appendChild(card);
    });
}


// =========================================================================
// BLOQUE 3: CONTROLADOR PRINCIPAL Y PETICIÓN HTTP (FETCH)
// =========================================================================
/**
 * Función asíncrona que arranca la aplicación, pide los datos a la API y
 * delega la construcción de los filtros dinámicos.
 */
async function cargarCatalogo() {

    // Captura los contenedores del DOM donde se inyectarán los filtros dinámicos
    const contenedorColores = document.getElementById("contenedorColoresDinamicos");
    const contenedorTalles = document.getElementById("contenedorTallesDinamicos");
    const contenedorTipologias = document.getElementById("contenedorTipologiasDinamicos");

    // Diccionario de colores para traducir los nombres de la BD a códigos HEX de CSS
    const mapaDeColores = {
        negro: "#000000",
        gris: "#9e9e9e",
        blanco: "#ffffff",
        beige: "#e9dcc9",
        rojo: "#b3002d",
        azul: "#003c8f",
        celeste: "#6ec6ff",
        verde: "#2e8b57",
        "verde oliva": "#556b2f",
        amarillo: "#ffd700",
        naranja: "#ff7f00",
        rosa: "#ff8fab",
        violeta: "#7b2cbf",
        marron: "#6f4e37",
        "varios colores": "#eeeeee"
    };

    try {
        // Petición HTTP GET a nuestro backend utilizando la constante optimizada
        const respuesta = await fetch(`${API_BASE_URL}/api/productos`);

        // Si la respuesta no es un código 200-299, frena el proceso
        if (!respuesta.ok) return;

        // Convierte el flujo de datos binarios del servidor en un objeto JSON nativo de JavaScript
        productos = await respuesta.json();
        productosActuales = [...productos]; // Operador Spread (...) para clonar el array sin vincular su referencia

        // Dibuja los productos en pantalla por primera vez
        renderizarProductos(productosActuales);

        /**
         * NOTA DE ESTUDIO: Estas funciones se ejecutan aquí, pero sus lógicas internas
         * viven en tus otros archivos JS (como filtro.js). Se encargan de leer el array 
         * de productos y generar los botones de filtros automáticamente en base al stock real.
         */
        cargarColores(productos, contenedorColores, mapaDeColores);
        cargarTalles(productos, contenedorTalles);
        cargarTipologias(productos, contenedorTipologias);

    } catch (error) {
        console.error("❌ Error crítico en el fetch de catalogo.js:", error);
    }
}

// Disparo inicial: Ejecuta de forma automática todo el flujo al cargar la página
cargarCatalogo();