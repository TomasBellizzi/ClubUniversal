# Fix mensaje password inicial

- Fecha: 2026-08-10
- Titulo del PR: Fix mensaje password inicial
- Descripcion de los cambios: Se mejoro el mensaje de error del cambio obligatorio de contrasena inicial para mostrar los requisitos de la nueva contrasena.
- Documentos relacionados: `frontend/src/pages/CambiarPasswordInicial.jsx`
- Autor: Codex

## Explicacion profunda de los cambios

La pantalla de cambio inicial de contrasena mostraba solamente el mensaje generico `Datos invalidos` cuando el backend rechazaba la nueva contrasena por no cumplir las reglas. Se agrego validacion previa en el frontend para detectar minimo de caracteres, mayuscula y numero antes de enviar la solicitud.

Ademas, si el backend devuelve errores de validacion, el frontend ahora concatena esos mensajes y agrega una descripcion de los requisitos. Tambien se dejo texto de ayuda debajo del campo de nueva contrasena para que el usuario sepa que debe ingresar al menos 8 caracteres, una mayuscula y un numero.
