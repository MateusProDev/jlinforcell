import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { useReactToPrint } from 'react-to-print';
import './components.css';

function CreateOS() {
  // Estado do formulário
  const [formData, setFormData] = useState({
    numeroOS: '',
    cliente: {
      nome: '',
      endereco: '',
      contato: ''
    },
    aparelho: {
      modelo: '',
      reclamacao: ''
    },
    datas: {
      entrada: new Date(),
      saida: null
    },
    status: 'Aberta'
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const printRef = useRef();

  // Gerar número da OS automaticamente no formato OS-0001
  useEffect(() => {
    const generateOSNumber = async () => {
      try {
        const q = query(collection(db, 'ordensDeServico'), orderBy('numeroOS', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        let nextNumber = 1;
        if (!querySnapshot.empty) {
          const lastOS = querySnapshot.docs[0].data().numeroOS;
          const lastNumber = parseInt(lastOS.split('-')[1]);
          nextNumber = lastNumber + 1;
        }
        
        const formattedNumber = `OS-${nextNumber.toString().padStart(4, '0')}`;
        setFormData(prev => ({
          ...prev,
          numeroOS: formattedNumber
        }));
      } catch (error) {
        console.error("Erro ao gerar número OS:", error);
        setMessage({ text: 'Erro ao gerar número da OS', type: 'error' });
      }
    };

    generateOSNumber();
  }, []);

  // Manipulador de mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('cliente.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          [field]: value
        }
      }));
    } else if (name.startsWith('aparelho.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        aparelho: {
          ...prev.aparelho,
          [field]: value
        }
      }));
    } else if (name === 'dataEntrada') {
      setFormData(prev => ({
        ...prev,
        datas: {
          ...prev.datas,
          entrada: new Date(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Configuração da impressão
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setShowPrintView(false),
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print { 
        body { margin: 0; padding: 0; } 
        .print-page { height: 297mm; width: 210mm; }
      }
    `
  });

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validação dos campos obrigatórios
    if (!formData.cliente.nome || !formData.cliente.contato || 
        !formData.aparelho.modelo || !formData.aparelho.reclamacao) {
      setMessage({ text: 'Preencha todos os campos obrigatórios!', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Adicionar a nova OS no Firestore
      await addDoc(collection(db, 'ordensDeServico'), formData);

      // Mensagem de sucesso com o número da OS
      setMessage({ 
        text: `OS ${formData.numeroOS} cadastrada com sucesso!`, 
        type: 'success' 
      });

      // Mostrar a visualização de impressão
      setShowPrintView(true);
      
      // Resetar formulário (manter número OS e data)
      setFormData(prev => ({
        ...prev,
        cliente: { nome: '', endereco: '', contato: '' },
        aparelho: { modelo: '', reclamacao: '' },
        status: 'Aberta'
      }));

      // Gerar próximo número OS
      const currentNumber = parseInt(formData.numeroOS.split('-')[1]);
      const nextNumber = `OS-${(currentNumber + 1).toString().padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, numeroOS: nextNumber }));

    } catch (error) {
      console.error("Erro ao registrar OS:", error);
      setMessage({ text: 'Erro ao registrar OS. Tente novamente.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar data para input type="date"
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Componente de visualização para impressão
  const PrintView = () => (
    <div className="print-container">
      <div ref={printRef} className="print-content">
        {/* Página de impressão com duas vias */}
        <div className="print-page">
          {/* Via do Cliente */}
          <div className="print-via cliente">
            <div className="print-header">
              <h2>ORDEM DE SERVIÇO</h2>
              <div className="os-info">
                <p><strong>N° OS:</strong> {formData.numeroOS}</p>
                <p><strong>Data:</strong> {formData.datas.entrada.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="print-section">
              <h3>CLIENTE</h3>
              <p><strong>Nome:</strong> {formData.cliente.nome}</p>
              <p><strong>Contato:</strong> {formData.cliente.contato}</p>
              <p><strong>Endereço:</strong> {formData.cliente.endereco || 'Não informado'}</p>
            </div>
            
            <div className="print-section">
              <h3>EQUIPAMENTO</h3>
              <p><strong>Modelo:</strong> {formData.aparelho.modelo}</p>
              <p><strong>Defeito relatado:</strong></p>
              <div className="reclamacao-box">
                {formData.aparelho.reclamacao}
              </div>
            </div>
            
            <div className="print-section">
              <h3>OBSERVAÇÕES</h3>
              <div className="observacoes-box">
                <p>_____________________________________________________</p>
                <p>_____________________________________________________</p>
                <p>_____________________________________________________</p>
              </div>
            </div>
            
            <div className="print-footer">
              <p><strong>Assinatura do Cliente:</strong> _________________________</p>
              <p className="small-text">Via do Cliente - {formData.numeroOS}</p>
            </div>
          </div>

          {/* Via da Loja */}
          <div className="print-via loja">
            <div className="print-header">
              <h2>ORDEM DE SERVIÇO</h2>
              <div className="os-info">
                <p><strong>N° OS:</strong> {formData.numeroOS}</p>
                <p><strong>Data:</strong> {formData.datas.entrada.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="print-section">
              <h3>CLIENTE</h3>
              <p><strong>Nome:</strong> {formData.cliente.nome}</p>
              <p><strong>Contato:</strong> {formData.cliente.contato}</p>
              <p><strong>Endereço:</strong> {formData.cliente.endereco || 'Não informado'}</p>
            </div>
            
            <div className="print-section">
              <h3>EQUIPAMENTO</h3>
              <p><strong>Modelo:</strong> {formData.aparelho.modelo}</p>
              <p><strong>Defeito relatado:</strong></p>
              <div className="reclamacao-box">
                {formData.aparelho.reclamacao}
              </div>
            </div>
            
            <div className="print-section">
              <h3>OBSERVAÇÕES TÉCNICAS</h3>
              <div className="observacoes-box">
                <p>_____________________________________________________</p>
                <p>_____________________________________________________</p>
                <p>_____________________________________________________</p>
              </div>
            </div>
            
            <div className="print-footer">
              <p><strong>Responsável:</strong> _________________________</p>
              <p className="small-text">Via da Loja - {formData.numeroOS}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="print-actions">
        <button onClick={handlePrint} className="btn-primary">
          Imprimir OS
        </button>
        <button 
          onClick={() => setShowPrintView(false)} 
          className="btn-secondary"
        >
          Fechar
        </button>
      </div>
    </div>
  );

  // Renderização principal
  return (
    <div className="container">
      {showPrintView ? (
        <PrintView />
      ) : (
        <>
          <h2>Cadastrar Ordem de Serviço</h2>

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Número OS:</label>
              <input
                type="text"
                name="numeroOS"
                value={formData.numeroOS}
                onChange={handleChange}
                readOnly
                placeholder="Gerado automaticamente"
              />
            </div>

            <div className="form-group">
              <label>Data de Entrada *:</label>
              <input
                type="date"
                name="dataEntrada"
                value={formatDateForInput(formData.datas.entrada)}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nome do Cliente *:</label>
              <input
                type="text"
                name="cliente.nome"
                value={formData.cliente.nome}
                onChange={handleChange}
                placeholder="Nome completo do cliente"
                required
              />
            </div>

            <div className="form-group">
              <label>Contato do Cliente *:</label>
              <input
                type="text"
                name="cliente.contato"
                value={formData.cliente.contato}
                onChange={handleChange}
                placeholder="Telefone ou e-mail para contato"
                required
              />
            </div>

            <div className="form-group">
              <label>Endereço do Cliente:</label>
              <input
                type="text"
                name="cliente.endereco"
                value={formData.cliente.endereco}
                onChange={handleChange}
                placeholder="Endereço completo (opcional)"
              />
            </div>

            <div className="form-group">
              <label>Modelo do Aparelho *:</label>
              <input
                type="text"
                name="aparelho.modelo"
                value={formData.aparelho.modelo}
                onChange={handleChange}
                placeholder="Marca e modelo do equipamento"
                required
              />
            </div>

            <div className="form-group">
              <label>Relato do Problema *:</label>
              <textarea
                name="aparelho.reclamacao"
                value={formData.aparelho.reclamacao}
                onChange={handleChange}
                placeholder="Descreva detalhadamente o problema"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Registrar OS'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default CreateOS;