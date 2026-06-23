// =========================================================================
// CONFIGURACIÓN
// =========================================================================

const productoSeleccionado = localStorage.getItem("producto");

// estado local
let talleSeleccionado = null;
let stockSeleccionado = 0;


// =========================================================================
// HELPERS
// =========================================================================

function obtenerRutaImagen(urlImagen) {
    if (!urlImagen) return "imagenes/placeholder.jpg";
    if (urlImagen.startsWith("/uploads")) {
        return `${API_BASE_URL}${urlImagen}`;
    }
    return urlImagen;
}

function getToken() {
    return localStorage.getItem("token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}


// =========================================================================
// AGREGAR AL CARRITO (BACKEND REAL)
// =========================================================================

async function agregarAlCarritoAPI(producto) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/carrito`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(producto)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Error al agregar al carrito");
        }

        alert("Producto agregado al carrito");
        console.log(data);
        return true; // Retornamos true si salió bien

    } catch (error) {
        console.error(error);
        alert(error.message);
        return false; // Retornamos false si hubo error
    }
}


// =========================================================================
// INICIAR PÁGINA
// =========================================================================

async function iniciarPagina() {
    try {
        const respuesta = await fetch(`${API_BASE_URL}/api/productos/${productoSeleccionado}`);

        if (!respuesta.ok) throw new Error("Producto no encontrado");

        const producto = await respuesta.json();
        console.log("Producto cargado:", producto);


        // =========================
        // SLIDER
        // =========================
        const slider = document.querySelector(".slider");
        const miniaturas = document.querySelectorAll(".card img");

        slider.innerHTML = "";

        producto.imagenes?.forEach((imagen) => {
            const slide = document.createElement("div");
            slide.classList.add("slide");

            const img = document.createElement("img");
            img.src = obtenerRutaImagen(imagen);

            slide.appendChild(img);
            slider.appendChild(slide);
        });

        miniaturas.forEach((miniatura, index) => {

            if (producto.imagenes[index]) {
                miniatura.src = obtenerRutaImagen(producto.imagenes[index]);
            }

            miniatura.addEventListener("click", () => {
                slider.style.transform = `translateX(-${index * 100}%)`;

                miniaturas.forEach(m => m.classList.remove("active"));
                miniatura.classList.add("active");
            });
        });

        if (miniaturas.length > 0) {
            miniaturas[0].classList.add("active");
        }


        // =========================
        // TEXTO
        // =========================
        document.querySelector(".titulo h1").textContent = producto.nombre;

        const precio = Number(producto.precio);

        document.querySelector(".preciomain p").textContent =
            `$ ${precio.toLocaleString("es-AR")}`;

        document.querySelector(".precioimpuesto p").innerHTML = `
            Precio con imp. nacionales: $ ${(precio * 1.2).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            <br>
            O 3 cuotas sin interés de $ ${(precio / 3).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
        `;


// =========================
// TALLES
// =========================
const contenedorTalles = document.querySelector(".tallescontenedor");
contenedorTalles.innerHTML = "";

producto.talles.forEach(item => {

    const div = document.createElement("div");
    div.classList.add("talles");

    // Guardamos datos en el botón
    div.dataset.id = item.id;
    div.dataset.nombre = item.nombre;
    div.dataset.stock = item.stock;

    const p = document.createElement("p");
    p.textContent = item.nombre;

    div.appendChild(p);
    contenedorTalles.appendChild(div);

});

const textoTalle = document.querySelector(".textoTalle");
const botonesTalles = document.querySelectorAll(".talles");

botonesTalles.forEach(talle => {

    talle.addEventListener("click", () => {

        botonesTalles.forEach(t => t.classList.remove("active"));

        talle.classList.add("active");

        // Ahora guardamos el ID
        talleSeleccionado = Number(talle.dataset.id);

        stockSeleccionado = Number(talle.dataset.stock);

        // Para mostrar en pantalla usamos el nombre
        textoTalle.textContent = `Talle: ${talle.dataset.nombre}`;

        console.log("ID:", talleSeleccionado);
        console.log("Nombre:", talle.dataset.nombre);
        console.log("Stock:", stockSeleccionado);

    });

});

        // =========================
        // DETALLES
        // =========================
        const contenidoOculto = document.querySelector(".contenidoOculto");
        contenidoOculto.innerHTML = "";

        producto.detalles.forEach(d => {
            const p = document.createElement("p");
            p.textContent = d;
            contenidoOculto.appendChild(p);
        });


// =========================
// BOTÓN CARRITO
// =========================
const btnCarrito = document.querySelector(".agregaralcarro");

btnCarrito.addEventListener("click", async () => {

    if (!getToken()) {
        alert("Tenés que iniciar sesión para comprar");
        return;
    }

    if (!talleSeleccionado) {
        alert("Seleccioná un talle");
        return;
    }

    if (stockSeleccionado <= 0) {
        alert("Sin stock disponible");
        return;
    }

    // <-- AGREGÁ ESTO
    console.log("Talle seleccionado:", talleSeleccionado);

    const exito = await agregarAlCarritoAPI({
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagenes[0],
        talle: talleSeleccionado,
        cantidad: 1
    });

    if (exito && typeof actualizarContador === 'function') {
        actualizarContador();
    }
});
        

    } catch (error) {
        console.error("Error al cargar producto:", error);
    }
}


// ejecutar
iniciarPagina();



// =========================================================================
// ACORDEONES
// =========================================================================

const titulo1 = document.querySelector(".apartado");
const contenido1 = document.querySelector(".contenidoOculto");
const icono1 = document.querySelector(".iconoabierto");

if (titulo1) {
    titulo1.addEventListener("click", () => {
        contenido1.classList.toggle("abierto");
        icono1.classList.toggle("abiertoicono");
    });
}

const titulo2 = document.querySelector(".apartado2");
const contenido2 = document.querySelector(".contenidoOculto2");
const icono2 = document.querySelector(".iconoabierto2");

if (titulo2) {
    titulo2.addEventListener("click", () => {
        contenido2.classList.toggle("abierto");
        icono2.classList.toggle("abiertoicono");
    });
}