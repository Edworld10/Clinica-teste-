import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/common/Header';
import { PatientPortal } from './components/patient/PatientPortal';
import { AdminLayout } from './components/admin/AdminLayout';
import { DemoSwitcherModal } from './components/common/DemoSwitcherModal';
import { BookAppointmentModal } from './components/patient/BookAppointmentModal';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { organization } = useClinic();

  // State: 'patient' or 'admin'
  const [currentView, setCurrentView] = useState<'patient' | 'admin'>(() => {
    return currentUser.role === 'paciente' ? 'patient' : 'admin';
  });

  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // If user role changes via demo switcher
  const handleRoleChanged = (newRole: string) => {
    if (newRole === 'paciente') {
      setCurrentView('patient');
    } else {
      setCurrentView('admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FD] text-[#17212B] flex flex-col font-sans">
      {/* If in patient view, display patient header and portal */}
      {currentView === 'patient' ? (
        <div className="flex-1 flex flex-col">
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            onOpenDemoSwitcher={() => setIsDemoSwitcherOpen(true)}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
          />

          <main className="flex-1">
            <PatientPortal />
          </main>

          {/* Patient Portal Footer */}
          <footer className="bg-white border-t border-[#D9DFE5] mt-12 py-8 px-4 sm:px-8 text-xs text-[#52606D]">
            <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[#17212B]">
                  {organization.name} — {organization.legalName}
                </p>
                <p className="mt-0.5">
                  {organization.city} - {organization.state} • WhatsApp: {organization.whatsapp}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Horário: {organization.openingHoursStart} às {organization.openingHoursEnd} • Responsável Técnica: Dra. Lúcia Santos CRM/SP 142859
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDemoSwitcherOpen(true)}
                  className="px-3 py-1.5 rounded-[8px] bg-blue-50 text-[#185BA6] font-semibold hover:bg-blue-100 transition"
                >
                  Alternar Perfil Demo ({currentUser.role})
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-3 py-1.5 rounded-[8px] bg-[#185BA6] text-white font-semibold hover:bg-[#144b8a] transition"
                >
                  Acesso Administrativo &gt;
                </button>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* If in admin view, display the full admin layout with sidebar & topbar */
        <AdminLayout
          onOpenDemoSwitcher={() => setIsDemoSwitcherOpen(true)}
          onSwitchToPatientView={() => setCurrentView('patient')}
        />
      )}

      {/* Demo Switcher Modal */}
      <DemoSwitcherModal
        isOpen={isDemoSwitcherOpen}
        onClose={() => setIsDemoSwitcherOpen(false)}
        onSelectRole={handleRoleChanged}
      />

      {/* Global Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <AppContent />
      </ClinicProvider>
    </AuthProvider>
  );
}
