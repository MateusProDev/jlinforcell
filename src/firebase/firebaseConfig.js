// Importa o que precisa do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase (os seus dados)
const firebaseConfig = {
  apiKey: "AIzaSyAe73I5HG-gJbm8SaoXJ62xUuf6ueBOKKA",
  authDomain: "os-system-10e3b.firebaseapp.com",
  projectId: "os-system-10e3b",
  storageBucket: "os-system-10e3b.firebasestorage.app",
  messagingSenderId: "909448077238",
  appId: "1:909448077238:web:f203465a1ed6b287612b17"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Cria a conexão com o Firestore
const db = getFirestore(app);

// Exporta o db para usar nos componentes
export { db };
