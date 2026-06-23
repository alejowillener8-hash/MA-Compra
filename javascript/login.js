const API_BASE_URL = window.API_BASE_URL;

const form = document.getElementById("form-login");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Error en login");
            return;
        }

        // 🔥 GUARDAR TOKEN
        localStorage.setItem("token", data.token);

        // opcional: guardar usuario también
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("nombre", data.usuario.nombre);

        alert("Login correcto");

        // redirigir
        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});