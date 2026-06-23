const API_BASE_URL = "http://localhost:3000";

const form = document.getElementById("form-register");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("reg-nombre").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    if (!nombre || !email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    try {

        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nombre,
                email,
                password
            })

        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("Cuenta creada correctamente.");

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);
        alert("Error al registrar usuario.");

    }

});