import React, { useState } from 'react';
import Papa from 'papaparse';
import { subDays, isAfter, parse } from 'date-fns';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const CSVImporter = ({ onDataProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";", // Forçado para o padrão do seu arquivo
      complete: (results) => {
        try {
          const processedData = processCSVData(results.data);
          onDataProcessed(processedData);
          setSuccess(true);
          setIsProcessing(false);
        } catch (err) {
          setError('Erro ao processar os dados. Verifique se o formato está correto.');
          setIsProcessing(false);
        }
      },
      error: (err) => {
        setError('Erro ao ler o arquivo CSV.');
        setIsProcessing(false);
      }
    });
  };

  const processCSVData = (data) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const customers = {};

    data.forEach((row) => {
      // 1. Filtro de Cancelados
      const isCancelled = row['CANCELADO']?.toLowerCase().trim() === 'sim';
      if (isCancelled) return;

      // 2. Filtro de Tipo (Venda)
      const isSale = row['TIPO']?.toLowerCase().trim() === 'venda';
      if (!isSale) return;

      // 3. Filtro de Cliente Genérico
      const customerName = row['CLIENTE']?.trim();
      if (!customerName || customerName.toUpperCase().includes('CONSUMIDOR')) return;

      // 4. Filtro de Data (Últimos 30 dias)
      // O formato vindo é "DD/MM/YYYY HH:mm:ss" - pegamos apenas a data
      try {
        const datePart = row['DATA'].split(' ')[0];
        const orderDate = parse(datePart, 'dd/MM/yyyy', new Date());
        if (!isAfter(orderDate, thirtyDaysAgo)) return;
      } catch (e) {
        return;
      }

      // 5. Cálculo de Pontos (Total - Frete)
      // Substitui vírgula por ponto para o JavaScript entender o número
      const totalStr = String(row['TOTAL'] || '0').replace(',', '.');
      const freightStr = String(row['R$ FRETE'] || '0').replace(',', '.');
      
      const total = parseFloat(totalStr);
      const freight = parseFloat(freightStr);
      const pointsGenerated = Math.floor(total - freight);

      if (pointsGenerated <= 0) return;

      if (!customers[customerName]) {
        customers[customerName] = { 
          name: customerName, 
          points: 0, 
          orders: [] 
        };
      }

      customers[customerName].points += pointsGenerated;
      customers[customerName].orders.push({
        id: row['PEDIDO'],
        date: row['DATA'],
        points: pointsGenerated
      });
    });

    return Object.values(customers);
  };

  return (
    <div className="glass p-6 sm:p-10 flex flex-col items-center">
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6 transition-all ${
        success ? 'bg-success/10 text-success' : 
        error ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
      }`}>
        {isProcessing ? <Loader2 className="animate-spin" size={24} /> : 
         success ? <CheckCircle2 size={24} /> : 
         error ? <AlertCircle size={24} /> : <Upload size={24} />}
      </div>

      <h2 className="text-xl font-bold mb-2">
        {isProcessing ? 'Processando Planilha...' : 
         success ? 'Importação Concluída!' : 
         error ? 'Falha na Importação' : 'Importar Novo CSV'}
      </h2>
      
      <p className="text-text-muted text-sm text-center mb-8 max-w-sm">
        {error || 'Selecione o arquivo de pedidos extraído do seu sistema para atualizar os saldos dos clientes.'}
      </p>

      {!isProcessing && (
        <label className="btn btn-primary cursor-pointer">
          <input 
            type="file" 
            className="hidden" 
            accept=".csv" 
            onChange={handleFileUpload} 
          />
          {success ? 'Selecionar outro arquivo' : 'Selecionar Arquivo'}
        </label>
      )}

      {success && (
        <p className="mt-4 text-xs text-success font-medium">
          Dica: Os novos dados serão sincronizados com o Supabase automaticamente.
        </p>
      )}
    </div>
  );
};

export default CSVImporter;
