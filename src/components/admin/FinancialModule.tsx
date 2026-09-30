import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  CreditCard,
  QrCode,
  Calendar,
  Lock,
  PieChart,
} from 'lucide-react';

export const FinancialModule: React.FC = () => {
  const { financial, addFinancialTransaction, professionals } = useClinic();
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [category, setCategory] = useState<any>('insumos');
  const [method, setMethod] = useState<any>('pix');

  const totalReceitas = financial
    .filter((f) => f.type === 'receita')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDespesas = financial
    .filter((f) => f.type === 'despesa')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRepasses = financial
    .filter((f) => f.professionalCutAmount)
    .reduce((acc, curr) => acc + (curr.professionalCutAmount || 0), 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  const filteredFinancial = financial.filter((f) => {
    if (filterType === 'all') return true;
    return f.type === filterType;
  });

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    addFinancialTransaction({
      organizationId: 'lucy-clinica-matriz',
      description,
      amount: Number(amount),
      type,
      category,
      paymentMethod: method,
      status: 'pago',
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Gestão Financeira & Faturamento
          </h2>
          <p className="text-xs text-[#52606D]">
            Fluxo de caixa, conciliação de receitas, repasses médicos e despesas operacionais (sem expor anotações médicas).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[40px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Receitas Totais</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
            R$ {totalReceitas.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Consultas & Procedimentos
          </span>
        </div>

        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Despesas Operacionais</span>
          <p className="font-heading text-2xl font-extrabold text-red-600 tabular-nums mt-1">
            R$ {totalDespesas.toFixed(2)}
          </p>
          <span className="text-[11px] text-red-700 font-semibold flex items-center gap-1 mt-1">
            <TrendingDown className="w-3.5 h-3.5" /> Insumos, Aluguel e Serviços
          </span>
        </div>

        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Repasses Médicos Provisionados</span>
          <p className="font-heading text-2xl font-extrabold text-[#185BA6] tabular-nums mt-1">
            R$ {totalRepasses.toFixed(2)}
          </p>
          <span className="text-[11px] text-[#185BA6] font-semibold mt-1 block">
            Corpo clínico (70% - 75%)
          </span>
        </div>

        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Saldo Líquido</span>
          <p className="font-heading text-2xl font-extrabold text-[#17212B] tabular-nums mt-1">
            R$ {saldoLiquido.toFixed(2)}
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Margem clínica saudável
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F5F9FD] border-b border-[#D9DFE5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-[6px] text-xs font-semibold border ${
                filterType === 'all' ? 'bg-[#185BA6] text-white border-[#185BA6]' : 'bg-white border-gray-200'
              }`}
            >
              Todos ({financial.length})
            </button>
            <button
              onClick={() => setFilterType('receita')}
              className={`px-3 py-1 rounded-[6px] text-xs font-semibold border ${
                filterType === 'receita' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('despesa')}
              className={`px-3 py-1 rounded-[6px] text-xs font-semibold border ${
                filterType === 'despesa' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200'
              }`}
            >
              Despesas
            </button>
          </div>

          <span className="text-xs text-[#52606D]">
            Dados contábeis protegidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                <th className="py-3 px-4 font-semibold">Descrição</th>
                <th className="py-3 px-4 font-semibold">Categoria</th>
                <th className="py-3 px-4 font-semibold">Meio</th>
                <th className="py-3 px-4 font-semibold">Data</th>
                <th className="py-3 px-4 font-semibold">Repasse Médico</th>
                <th className="py-3 px-4 font-semibold text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFinancial.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4 font-bold text-[#17212B]">{tx.description}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                      {tx.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase text-gray-600 font-mono text-[10px]">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{tx.dueDate}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {tx.professionalCutAmount ? (
                      <span className="text-emerald-700 font-semibold tabular-nums">
                        R$ {tx.professionalCutAmount.toFixed(2)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold tabular-nums">
                    <span className={tx.type === 'receita' ? 'text-emerald-700' : 'text-red-600'}>
                      {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-md p-6">
            <h3 className="font-heading text-lg font-bold text-[#185BA6] mb-3">
              Novo Lançamento Financeiro
            </h3>

            <form onSubmit={handleCreateTx} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Tipo de Lançamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('receita')}
                    className={`py-2 rounded-[8px] text-xs font-bold border ${
                      type === 'receita' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-gray-200'
                    }`}
                  >
                    Receita (+ Entradas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('despesa')}
                    className={`py-2 rounded-[8px] text-xs font-bold border ${
                      type === 'despesa' ? 'bg-red-50 border-red-500 text-red-800' : 'border-gray-200'
                    }`}
                  >
                    Despesa (- Saídas)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aquisição de Luvas / Manutenção de Ar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  >
                    <option value="consulta">Consulta</option>
                    <option value="procedimento">Procedimento</option>
                    <option value="insumos">Insumos e Farmácia</option>
                    <option value="aluguel">Aluguel do Imóvel</option>
                    <option value="folha">Folha e Salários</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Meio de Pagamento
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#D9DFE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[36px] px-3.5 rounded-[8px] border border-[#D9DFE5] text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold"
                >
                  Lançar no Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
