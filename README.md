# KryonCraft Website

Sitio estático independiente del código del launcher. La portada muestra la versión más reciente, `versiones.html` contiene el historial y `descargar.html` muestra el aviso de Windows antes de ofrecer el instalador elegido.

La sección de descargas consulta las versiones públicas de `ElAbraxX/Army-Launcher-Releases`. Si todavía no hay releases, la página muestra «Aún no hay instalador publicado» y no ofrece un archivo inexistente.

Para habilitar la descarga:
1. Publica una release en `ElAbraxX/Army-Launcher-Releases` con el instalador llamado `KryonCraft-<versión>-x64-Setup.exe`.
2. Incluye notas de cambios y marca la release como beta si corresponde.
3. El botón y el historial se actualizarán desde GitHub sin modificar la web. Todos los enlaces «Descargar» del sitio pasan primero por `descargar.html`; las versiones del historial conservan la versión seleccionada en la URL.

No copies otros archivos del repositorio privado del launcher a este sitio.
