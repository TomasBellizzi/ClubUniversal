# Corregir visualizacion PDF comprobante cuota

- Fecha: 2026-08-04
- Titulo del PR: Corregir visualizacion PDF comprobante cuota
- Descripcion de los cambios: Se normalizaron las URLs de comprobantes de cuotas para que las rutas locales de uploads se abran desde el backend y se detecten correctamente los PDFs, incluso si falta `VITE_API_URL` en desarrollo.
- Documentos relacionados: AGENTS.md
- Autor: Codex

## Explicacion profunda de los cambios

Los comprobantes guardados localmente pueden persistirse como rutas relativas, por ejemplo `/uploads/comprobantes-cuotas/...pdf`. Al renderizarlas directamente en el frontend, el navegador las pide contra Vite y React Router intenta resolverlas como rutas internas de la SPA, por eso aparece el aviso de que no hay ruta coincidente y el modal muestra la aplicacion en vez del PDF.

Se agrego una normalizacion en las vistas de socio y administrativo para convertir esas rutas relativas a URLs absolutas usando `VITE_API_URL`. Si esa variable no esta definida durante desarrollo, se usa `http://localhost:3000` como fallback para que el comprobante no vuelva a caer en React Router. Tambien se cambio la deteccion de PDFs para ignorar query strings o hashes, y se evita renderizar imagenes cuando no existe URL de comprobante.
