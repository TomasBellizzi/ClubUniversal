# Ajustar responsive footer contenido

- Fecha: 2026-08-04
- Titulo del PR: Ajustar responsive footer contenido
- Descripcion de los cambios: Se ajustaron alturas y margenes de paginas para evitar espacio blanco excesivo entre el contenido principal y el footer, especialmente en cuotas admin.
- Documentos relacionados: `frontend/src/components/Layout.jsx`, `frontend/src/pages/CuotasAdminPage.jsx`, `frontend/src/styles/CuotasAdmin.css`, `frontend/src/styles/Footer.css`, `frontend/src/styles/HomePage.css`, `frontend/src/styles/HomePageUser.css`, `frontend/src/styles/SocioEntradas.css`
- Autor: Codex

## Explicacion profunda de los cambios

El layout general contiene el footer dentro de la estructura principal de la aplicacion. Varias paginas internas usaban alturas basadas en `100vh`, lo que duplicaba el alto util del viewport y generaba scroll o espacio blanco innecesario antes de llegar al footer.

Se redujeron esas alturas internas a valores automaticos para que el contenido no duplique el alto util. Luego se restauro una estructura de footer al fondo: `Layout` envuelve el contenido en `.app-main`, que usa flex en columna y ocupa el espacio disponible antes del footer.

En `CuotasAdminPage` se reemplazaron margenes grandes por una clase especifica y el card principal puede ocupar el espacio disponible entre header y footer. El listado paso a `.cuotas-list`, con altura maxima responsive en desktop y sin scroll interno en mobile.
