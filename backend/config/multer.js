const multer = require("multer");
const path = require("path");

// Configuración del almacenamiento de las imágenes
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, path.join(__dirname, "../uploads"));

    },

    filename: (req, file, cb) => {

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, uniqueSuffix + path.extname(file.originalname));

    }

});

// Creamos la instancia de multer
const upload = multer({

    storage

});

// Exportamos para usarlo en cualquier ruta
module.exports = upload;