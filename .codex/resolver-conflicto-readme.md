# Resolver conflicto README

- Fecha: 2026-08-04
- Titulo del PR: Resolver conflicto README
- Descripcion de los cambios: Se resolvio el conflicto `modify/delete` de `README.md` conservando la portada del producto basada en `Alcance.pdf`.
- Documentos relacionados: `README.md`, `Alcance.pdf`, `.codex/actualizar-readme-alcance.md`
- Autor: Codex

## Explicacion profunda de los cambios

Durante el merge de `origin/main` sobre `feature/agents`, Git informo un conflicto `modify/delete`: `README.md` fue eliminado en `origin/main` y modificado en la rama del PR.

Este tipo de conflicto no inserta marcadores `<<<<<<<`, `=======` o `>>>>>>>` dentro del archivo. Git deja la version modificada en el working tree y requiere decidir si se conserva el archivo o si se acepta la eliminacion.

Como el objetivo del PR es que el repositorio muestre una portada basada en `Alcance.pdf`, se conserva `README.md` y se registra esta resolucion para futuros agentes.
