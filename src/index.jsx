import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Criação do root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Registro do Service Worker (opcional, pode remover se quiser)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((reg) => console.log('Service Worker registrado com sucesso:', reg))
      .catch((err) => console.error('Erro ao registrar Service Worker:', err));
  });
}

// Renderização da aplicação
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
