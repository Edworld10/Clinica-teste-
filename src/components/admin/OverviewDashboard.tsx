import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Users,
  DoorClosed,
  Clock,
  Search,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface OverviewDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigateTab }) => {
  const { appointments, queue, inventory, financial, rooms, callPatientToRoom } = useClinic();
  const { currentUser } = useAuth();

  const [chartMetric, setChartMetric] = useState<'faturamento' | 'atendimentos'>('faturamento');
  const [inventorySearch, setInventorySearch] = useState('');

  // KPIs
  const totalRevenueDay = financial
    .filter((f) => f.type === 'receita')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const waitingPatientsCount = queue.filter(
    (q) => q.status === 'esperando_triagem' || q.status === 'aguardando_medico'
  ).length;

  const totalAptsCount = appointments.length;
  const activeRoomsCount = rooms.filter((r) => r.active).length;

  // Inventory preview
  const filteredInventory = inventory
    .filter((item) => item.name.toLowerCase().includes(inventorySearch.toLowerCase()))
    .slice(0, 5);

  // 7-day simulated trend data for chart
  const last7Days = [
    { day: '18 abr.', faturamento: 4950, atendimentos: 18, height: '48%' },
    { day: '19 abr.', faturamento: 4120, atendimentos: 15, height: '40%' },
    { day: '20 abr.', faturamento: 4580, atendimentos: 17, height: '45%' },
    { day: '21 abr.', faturamento: 6100, atendimentos: 22, height: '60%' },
    { day: '22 abr.', faturamento: 6750, atendimentos: 24, height: '66%' },
    { day: '23 abr.', faturamento: 7190, atendimentos: 26, height: '70%' },
    { day: '24 abr.', faturamento: 7842.5, atendimentos: 28, height: '82%', isToday: true },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle (Image 2 style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#17212B]">Visão geral</h1>
          <p className="text-xs text-[#52606D]">
            Acompanhe o desempenho da sua clínica médica em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-[#D9DFE5] rounded-[10px] px-3 py-2 text-xs font-semibold text-[#17212B] flex items-center gap-2 shadow-xs">
            <Calendar className="w-4 h-4 text-[#185BA6]" />
            <span>Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards (Identical layout to 02-painel-administrativo.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento do dia */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#52606D] font-medium">Vendas e Atendimentos do dia</span>
            <p className="font-heading text-2xl font-extrabold text-[#17212B] tabular-nums">
              R$ 7.842,50
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>▲ +12% em relação a ontem</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-[#185BA6] rounded-[10px]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Pacientes do dia */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#52606D] font-medium">Pacientes Agendados</span>
            <p className="font-heading text-2xl font-extrabold text-[#17212B] tabular-nums">
              {totalAptsCount > 0 ? totalAptsCount : 28}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>▲ +3% em relação à semana</span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 text-[#1E675F] rounded-[10px]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Ocupação de Salas */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#52606D] font-medium">Salas & Consultórios Ativos</span>
            <p className="font-heading text-2xl font-extrabold text-[#17212B] tabular-nums">
              {activeRoomsCount} salas
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#185BA6]">
              <DoorClosed className="w-3.5 h-3.5" />
              <span>85% de taxa de ocupação</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-[10px]">
            <DoorClosed className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Fila em Espera */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#52606D] font-medium">Em Triagem e Fila</span>
            <p className="font-heading text-2xl font-extrabold text-[#17212B] tabular-nums">
              {waitingPatientsCount}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Tempo médio de espera: 12 min</span>
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-[10px]">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Estoque & Fila) + Right Column (Gráficos & Últimas Vendas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Estoque por lote (Matches image 2) */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9DFE5]">
              <div>
                <h3 className="font-heading text-base font-bold text-[#17212B]">
                  Estoque por lote & medicamentos
                </h3>
                <p className="text-xs text-[#52606D]">
                  Consulte a disponibilidade, lotes e vencimentos dos insumos médicos.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar apresentação..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B] focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[#52606D]">
                    <th className="py-2 font-semibold">Produto / Apresentação</th>
                    <th className="py-2 font-semibold">Lote</th>
                    <th className="py-2 font-semibold">Validade</th>
                    <th className="py-2 font-semibold">Estoque</th>
                    <th className="py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.currentQuantity <= item.minQuantity;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 font-bold text-[#17212B]">{item.name}</td>
                        <td className="py-2.5 text-[#52606D]">{item.batchNumber}</td>
                        <td className="py-2.5 text-[#52606D]">{item.expirationDate}</td>
                        <td className="py-2.5 font-semibold text-[#17212B]">
                          {item.currentQuantity} {item.unit}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isLow ? 'Atenção' : 'Regular'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-gray-100 mt-3 text-right">
              <button
                onClick={() => onNavigateTab('estoque')}
                className="text-xs font-bold text-[#185BA6] hover:underline"
              >
                Ver todo o estoque &gt;
              </button>
            </div>
          </div>

          {/* Card: Fila de recepção & Triagem (Matches image 2) */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <div>
                <h3 className="font-heading text-base font-bold text-[#17212B]">
                  Fila de Recepção & Triagem
                </h3>
                <p className="text-xs text-[#52606D]">
                  Pacientes aguardando acolhimento da equipe clínica e médica.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('recepcao')}
                className="text-xs font-bold text-[#185BA6] hover:underline"
              >
                Ver todas &gt;
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[#52606D]">
                    <th className="py-2 font-semibold">Paciente</th>
                    <th className="py-2 font-semibold">Médico(a)</th>
                    <th className="py-2 font-semibold">Senha</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.slice(0, 4).map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-bold text-[#17212B]">{entry.patientName}</td>
                      <td className="py-2.5 text-[#52606D]">{entry.professionalName}</td>
                      <td className="py-2.5 font-mono text-[#185BA6] font-bold">
                        {entry.ticketNumber}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            entry.status === 'finalizado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.status === 'em_consulta'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {entry.status === 'esperando_triagem'
                            ? 'Aguardando Triagem'
                            : entry.status === 'aguardando_medico'
                            ? 'Aguardando Médico'
                            : entry.status === 'em_consulta'
                            ? 'Em Consulta'
                            : 'Finalizado'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {entry.status !== 'finalizado' && (
                          <button
                            onClick={() => callPatientToRoom(entry.id)}
                            className="px-2.5 py-1 rounded bg-[#185BA6] text-white text-[11px] font-semibold hover:bg-[#144b8a]"
                          >
                            Chamar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Vendas / Atendimentos nos últimos 7 dias (Bar Chart identical to image 2) */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <div>
                <h3 className="font-heading text-base font-bold text-[#17212B]">
                  Atendimentos nos últimos 7 dias
                </h3>
                <p className="text-xs text-[#52606D]">Fluxo diário de consultas e exames</p>
              </div>
              <select
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value as any)}
                className="text-xs bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] px-2.5 py-1 text-[#17212B]"
              >
                <option value="faturamento">Faturamento (R$)</option>
                <option value="atendimentos">Volume de Pacientes</option>
              </select>
            </div>

            {/* Simulated Clean Bar Chart (Fidelity to Image 2) */}
            <div className="mt-6 pt-4">
              <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-gray-200">
                {last7Days.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover or today badge */}
                    {item.isToday && (
                      <span className="absolute -top-7 bg-[#17212B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                        R$ 7.842,50
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t-[4px] transition-all duration-300 ${
                        item.isToday
                          ? 'bg-[#1E675F] group-hover:bg-[#154e48]'
                          : 'bg-[#55A69E] group-hover:bg-[#438a83]'
                      }`}
                      style={{ height: item.height }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart Submetrics */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-2">
                <div className="p-3 bg-[#F5F9FD] rounded-[8px] border border-[#D9DFE5]">
                  <span className="text-[11px] text-[#52606D]">Total no período</span>
                  <p className="font-heading text-base font-extrabold text-[#17212B] tabular-nums mt-0.5">
                    R$ 52.691,20
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-700">▲ +18%</span>
                </div>
                <div className="p-3 bg-[#F5F9FD] rounded-[8px] border border-[#D9DFE5]">
                  <span className="text-[11px] text-[#52606D]">Média diária</span>
                  <p className="font-heading text-base font-extrabold text-[#17212B] tabular-nums mt-0.5">
                    R$ 7.527,31
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-700">▲ +18%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Últimas Vendas / Faturamento sem dados clínicos sensíveis (Image 2) */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <div>
                <h3 className="font-heading text-base font-bold text-[#17212B]">
                  Últimos recebimentos
                </h3>
                <p className="text-xs text-[#52606D]">
                  Transações financeiras (sem expor prontuários clínicos sensíveis)
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('financeiro')}
                className="text-xs font-bold text-[#185BA6] hover:underline"
              >
                Ver todos &gt;
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[#52606D]">
                    <th className="py-2 font-semibold">Horário</th>
                    <th className="py-2 font-semibold">Paciente</th>
                    <th className="py-2 font-semibold">Meio</th>
                    <th className="py-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financial
                    .filter((f) => f.type === 'receita')
                    .slice(0, 5)
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/50">
                        <td className="py-2 text-[#52606D]">
                          {tx.paidAt ? new Date(tx.paidAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '14:32'}
                        </td>
                        <td className="py-2 font-semibold text-[#17212B]">
                          {tx.patientName || 'Paciente Particular'}
                        </td>
                        <td className="py-2 text-[#52606D] uppercase text-[10px]">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2 font-bold text-[#17212B] text-right tabular-nums">
                          R$ {tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
