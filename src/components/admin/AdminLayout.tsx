import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  DoorClosed,
  FileCheck2,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Building,
  Menu,
  X,
  Lock,
  Tv,
} from 'lucide-react';
import { OverviewDashboard } from './OverviewDashboard';
import { AgendaModule } from './AgendaModule';
import { ReceptionQueueModule } from './ReceptionQueueModule';
import { MedicalRecordModule } from './MedicalRecordModule';
import { PatientsModule } from './PatientsModule';
import { ProfessionalsAndRoomsModule } from './ProfessionalsAndRoomsModule';
import { DocumentsModule } from './DocumentsModule';
import { ReturnsModule } from './ReturnsModule';
import { BudgetsModule } from './BudgetsModule';
import { InventoryModule } from './InventoryModule';
import { FinancialModule } from './FinancialModule';
import { ReportsAndAuditModule } from './ReportsAndAuditModule';
import { SettingsModule } from './SettingsModule';
import { MasterPlatformView } from './MasterPlatformView';

interface AdminLayoutProps {
  onOpenDemoSwitcher: () => void;
  onSwitchToPatientView: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onOpenDemoSwitcher,
  onSwitchToPatientView,
}) => {
  const { organization } = useClinic();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('visao_geral');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('Lucy Clinica - Matriz');

  const navItems = [
    { id: 'visao_geral', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda médica', icon: Calendar },
    { id: 'recepcao', label: 'Recepção & Fila', icon: Users },
    { id: 'prontuario', label: 'Prontuário (PEP)', icon: Stethoscope, badge: 'CFM' },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'profissionais_salas', label: 'Profissionais & Salas', icon: DoorClosed },
    { id: 'documentos', label: 'Documentos privados', icon: FileCheck2 },
    { id: 'retornos', label: 'Retornos (30 dias)', icon: Clock },
    { id: 'orcamentos', label: 'Orçamentos & PIX', icon: DollarSign },
    { id: 'estoque', label: 'Estoque de Insumos', icon: Package },
    { id: 'financeiro', label: 'Financeiro', icon: TrendingUp },
    { id: 'relatorios_auditoria', label: 'Relatórios & Auditoria', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  if (currentUser.role === 'master' || currentUser.role === 'admin') {
    navItems.push({ id: 'master_platform', label: 'Plataforma (/master)', icon: Shield, badge: 'SaaS' });
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'visao_geral':
        return <OverviewDashboard onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'agenda':
        return <AgendaModule />;
      case 'recepcao':
        return <ReceptionQueueModule />;
      case 'prontuario':
        return <MedicalRecordModule />;
      case 'pacientes':
        return <PatientsModule />;
      case 'profissionais_salas':
        return <ProfessionalsAndRoomsModule />;
      case 'documentos':
        return <DocumentsModule />;
      case 'retornos':
        return <ReturnsModule />;
      case 'orcamentos':
        return <BudgetsModule />;
      case 'estoque':
        return <InventoryModule />;
      case 'financeiro':
        return <FinancialModule />;
      case 'relatorios_auditoria':
        return <ReportsAndAuditModule />;
      case 'configuracoes':
        return <SettingsModule />;
      case 'master_platform':
        return <MasterPlatformView />;
      default:
        return <OverviewDashboard onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FD] flex">
      {/* Sidebar Desktop (240px wide, matches 02-painel-administrativo.png) */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#D9DFE5] flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-[#D9DFE5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#185BA6] to-[#1E675F] flex items-center justify-center text-white shadow-xs">
                <Heart className="w-5 h-5 fill-white stroke-none" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-bold text-[#185BA6] tracking-tight">
                  {organization.name}
                </h1>
                <p className="text-[11px] text-[#52606D] -mt-0.5">Cuidar hoje, mais saúde amanhã.</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-[#185BA6] shadow-xs'
                      : 'text-[#52606D] hover:bg-gray-50 hover:text-[#17212B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#185BA6]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        item.badge === 'CFM'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Demo Banner in Sidebar (Matches Image 2) */}
        <div className="p-4 border-t border-[#D9DFE5] bg-[#F5F9FD]">
          <div
            onClick={onOpenDemoSwitcher}
            className="p-3 rounded-[10px] bg-white border border-[#D9DFE5] shadow-2xs cursor-pointer hover:border-[#185BA6] transition"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#185BA6]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Modo Demonstração</span>
            </div>
            <p className="text-[11px] text-[#52606D] mt-1">
              Perfil: <strong className="capitalize text-[#17212B]">{currentUser.role}</strong>
            </p>
            <span className="text-[10px] text-blue-700 underline font-semibold mt-1 block">
              Clique para alternar papel &gt;
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (72px height, matches image 2) */}
        <header className="h-[72px] bg-white border-b border-[#D9DFE5] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search (Ctrl + K) as seen in mockup 02 */}
            <div className="relative w-72 sm:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, médico, procedimento ou lote..."
                className="w-full pl-9 pr-14 py-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B] focus:outline-none focus:ring-1 focus:ring-[#185BA6]"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                Ctrl K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Branch selector (Lucy Clinica - Matriz) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#F5F9FD] border border-[#D9DFE5] text-xs font-semibold text-[#17212B]">
              <Building className="w-3.5 h-3.5 text-[#185BA6]" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Lucy Clinica - Matriz">Lucy Clinica - Matriz (SP)</option>
                <option value="Lucy Clinica - Jardins">Lucy Clinica - Unidade Jardins</option>
              </select>
            </div>

            {/* TV Calling Panel Shortcut */}
            <button
              onClick={() => setActiveTab('recepcao')}
              className="flex items-center gap-1.5 h-[36px] px-3 rounded-[8px] bg-[#17212B] hover:bg-[#20262E] text-white text-xs font-bold transition shadow-xs"
              title="Abrir Painel de TV & Fila com Chamada por Áudio"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Painel de TV</span>
            </button>

            {/* Switch to Patient Portal */}
            <button
              onClick={onSwitchToPatientView}
              className="hidden sm:flex items-center gap-1.5 h-[36px] px-3 rounded-[8px] border border-[#D9DFE5] hover:bg-gray-50 text-xs font-semibold text-[#52606D]"
            >
              Portal do Paciente
            </button>

            {/* Notifications */}
            <button className="w-9 h-9 rounded-[10px] border border-[#D9DFE5] hover:bg-gray-50 flex items-center justify-center text-gray-500 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* User Profile Badge (Image 2 LP badge) */}
            <div
              onClick={onOpenDemoSwitcher}
              className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-[10px] hover:bg-gray-50 border border-transparent hover:border-[#D9DFE5] transition"
              title="Clique para alternar perfil de usuário"
            >
              <div className="w-9 h-9 rounded-full bg-[#185BA6] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#17212B] leading-tight">
                  {currentUser.displayName}
                </p>
                <p className="text-[11px] text-[#52606D] capitalize">
                  {currentUser.role === 'medico' ? currentUser.crm || 'Médica' : currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#D9DFE5] p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-xs font-semibold ${
                    activeTab === item.id ? 'bg-blue-50 text-[#185BA6]' : 'text-[#52606D]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Render */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1536px] w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};
