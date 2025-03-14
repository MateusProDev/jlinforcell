import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import "./CategoryProducts.css";

const CategoryProducts = () => {
  const { categoryKey } = useParams(); // Ex.: "Fones-de-ouvidos"
  const [category, setCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = doc(db, "lojinha", "produtos");

    const unsubscribe = onSnapshot(productsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Dados carregados do Firestore em CategoryProducts:", data);
        const categories = data.categories || {};

        // Converte hífens em espaços para buscar no Firestore
        const firestoreCategoryKey = categoryKey.replace(/-/g, " ");

        if (categories[firestoreCategoryKey]) {
          const productsArray = Object.entries(categories[firestoreCategoryKey].products || {}).map(
            ([productName, productData]) => ({
              name: productName,
              ...productData,
            })
          );
          setCategory({ title: firestoreCategoryKey, products: productsArray });
        } else {
          setCategory(null);
          console.log(`Categoria '${firestoreCategoryKey}' não encontrada em 'lojinha/produtos'`);
        }
      } else {
        console.log("Documento 'produtos' não encontrado em 'lojinha'");
        setCategory(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar produtos:", error);
      setCategory(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryKey]);

  const filteredProducts = loading || !category
    ? []
    : category.products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const visibleProducts = expanded ? filteredProducts : filteredProducts.slice(0, 2);

  const toggleExpansion = () => {
    setExpanded((prev) => !prev);
  };

  if (loading) return <div>Carregando produtos...</div>;
  if (!category) return <div>Categoria '{categoryKey.replace(/-/g, " ")}' não encontrada.</div>;

  return (
    <div className="category-products-container">
      <h1>{category.title}</h1>
      <section className="search-bar">
        <input
          type="text"
          placeholder={`Pesquisar em ${category.title}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      <section className="category-products-list">
        {filteredProducts.length === 0 ? (
          <p>Nenhum produto encontrado nesta categoria.</p>
        ) : (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <Link
                key={product.name}
                to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`} // Mantém hífens na URL
                className="product-item-link"
              >
                <div className="product-item">
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                  <p>{product.name} - R${product.price.toFixed(2)}</p>
                  {product.description && <p>{product.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
        {filteredProducts.length > 2 && (
          <button className="see-more-btn" onClick={toggleExpansion}>
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </section>
    </div>
  );
};

export default CategoryProducts;