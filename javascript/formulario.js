// Escuchamos el evento 'submit' del formulario para interceptar el envío de datos
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Detiene el comportamiento nativo del navegador

    // Creamos el objeto FormData para enviar texto + imágenes
    const formData = new FormData();

    // 1. Capturamos los valores de los campos
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const detalle = document.getElementById('detalle').value;
    const tipologia = document.getElementById('tipologia').value;

    // Capturamos el color seleccionado
    const colorSeleccionado = document.querySelector('input[name="color"]:checked');

    if (!colorSeleccionado) {
        alert('Debes seleccionar un color antes de guardar el producto.');
        return;
    }

    const colorOriginal = colorSeleccionado.value;

    // Normalizamos el color
    const colorLimpio = colorOriginal.toLowerCase().trim();

    // Adjuntamos los datos al FormData
    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('detalle', detalle);
    formData.append('tipologia', tipologia);
    formData.append('color', colorLimpio);

    // 2. Procesamos talles y stock
    const checkboxesTalles = document.querySelectorAll('input[name="talles"]:checked');
    const listaTallesYStock = [];

    checkboxesTalles.forEach(checkbox => {
        const talleNombre = checkbox.value;
        const stockInput = document.querySelector(`input[name="stock_${talleNombre}"]`);
        const stockValor = stockInput && stockInput.value ? parseInt(stockInput.value) : 0;

        listaTallesYStock.push({
            talle: talleNombre,
            stock: stockValor
        });
    });

    formData.append('tallesYStock', JSON.stringify(listaTallesYStock));

    // 3. Procesamos las imágenes
    const inputsImagenes = document.querySelectorAll('input[name="imagenes"]');

    inputsImagenes.forEach((input) => {
        if (input.files && input.files[0]) {
            formData.append('imagenes', input.files[0]);
        }
    });

    try {
        const respuesta = await fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            body: formData
        });

        if (respuesta.ok) {
            alert('¡Producto y variantes guardados con éxito en la base de datos!');
            document.getElementById('productForm').reset();
        } else {
            const errorData = await respuesta.json().catch(() => ({}));
            alert(`Hubo un error en el servidor: ${errorData.mensaje || 'No se pudo guardar el producto.'}`);
        }

    } catch (error) {
        console.error('Error de red/conexión:', error);
        alert('Error de conexión: No se pudo establecer comunicación con el backend (server.js). Asegúrate de que esté encendido.');
    }
});