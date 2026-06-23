// =========================================================================
// CONFIG
// =========================================================================



// =========================================================================
// ELEMENTOS DEL DOM
// =========================================================================

const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartCounter = document.getElementById("cartCounter");


// =========================================================================
// UI: ABRIR / CERRAR CARRITO
// =========================================================================

openCartBtn?.addEventListener("click", () => {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    cargarCarrito();
});

closeCartBtn?.addEventListener("click", cerrarCarrito);

cartOverlay?.addEventListener("click", cerrarCarrito);

function cerrarCarrito() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
}


// =========================================================================
// TOKEN
// =========================================================================

function getToken() {
    return localStorage.getItem("token");
}


// =========================================================================
// OBTENER CARRITO
// =========================================================================

async function obtenerCarrito() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/carrito`, {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        if (!res.ok) throw new Error("Error al obtener carrito");

        return await res.json();

    } catch (error) {
        console.error(error);
        return [];
    }
}


// =========================================================================
// RENDER CARRITO
// =========================================================================

async function cargarCarrito() {

    const carrito = await obtenerCarrito();

    cartItems.innerHTML = "";

    if (!carrito.length) {
        cartItems.innerHTML = "<p class= carritoVacio>Tu carrito está vacío.</p>";
        cartSubtotal.textContent = "$0";
        cartCounter.textContent = "0";
        return;
    }

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach(item => {

        total += Number(item.precio) * item.cantidad;
        cantidadTotal += item.cantidad;

        const div = document.createElement("div");
        div.classList.add("cartItem");

        div.innerHTML = `
    <img
        src="http://localhost:3000${item.imagen}"
        class="cartItemImagen"
        alt="${item.nombre}"
    >

    <div class="cartItemInfo">

        <h3>${item.nombre}</h3>

        <p>Talle: ${item.talle}</p>

        <p class="cartItemPrecio">
            $${Number(item.precio).toLocaleString("es-AR")}
        </p>

        <div class="cartItemBottom">

            <div class="cartCantidad">

                <button
                    onclick="disminuirCantidad('${item.id}')"
                >
                    -
                </button>

                <span>${item.cantidad}</span>

                <button
                    onclick="aumentarCantidad('${item.id}')"
                >
                    +
                </button>

            </div>

            <button
                class="cartEliminar"
                onclick="eliminarProducto('${item.id}')"
            >
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#303030"
                    stroke-width="0.7"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>

                </svg>
            </button>

        </div>

    </div>
`;

        cartItems.appendChild(div);
    });

    cartSubtotal.textContent = `$${total.toLocaleString("es-AR")}`;
    cartCounter.textContent = cantidadTotal;
}





async function aumentarCantidad(id) {

    await fetch(`${API_BASE_URL}/api/carrito/${id}/sumar`, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + getToken()
        }
    });

    cargarCarrito();
}


async function disminuirCantidad(id) {

    await fetch(`${API_BASE_URL}/api/carrito/${id}/restar`, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + getToken()
        }
    });

    cargarCarrito();
}

async function eliminarProducto(id) {

    await fetch(`${API_BASE_URL}/api/carrito/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + getToken()
        }
    });

    cargarCarrito();
}



async function actualizarContador() {
    // 1. Verificamos si el elemento existe en el DOM actual
    const counterElement = document.getElementById("cartCounter");
    
    // Si no existe, no hacemos nada (evitamos el error)
    if (!counterElement) return;

    try {
        const carrito = await obtenerCarrito();
        let cantidad = 0;

        carrito.forEach(item => {
            cantidad += item.cantidad;
        });

        // Solo actualizamos si el elemento existe
        counterElement.textContent = cantidad;
        console.log("Contador actualizado a:", cantidad);
    } catch (error) {
        console.error("Error al actualizar contador:", error);
    }
}

// =========================================================================
// INICIALIZACIÓN
// =========================================================================

// carga contador al inicio
document.addEventListener("DOMContentLoaded", () => {
    cargarCarrito();
});
