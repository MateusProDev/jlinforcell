import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import './components.css';

function ListOS() {
  const [ordens, setOrdens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [osToClose, setOsToClose] = useState(null);

  useEffect(() => {
    const fetchOS = async () => {
      const querySnapshot = await getDocs(collection(db, "ordensDeServico"));
      const listaOS = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Garantir que a data de entrada seja convertida
          datas: {
            ...data.datas,
            entrada: data.datas?.entrada?.toDate() || null,
            saida: data.datas?.saida ? data.datas.saida.toDate() : null
          }
        };
      });
      setOrdens(listaOS);
    };
    fetchOS();
  }, []);

  const handleCloseOS = async () => {
    if (osToClose) {
      await updateDoc(doc(db, "ordensDeServico", osToClose.id), {
        "datas.saida": new Date(),
        "status": "Encerrada"
      });
      setShowModal(false);
      alert("Ordem de serviço encerrada com sucesso!");
      // Atualizar a lista após fechar
      const updatedOrdens = ordens.map(os => {
        if (os.id === osToClose.id) {
          return { ...os, datas: { ...os.datas, saida: new Date() }, status: "Encerrada" };
        }
        return os;
      });
      setOrdens(updatedOrdens);
    }
  };

  return (
    <div className="container">
      <h2>Lista de Ordens de Serviço</h2>
      {ordens.length === 0 ? (
        <p>Nenhuma ordem de serviço cadastrada.</p>
      ) : (
        ordens.map((os) => (
          <div key={os.id} className="os-card">
            <h3>{os.numeroOS}</h3>
            <p><strong>Cliente:</strong> {os.cliente?.nome}</p>
            <p><strong>Contato:</strong> {os.cliente?.contato}</p>
            <p><strong>Modelo:</strong> {os.aparelho?.modelo}</p>
            <p><strong>Defeito:</strong> {os.aparelho?.reclamacao}</p>
            <p><strong>Data Entrada:</strong> {os.datas?.entrada?.toLocaleDateString()}</p>
            {os.datas?.saida && (
              <p><strong>Data Saída:</strong> {os.datas?.saida.toLocaleDateString()}</p>
            )}
            {os.status !== "Encerrada" && (
              <button onClick={() => { setOsToClose(os); setShowModal(true); }}>
                Finalizar OS
              </button>
            )}
          </div>
        ))
      )}
      <Link to="/">
        <button style={{ marginTop: '20px' }}>Cadastrar Nova OS</button>
      </Link>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Você tem certeza que deseja finalizar esta Ordem de Serviço?</h4>
            <button onClick={handleCloseOS}>Sim</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListOS;
