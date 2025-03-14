import React, { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./BannerAdmin.css";

const BannerAdmin = () => {
  const [file, setFile] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const bannersCollection = collection(db, "bannersLojinha");
      const snapshot = await getDocs(bannersCollection);
      const bannersData = snapshot.docs.map(doc => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
      }));
      setBanners(bannersData);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecione uma imagem antes de enviar.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck"); // Seu upload preset do Cloudinary
    formData.append("cloud_name", "doeiv6m4h"); // Seu Cloud Name do Cloudinary

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );

      const imageUrl = response.data.secure_url;

      await addDoc(collection(db, "bannersLojinha"), { imageUrl });

      setFile(null);
      fetchBanners(); // Atualiza a lista após upload
    } catch (error) {
      setError("Erro ao enviar imagem.");
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bannersLojinha", id));
      fetchBanners(); // Atualiza lista após exclusão
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
    }
  };

  return (
    <div className="banner-admin">
      <h2>Gerenciar Banners</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Enviando..." : "Adicionar Banner"}
      </button>
      {error && <p className="error">{error}</p>}

      <ul>
        {banners.map((banner) => (
          <li key={banner.id}>
            <img src={banner.imageUrl} alt="Banner" className="banner-preview" />
            <button onClick={() => handleDelete(banner.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BannerAdmin;
