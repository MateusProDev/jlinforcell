import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateOS from './components/CreateOS';
import ListOS from './components/ListOS';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="navbar">
        <Link to="/">Cadastrar OS</Link>
        <Link to="/listar">Consultar OS</Link>
      </div>
      <Routes>
        <Route path="/" element={<CreateOS />} />
        <Route path="/listar" element={<ListOS />} />
      </Routes>
    </Router>
  );
}

export default App;
