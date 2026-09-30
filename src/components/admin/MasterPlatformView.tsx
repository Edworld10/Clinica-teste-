import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Building,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Server,
  Users,
  CreditCard,
  DollarSign,
} from 'lucide-react';

export const MasterPlatformView: React.FC = () => {
  const { organization } = useClinic();
  const { currentUser } = useAuth();

  // Multi-tenant clinics list
  const clinics = [
    {
      id: 'lucy-clinica-matriz',
      name: 'Lucy Clinica (Clinica Lucia)',
      city: 'São Paulo - SP',
      plan: 'Enterprise Saúde 2026',
      status: 'Ativa',
      doctorsCount: 5,
      patientsCount: 1420,
      monthlyFee: 'R$ 890,00',
    },
    {
      id: 'clinica-jardins',
      name: 'Clínica Médica Jardins',
      city: 'São Paulo - SP',
      plan: 'Profissional',
      status: 'Ativa',
      doctorsCount: 3,
      patientsCount: 780,
      monthlyFee: 'R$ 490,00',
    },
    {
      id: 'instituto-paulista',
      name: 'Instituto Paulista de Especialidades',
      city: 'Campinas - SP',
      plan: 'Enterprise Saúde 2026',
      status: 'Ativa',
      doctorsCount: 8,
      patientsCount: 2950,
      monthlyFee: 'R$ 1.290,00',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Administração da Plataforma SaaS (/master)
          </h2>
          <p className="text-xs text-[#52606D]">
            Gestão de instâncias multi-empresas, faturamento de assinaturas e governança de infraestrutura.
          </p>
        </div>
      </div>

      {/* Critical Security Invariant Banner */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-[10px] flex items-start gap-3 text-xs text-amber-950">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold text-amber-900">
            Regra Fundamental de Governança e Sigilo (CFM & LGPD):
          </strong>
          O Administrador Master da plataforma gerencia exclusivamente empresas, planos e assinaturas.
          <strong> O Master NÃO possui acesso automático aos prontuários eletrônicos nem a anotações clínicas privadas dos pacientes das clínicas clientes.</strong> O isolamento por organization_id e as regras de segurança do Firestore barram qualquer leitura não médica.
        </div>
      </div>

      {/* Top 3 Global SaaS KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Clínicas Ativas na Plataforma</span>
          <p className="font-heading text-2xl font-extrabold text-[#185BA6] tabular-nums mt-1">
            3 clínicas
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            100% de disponibilidade operacional
          </span>
        </div>

        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Receita Recorrente SaaS (MRR)</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
            R$ 2.670,00 /mês
          </p>
          <span className="text-[11px] text-[#52606D] mt-1 block">
            Faturamento de licenças da plataforma
          </span>
        </div>

        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs">
          <span className="text-xs text-[#52606D]">Segurança & Isolamento de Dados</span>
          <p className="font-heading text-2xl font-extrabold text-purple-700 tabular-nums mt-1">
            Zero Leaks
          </p>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
            Firestore Rules ABAC Ativas
          </span>
        </div>
      </div>

      {/* Clinics Tenants Table */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F5F9FD] border-b border-[#D9DFE5] flex items-center justify-between">
          <span className="font-heading font-bold text-xs text-[#17212B]">
            Empresas Clientes Cadastradas
          </span>
          <span className="text-xs text-[#52606D]">
            Ambiente segregado por organization_id
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                <th className="py-3 px-4 font-semibold">Empresa / Clínica</th>
                <th className="py-3 px-4 font-semibold">Localização</th>
                <th className="py-3 px-4 font-semibold">Plano Contratado</th>
                <th className="py-3 px-4 font-semibold">Corpo Clínico</th>
                <th className="py-3 px-4 font-semibold">Assinatura Mensal</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clinics.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#17212B]">{c.name}</p>
                    <span className="font-mono text-[10px] text-gray-400">{c.id}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.city}</td>
                  <td className="py-3 px-4 font-semibold text-[#185BA6]">{c.plan}</td>
                  <td className="py-3 px-4 text-gray-700">{c.doctorsCount} médicos</td>
                  <td className="py-3 px-4 font-bold text-[#17212B] tabular-nums">{c.monthlyFee}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
