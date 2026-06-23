// ======================================
// MA Urban Finds
// orden.js
// ======================================


// ======================================
// OBTENER ID DEL PRODUCTO
// Recuperamos el producto que el usuario
// seleccionó desde el catálogo.
// ======================================

const productoSeleccionado =
localStorage.getItem("producto");


// ======================================
// VARIABLE GLOBAL
// Guarda el talle elegido.
// ======================================

let talleSeleccionado = null;
let stockSeleccionado = 0;


// ======================================
// OBTENER RUTA DE IMAGEN
// Si la imagen viene desde Node.js,
// agregamos localhost.
// ======================================

function obtenerRutaImagen(urlImagen){

    if(!urlImagen){

        return "imagenes/placeholder.jpg";

    }

    if(urlImagen.startsWith("/uploads")){

        return `http://localhost:3000${urlImagen}`;

    }

    return urlImagen;

}


// ======================================
// FUNCION PRINCIPAL
// Carga toda la información
// del producto.
// ======================================

async function iniciarPagina(){

    try{

        const respuesta =
        await fetch(

            `http://localhost:3000/api/productos/${productoSeleccionado}`

        );


        if(!respuesta.ok){

            throw new Error(
                "Producto no encontrado"
            );

        }


        const producto =
        await respuesta.json();

        console.log(producto);



        // ==========================
        // SLIDER
        // ==========================

        const slider = document.querySelector(".slider");
        const miniaturas = document.querySelectorAll(".card img");

        slider.innerHTML = "";

        if (!producto || miniaturas.length === 0) {
            console.log("Faltan datos");
        } else {
            
            // ⚠️ Agregamos "index" al forEach para saber qué número de imagen estamos creando
            producto.imagenes.forEach((imagen, index) => {

                const slide = document.createElement("div");
                slide.classList.add("slide");

                const img = document.createElement("img");
                img.src = obtenerRutaImagen(imagen);

                // 🔥 LAZY LOADING: Si NO es la primera imagen (index 0), le ponemos lazy
                if (index > 0) {
                    img.loading = "lazy";
                }

                slide.appendChild(img);
                slider.appendChild(slide);  
            });

            miniaturas.forEach((miniatura, index) => {
                if (producto.imagenes[index]) {
                    miniatura.src = obtenerRutaImagen(producto.imagenes[index]);
                    
                    // También le podemos sumar lazy a las miniaturas que no son la primera
                    if (index > 0) {
                        miniatura.loading = "lazy";
                    }
                }

                miniatura.addEventListener("click", () => {
                    slider.style.transform = `translateX(-${index * 100}%)`;

                    miniaturas.forEach(m => {
                        m.classList.remove("active");
                    });

                    miniatura.classList.add("active");
                });
            });

            if (miniaturas.length > 0) {
                miniaturas[0].classList.add("active");
            }
        }



        // ==========================
        // NOMBRE Y PRECIOS
        // ==========================

        const nombreproducto =
        document.querySelector(
            ".titulo h1"
        );

        const precioproducto =
        document.querySelector(
            ".preciomain p"
        );

        const precioimpuesto =
        document.querySelector(
            ".precioimpuesto p"
        );


        nombreproducto.textContent =
        producto.nombre;


        const precio =
        Number(
            producto.precio
        );


        precioproducto.textContent =

        `$ ${precio.toLocaleString(
            "es-AR"
        )}`;


        precioimpuesto.innerHTML =

        `Precio con imp. nacionales:
        $ ${(precio * 1.2).toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}
        <br>
        O 3 cuotas sin interés de
        $ ${(precio / 3).toLocaleString("es-AR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;


// ==========================
// TALLES
// Creamos los botones de talle
// dinámicamente junto con
// el stock de cada uno.
// ==========================

const tallesproducto =
document.querySelector(
    ".tallescontenedor"
);

tallesproducto.innerHTML = "";

producto.talles.forEach(

    item => {

        const divTalle =
        document.createElement(
            "div"
        );

        divTalle.classList.add(
            "talles"
        );

        // Guardamos el stock en el botón
        divTalle.dataset.stock =
        item.stock;

        const pTalle =
        document.createElement(
            "p"
        );

        pTalle.textContent =
        item.nombre;

        divTalle.appendChild(
            pTalle
        );

        tallesproducto.appendChild(
            divTalle
        );

    }

);



// ==========================
// SELECCIONAR TALLE
// Solo puede haber uno activo.
// También guardamos el stock.
// ==========================

const textoTalle =
document.querySelector(
    ".textoTalle"
);

const talles =
document.querySelectorAll(
    ".talles"
);

talles.forEach(

    talle => {

        talle.addEventListener(

            "click",

            ()=>{

                talles.forEach(

                    t => {

                        t.classList.remove(
                            "active"
                        );


                    }

                );

                talle.classList.add(
                    "active"
                );

                talleSeleccionado =
                talle.textContent;

                stockSeleccionado =
                Number(
                    talle.dataset.stock
                );

                textoTalle.textContent =

                `Talle:
                ${talleSeleccionado}`;

            }

        );

    }

);



        // ==========================
        // DETALLES
        // Agregamos la información
        // del producto.
        // ==========================

        const contenidoOculto =
        document.querySelector(
            ".contenidoOculto"
        );

        contenidoOculto.innerHTML = "";

        producto.detalles.forEach(

            detalle => {

                const p =
                document.createElement(
                    "p"
                );

                p.textContent =
                detalle;

                contenidoOculto.appendChild(
                    p
                );

            }

        );



        // ==========================
        // BOTON AGREGAR AL CARRITO
        // ==========================

        const btnCarrito =
        document.querySelector(
            ".agregaralcarro"
        );



        btnCarrito.addEventListener(

            "click",

            ()=>{


                // ------------------
                // Verificar talle
                // ------------------

                if(
                    !talleSeleccionado
                ){

                    alert(
                        "Seleccioná un talle"
                    );

                    return;

                }


                console.log(producto);
                // ------------------
                // Crear objeto
                // ------------------

                const productoCarrito = {

                    id: producto.id,

                    nombre: producto.nombre,

                    precio: producto.precio,

                    imagen: producto.imagenes[0],

                    talle: talleSeleccionado,

                // Stock del talle elegido

                    stock: stockSeleccionado,

                    cantidad: 1

                    };



                // ------------------
                // Obtener carrito
                // ------------------

                let carrito =
                obtenerCarrito();



                // ------------------
                // Buscar si ya existe
                // ------------------

                const productoExistente =

                carrito.find(

                    item =>

                    item.id ===
                    productoCarrito.id

                    &&

                    item.talle ===
                    productoCarrito.talle

                );



                // ------------------
                // Si existe
                // aumenta cantidad
                // ------------------

                if (productoExistente) {

                if (
                    productoExistente.cantidad <
                    productoExistente.stock
                ) {

                    productoExistente.cantidad++;

                } else {

                    alert(
                            "No hay más stock disponible."
                        );

                    return;

                }

                } else {

                    carrito.push(
                        productoCarrito
                    );

                }



                // ------------------
                // Guardar carrito
                // ------------------

                guardarCarrito(
                    carrito
                );



                // ------------------
                // Actualizar contador
                // ------------------

                actualizarContador();



                // ------------------
                // Renderizar drawer
                // ------------------

                renderizarCarrito();


                calcularSubtotal();



                console.log(
                    carrito
                );

            }

        );



    }

    catch(error){

        console.error(
            "Error:",
            error
        );

    }

}



// ======================================
// INICIAR PAGINA
// ======================================

iniciarPagina();



// ======================================
// ACORDEON 1
// ======================================

const titulo =
document.querySelector(
    ".apartado"
);

const contenido =
document.querySelector(
    ".contenidoOculto"
);

const icono =
document.querySelector(
    ".iconoabierto"
);


if(titulo){

    titulo.addEventListener(

        "click",

        ()=>{

            contenido.classList.toggle(
                "abierto"
            );

            icono.classList.toggle(
                "abiertoicono"
            );

        }

    );

}



// ======================================
// ACORDEON 2
// ======================================

const titulo2 =
document.querySelector(
    ".apartado2"
);

const contenido2 =
document.querySelector(
    ".contenidoOculto2"
);

const icono2 =
document.querySelector(
    ".iconoabierto2"
);


if(titulo2){

    titulo2.addEventListener(

        "click",

        ()=>{

            contenido2.classList.toggle(
                "abierto"
            );

            icono2.classList.toggle(
                "abiertoicono"
            );

        }

    );

}