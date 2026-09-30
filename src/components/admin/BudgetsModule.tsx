import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  DollarSign,
  Plus,
  QrCode,
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  Receipt,
  X,
} from 'lucide-react';

export const BudgetsModule: React.FC = () => {
  const { patients, professionals, addFinancialTransaction } = useClinic();

  const [budgets, setBudgets] = useState<any[]>([
    {
      id: 'orc-01',
      patientName: 'Mariana Costa',
      doctorName: 'Dra. Lúcia Santos',
      date: '2026-04-24',
      items: [
        { desc: 'Consulta Cardiológica Especializada', val: 350 },
        { desc: 'Eletrocardiograma de Repouso (ECG)', val: 120 },
        { desc: 'MAPA 24 Horas Pressão Arterial', val: 280 },
      ],
      total: 750,
      status: 'aprovado',
    },
    {
      id: 'orc-02',
      patientName: 'Roberto Almeida',
      doctorName: 'Dra. Camila Vasconcelos',
      date: '2026-04-22',
      items: [
        { desc: 'Consulta Dermatológica', val: 380 },
        { desc: 'Procedimento de Crioterapia e Biópsia', val: 420 },
      ],
      total: 800,
      status: 'pendente',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPixBudget, setSelectedPixBudget] = useState<any>(null);

  // Form
  const [patientName, setPatientName] = useState('Mariana Costa');
  const [doctorName, setDoctorName] = useState('Dra. Lúcia Santos');
  const [item1, setItem1] = useState('Procedimento Clínico Especializado');
  const [val1, setVal1] = useState(350);

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = {
      id: `orc-${Date.now()}`,
      patientName,
      doctorName,
      date: new Date().toISOString().split('T')[0],
      items: [{ desc: item1, val: Number(val1) }],
      total: Number(val1),
      status: 'pendente',
    };
    setBudgets([newBudget, ...budgets]);
    setIsModalOpen(false);
  };

  const handleApproveAndPay = (budget: any) => {
    addFinancialTransaction({
      organizationId: 'lucy-clinica-matriz',
      patientName: budget.patientName,
      description: `Faturamento Orçamento #${budget.id} - ${budget.items[0].desc}`,
      amount: budget.total,
      type: 'receita',
      category: 'procedimento',
      paymentMethod: 'pix',
      status: 'pago',
      dueDate: budget.date,
      paidAt: new Date().toISOString(),
    });

    setBudgets((prev) =>
      prev.map((b) => (b.id === budget.id ? { ...b, status: 'aprovado' } : b))
    );
    alert('Orçamento faturado com sucesso! Receita integrada ao financeiro.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Orçamentos & Cobrança de Procedimentos
          </h2>
          <p className="text-xs text-[#52606D]">
            Emissão de propostas de tratamento, pacotes de exames e pagamento instantâneo via PIX.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[40px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Novo Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                    #{b.id} • {b.date}
                  </span>
                  <h4 className="font-bold text-sm text-[#17212B]">{b.patientName}</h4>
                  <p className="text-xs text-[#52606D]">Médico(a): {b.doctorName}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    b.status === 'aprovado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {b.status === 'aprovado' ? 'Aprovado & Faturado' : 'Aguardando Pagamento'}
                </span>
              </div>

              <div className="py-3 space-y-1.5">
                {b.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-700">
                    <span>{item.desc}</span>
                    <strong className="text-[#17212B] tabular-nums">R$ {item.val.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 block">Total do Orçamento</span>
                <strong className="text-base font-extrabold text-[#185BA6] tabular-nums">
                  R$ {b.total.toFixed(2)}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPixBudget(b)}
                  className="px-3 py-1.5 rounded-[8px] bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1 transition"
                >
                  <QrCode className="w-3.5 h-3.5" /> Cobrar via PIX
                </button>

                {b.status === 'pendente' && (
                  <button
                    onClick={() => handleApproveAndPay(b)}
                    className="px-3 py-1.5 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold hover:bg-[#144b8a] transition"
                  >
                    Confirmar Pago
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PIX Modal */}
      {selectedPixBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-sm p-6 text-center">
            <h3 className="font-heading text-lg font-bold text-[#17212B]">
              Cobrança Instantânea PIX
            </h3>
            <p className="text-xs text-[#52606D] mt-0.5">
              Paciente: <strong>{selectedPixBudget.patientName}</strong>
            </p>

            <div className="my-4 p-4 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] inline-block">
              <QrCode className="w-40 h-40 text-[#17212B] mx-auto" />
              <p className="text-xs font-extrabold text-[#185BA6] mt-2">
                R$ {selectedPixBudget.total.toFixed(2)}
              </p>
            </div>

            <div className="text-left bg-gray-50 p-2.5 rounded border border-gray-200 text-[11px] font-mono text-gray-600 truncate mb-4">
              00020126580014br.gov.bcb.pix0136lucyclinica@pix.com.br5204000053039865404{selectedPixBudget.total.toFixed(2)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert('Chave PIX Copiada para a área de transferência!')}
                className="flex-1 h-[36px] rounded-[8px] border border-[#D9DFE5] text-xs font-semibold text-[#17212B] flex items-center justify-center gap-1.5 hover:bg-gray-50"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Código
              </button>
              <button
                onClick={() => setSelectedPixBudget(null)}
                className="h-[36px] px-4 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-md p-6">
            <h3 className="font-heading text-lg font-bold text-[#185BA6] mb-3">
              Novo Orçamento de Atendimento
            </h3>
            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Paciente</label>
                <select
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Médico Responsável</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                >
                  {professionals.map((pr) => (
                    <option key={pr.id} value={pr.name}>{pr.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Item / Procedimento</label>
                <input
                  type="text"
                  required
                  value={item1}
                  onChange={(e) => setItem1(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  required
                  value={val1}
                  onChange={(e) => setVal1(Number(e.target.value))}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                />
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
                  Criar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
