import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { X, CheckCircle, ShieldCheck, Stethoscope, User, DollarSign, Settings, Users } from 'lucide-react';

interface DemoSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole?: (role: UserRole) => void;
}

export const DemoSwitcherModal: React.FC<DemoSwitcherModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
}) => {
  const { currentUser, switchDemoRole, availableDemoUsers } = useAuth();

  if (!isOpen) return null;

  const roleMeta: Record<
    UserRole,
    { label: string; description: string; icon: React.ReactNode; color: string; badge: string }
  > = {
    paciente: {
      label: 'Paciente / Cliente',
      description: 'Acesso ao Portal do Paciente, histórico de consultas, receitas particulares, envio seguro de exames.',
      icon: <User className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      badge: 'Portal Público',
    },
    medico: {
      label: 'Médica Habilitada (Dra. Lúcia)',
      description: 'Acesso total ao Prontuário Eletrônico (SOEP), chamada de pacientes, prescrições e retificações com CRM.',
      icon: <Stethoscope className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200',
      badge: 'CRM/SP 142859',
    },
    recepcao: {
      label: 'Recepção & Atendimento',
      description: 'Check-in de pacientes, triagem com sinais vitais, chamada no painel e gestão da fila de espera.',
      icon: <Users className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200',
      badge: 'Fila & Triagem',
    },
    financeiro: {
      label: 'Faturamento & Financeiro',
      description: 'Orçamentos, pagamentos (PIX/Cartão), fluxo de caixa, repasse aos médicos (sem acesso a prontuários).',
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      badge: 'Caixa & Estoque',
    },
    admin: {
      label: 'Administrador / Diretor Clínico',
      description: 'Gestão completa da empresa Lucy Clinica, salas, profissionais, relatórios gerenciais e auditoria.',
      icon: <ShieldCheck className="w-5 h-5 text-blue-800" />,
      color: 'bg-indigo-50 border-indigo-200',
      badge: 'Gestão Lucy Clinica',
    },
    master: {
      label: 'Super Admin Master (SaaS)',
      description: 'Gestão global da plataforma e multi-empresas (sem acesso automático a prontuários médicos sensíveis).',
      icon: <Settings className="w-5 h-5 text-slate-700" />,
      color: 'bg-slate-100 border-slate-300',
      badge: 'Plataforma SaaS',
    },
  };

  const handleSelect = (role: UserRole) => {
    switchDemoRole(role);
    if (onSelectRole) onSelectRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9DFE5] flex items-center justify-between bg-[#F5F9FD]">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#17212B] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#185BA6]" />
              Alternador de Perfis e Permissões (Demonstração)
            </h2>
            <p className="text-xs text-[#52606D]">
              Alterne instantaneamente entre os perfis para testar o isolamento de permissões e as telas correspondentes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profiles List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {availableDemoUsers.map((user) => {
            const meta = roleMeta[user.role];
            const isSelected = currentUser.role === user.role;

            return (
              <div
                key={user.id}
                onClick={() => handleSelect(user.role)}
                className={`p-4 rounded-[10px] border cursor-pointer transition flex items-start gap-4 ${
                  isSelected
                    ? 'border-[#185BA6] bg-blue-50/60 ring-2 ring-[#185BA6]/30'
                    : 'border-[#D9DFE5] hover:border-gray-400 bg-white hover:bg-gray-50/60'
                }`}
              >
                <div className="p-2.5 rounded-[10px] bg-white border border-[#D9DFE5] shadow-xs shrink-0">
                  {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[#17212B] flex items-center gap-2">
                      {user.displayName}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                        {meta.badge}
                      </span>
                    </span>
                    {isSelected && (
                      <span className="text-xs font-semibold text-[#185BA6] flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#52606D] mt-1 leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9DFE5] bg-[#F5F9FD] flex items-center justify-between">
          <span className="text-xs text-[#52606D]">
            Perfil ativo: <strong className="text-[#17212B] capitalize">{currentUser.displayName}</strong> ({currentUser.role})
          </span>
          <button
            onClick={onClose}
            className="h-[38px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold transition"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
