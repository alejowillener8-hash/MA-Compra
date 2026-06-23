
// ==========================
// OCULTAR HEADER
// ==========================

const header = document.querySelector("header");
const compra = document.querySelector(".contenedorcompra");

let posicionAnteriorScroll = window.scrollY;

window.addEventListener("scroll", () => {
    const posicionActualScroll = window.scrollY;

    if (posicionActualScroll < 50) {
        header.classList.remove("header-oculto");
        header.classList.remove("header-sube");

        if (compra) {
            compra.classList.remove("header-visible");
        }
        return;
    }

    if (posicionActualScroll > posicionAnteriorScroll) {
        header.classList.add("header-oculto");
        header.classList.remove("header-sube");

        if (compra) {
            compra.classList.remove("header-visible");
        }
    } else {
        header.classList.remove("header-oculto");
        header.classList.add("header-sube");

        if (compra) {
            compra.classList.add("header-visible");
        }
    }

    posicionAnteriorScroll = posicionActualScroll;
});


// ==========================
// BOTONES PARA ORDENAR
// ==========================

const boton1 = document.querySelector("#boton-1");

if (boton1) {
    boton1.addEventListener("click", () => {
        localStorage.setItem("producto", 1);
    });
}

const boton2 = document.querySelector("#boton-2");

if (boton2) {
    boton2.addEventListener("click", () => {
        localStorage.setItem("producto", 2);
    });
}


// ==========================
// DROPDOWN USUARIO
// ==========================

const userButton = document.getElementById("userButton");
const userDropdown = document.getElementById("userDropdown");

function renderUserMenu() {
    const nombre = localStorage.getItem("nombre");

    if (!userDropdown) return;

    if (nombre) {
        userDropdown.innerHTML = `
            <a href="perfil.html">Perfil</a>
            <a href="configuracion.html">Configuración</a>
            <a href="pedidos.html">Pedidos</a>
            <a href="#" id="btn-logout" class="logout">Cerrar sesión</a>
        `;
    } else {
        userDropdown.innerHTML = `
            <a href="login.html">Iniciar sesión</a>
            <a href="register.html">Registrarse</a>
        `;
    }
}

// ejecutar al cargar
renderUserMenu();


// ==========================
// TOGGLE DROPDOWN
// ==========================

if (userButton && userDropdown) {
    userButton.addEventListener("click", (e) => {
        e.stopPropagation();

        userDropdown.classList.toggle("show");

        // 🔥 BLOQUEAR SCROLL CUANDO ESTÁ ABIERTO
        if (userDropdown.classList.contains("show")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });

    document.addEventListener("click", () => {
        userDropdown.classList.remove("show");

        // 🔥 RESTAURAR SCROLL
        document.body.style.overflow = "";
    });

    // 🔥 CERRAR SI HACES SCROLL
    window.addEventListener("scroll", () => {
        if (userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show");
            document.body.style.overflow = "";
        }
    });
}


// ==========================
// LOGOUT (EVENT DELEGATION)
// ==========================

document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "btn-logout") {
        localStorage.removeItem("token");
        localStorage.removeItem("nombre");

        renderUserMenu();
        location.reload();
    }
});