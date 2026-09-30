import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  ShieldCheck,
  Download,
  Calendar,
  Clock,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ReportsAndAuditModule: React.FC = () => {
  const { auditLogs, appointments, rooms, queue, professionals } = useClinic();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'indicadores' | 'auditoria'>('indicadores');

  // Indicators calculations
  const totalApts = appointments.length;
  const noShowApts = appointments.filter((a) => a.status === 'falta').length;
  const noShowRate = totalApts > 0 ? ((noShowApts / totalApts) * 100).toFixed(1) : '0';

  const occupancyRate = '85.4%';
  const avgWaitTimeMinutes = '12.4 min';

  const handleExportAudit = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Data/Hora,Usuário,Papel,Ação,Recurso,Detalhes']
        .concat(
          auditLogs.map(
            (l) =>
              `"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.resource}","${l.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_clinica_lucia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Relatórios Clínicos & Trilha de Auditoria
          </h2>
          <p className="text-xs text-[#52606D]">
            Indicadores de ocupação, absenteísmo e registro imutável de segurança (LGPD e CFM).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F5F9FD] p-1 rounded-[10px] border border-[#D9DFE5] flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('indicadores')}
              className={`px-3 py-1.5 rounded-[8px] transition ${
                activeTab === 'indicadores' ? 'bg-[#185BA6] text-white shadow-xs' : 'text-[#52606D]'
              }`}
            >
              Indicadores Operacionais
            </button>
            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-3 py-1.5 rounded-[8px] transition flex items-center gap-1 ${
                activeTab === 'auditoria' ? 'bg-[#185BA6] text-white shadow-xs' : 'text-[#52606D]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Auditoria de Segurança ({auditLogs.length})
            </button>
          </div>

          {activeTab === 'auditoria' && (
            <button
              onClick={handleExportAudit}
              className="h-[36px] px-3 rounded-[8px] border border-[#D9DFE5] bg-white text-xs font-semibold text-[#17212B] hover:bg-gray-50 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          )}
        </div>
      </div>

      {activeTab === 'indicadores' ? (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
              <span className="text-xs text-[#52606D]">Taxa de Ocupação de Consultórios</span>
              <p className="font-heading text-2xl font-extrabold text-[#185BA6] tabular-nums mt-1">
                {occupancyRate}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ▲ Otimização máxima de salas
              </span>
            </div>

            <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
              <span className="text-xs text-[#52606D]">Tempo Médio de Espera na Recepção</span>
              <p className="font-heading text-2xl font-extrabold text-blue-800 tabular-nums mt-1">
                {avgWaitTimeMinutes}
              </p>
              <span className="text-[11px] text-[#52606D] mt-1 block">
                Da triagem ao consultório
              </span>
            </div>

            <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
              <span className="text-xs text-[#52606D]">Taxa de Absenteísmo (No-Show)</span>
              <p className="font-heading text-2xl font-extrabold text-amber-700 tabular-nums mt-1">
                {noShowRate}%
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ▼ Reduzido por lembretes via WhatsApp
              </span>
            </div>

            <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
              <span className="text-xs text-[#52606D]">Retornos em Prazo Legal</span>
              <p className="font-heading text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
                98.2%
              </p>
              <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
                Conformidade com resolução CFM
              </span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
              <h3 className="font-heading text-base font-bold text-[#17212B] mb-3">
                Atendimentos por Especialidade Médica
              </h3>
              <div className="space-y-3">
                {[
                  { spec: 'Cardiologia & Eletrocardiograma', pct: '38%', count: '48 pacientes' },
                  { spec: 'Clínica Geral & Check-up', pct: '26%', count: '32 pacientes' },
                  { spec: 'Dermatologia & Procedimentos', pct: '18%', count: '22 pacientes' },
                  { spec: 'Pediatria & Neonatologia', pct: '12%', count: '15 pacientes' },
                  { spec: 'Ginecologia & Obstetrícia', pct: '6%', count: '8 pacientes' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#17212B]">{item.spec}</span>
                      <span className="text-gray-500">{item.count} ({item.pct})</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#185BA6]" style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-[#17212B] mb-1">
                  Resumo de Proteção de Dados & Sigilo
                </h3>
                <p className="text-xs text-[#52606D] mb-4">
                  Preservação de autoria, histórico e separação rigorosa de funções.
                </p>
                <div className="space-y-2.5 text-xs text-[#17212B]">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-[8px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Prontuários médicos inacessíveis a recepção, financeiro e master admin.</span>
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-[8px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#185BA6] shrink-0" />
                    <span>Retificações de prontuário com registro obrigatório de motivo e CRM.</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-[8px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-600 shrink-0" />
                    <span>Todas as leituras de documentos privados registradas com timestamp.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 text-[11px] text-[#52606D]">
                Auditado sob padrões de segurança de alto nível em ambiente Firebase.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#F5F9FD] border-b border-[#D9DFE5] flex items-center justify-between">
            <span className="font-heading font-bold text-xs text-[#17212B]">
              Trilha de Auditoria Imutável (Audit Trail)
            </span>
            <span className="text-xs text-[#52606D]">
              Eventos protegidos contra exclusão
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                  <th className="py-3 px-4 font-semibold">Data / Hora</th>
                  <th className="py-3 px-4 font-semibold">Usuário Responsável</th>
                  <th className="py-3 px-4 font-semibold">Papel</th>
                  <th className="py-3 px-4 font-semibold">Ação</th>
                  <th className="py-3 px-4 font-semibold">Recurso</th>
                  <th className="py-3 px-4 font-semibold">Detalhamento do Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#17212B] whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#185BA6] border border-blue-200 uppercase">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[11px] text-gray-700 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 capitalize whitespace-nowrap">
                      {log.resource.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-4 text-[#17212B] text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
