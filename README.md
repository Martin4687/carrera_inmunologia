# Carrera Inmune 🦠🏁
Juego de carrera en tablero con preguntas de inmunología (React + Vite).

## Probar en local
```
npm install
npm run dev
```
Abre la URL que muestra la terminal (normalmente http://localhost:5173).

## Subir a Netlify desde GitHub
1. Crea un repositorio en GitHub y sube esta carpeta (`git init`, `git add .`, `git commit`, `git push`).
2. En Netlify: **Add new site → Import an existing project → GitHub** y elige el repo.
3. Netlify lee `netlify.toml` (build: `npm run build`, publicar: `dist`). Pulsa **Deploy**.

Los jugadores y las preguntas se guardan en el navegador (localStorage).
