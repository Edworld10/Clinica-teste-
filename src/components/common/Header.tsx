import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import {
  Heart,
  Search,
  MapPin,
  Calendar,
  MessageCircle,
  Shield,
  UserCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'patient' | 'admin';
  setCurrentView: (view: 'patient' | 'admin') => void;
  onOpenDemoSwitcher: () => void;
  onOpenBookingModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenDemoSwitcher,
  onOpenBookingModal,
}) => {
  const { currentUser, signOut, signInWithGoogle, firebaseUser } = useAuth();
  const { organization } = useClinic();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cleanPhone = organization.whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    'Olá! Gostaria de informações ou agendar uma consulta na Lucy Clinica.'
  )}`;

  return (
    <header className="bg-white border-b border-[#D9DFE5] sticky top-0 z-40">
      {/* Top Banner: Location, Hours, Contact & Demo role badge */}
      <div className="bg-[#185BA6] text-white text-xs py-1.5 px-4 md:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-200" />
            {organization.city} - {organization.state}
          </span>
          <span className="hidden sm:inline-block text-blue-200">•</span>
          <span className="hidden sm:flex items-center gap-1 text-blue-100">
            Horário de Atendimento: {organization.openingHoursStart} às {organization.openingHoursEnd}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick WhatsApp Link */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-0.5 rounded-full text-xs transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp: {organization.whatsapp}
          </a>

          {/* Quick Demo Switcher button */}
          <button
            onClick={onOpenDemoSwitcher}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition border border-white/20"
            title="Alternar perfil de demonstração (Médico, Recepção, Financeiro, Admin, Paciente)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Perfil: <strong className="capitalize">{currentUser.role}</strong></span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#185BA6] to-[#1E675F] flex items-center justify-center text-white shadow-sm">
            <Heart className="w-6 h-6 fill-white stroke-none" />
          </div>
          <div>
            <span className="font-heading text-xl font-bold text-[#185BA6] tracking-tight flex items-center gap-1.5">
              {organization.name}
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-sans font-medium">
                Médica
              </span>
            </span>
            <p className="text-xs text-[#52606D]">Cuidar de você faz parte da nossa história</p>
          </div>
        </div>

        {/* Global Search Bar (simulating Clara Saúde topbar) */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar especialidade, médico, exame ou serviço clínico..."
              className="w-full pl-10 pr-4 py-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#185BA6] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Switch View toggle: Patient Portal vs Admin Panel */}
          <div className="bg-[#F5F9FD] p-1 rounded-[10px] border border-[#D9DFE5] flex items-center text-xs font-semibold">
            <button
              onClick={() => setCurrentView('patient')}
              className={`px-3 py-1.5 rounded-[8px] transition ${
                currentView === 'patient'
                  ? 'bg-[#185BA6] text-white shadow-sm'
                  : 'text-[#52606D] hover:text-[#17212B]'
              }`}
            >
              Portal do Paciente
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 py-1.5 rounded-[8px] transition flex items-center gap-1 ${
                currentView === 'admin'
                  ? 'bg-[#185BA6] text-white shadow-sm'
                  : 'text-[#52606D] hover:text-[#17212B]'
              }`}
            >
              <Lock className="w-3 h-3" />
              Painel Clínico / Admin
            </button>
          </div>

          {/* Quick Schedule Button for Patient */}
          {currentView === 'patient' && onOpenBookingModal && (
            <button
              onClick={onOpenBookingModal}
              className="hidden sm:flex items-center gap-2 bg-[#1E675F] hover:bg-[#16504a] text-white h-[40px] px-4 rounded-[10px] font-semibold text-sm transition shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar Consulta
            </button>
          )}

          {/* User Profile Pill / Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-[10px] hover:bg-gray-100 transition border border-transparent hover:border-[#D9DFE5]"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-9 h-9 rounded-full object-cover border border-[#D9DFE5]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#185BA6] text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.displayName.charAt(0)}
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-[#17212B] leading-tight">
                  Olá, {currentUser.displayName.split(' ')[0]}
                </p>
                <p className="text-[11px] text-[#52606D] capitalize">
                  {currentUser.role === 'medico'
                    ? currentUser.crm || 'Médico(a)'
                    : currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-[10px] shadow-lg border border-[#D9DFE5] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-bold text-[#17212B]">{currentUser.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#185BA6] border border-blue-200 uppercase">
                    Papel: {currentUser.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={onOpenDemoSwitcher}
                    className="w-full text-left px-4 py-2 text-xs text-[#17212B] hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-[#185BA6]" />
                    Trocar Perfil (Modo Demo)
                  </button>

                  <button
                    onClick={() => setCurrentView(currentView === 'patient' ? 'admin' : 'patient')}
                    className="w-full text-left px-4 py-2 text-xs text-[#17212B] hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Ir para {currentView === 'patient' ? 'Painel Administrativo' : 'Portal do Paciente'}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  {!firebaseUser ? (
                    <button
                      onClick={signInWithGoogle}
                      className="w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      Login com Google (Firebase)
                    </button>
                  ) : (
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta Google
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
