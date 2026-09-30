import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  Filter,
  Plus,
  User,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Phone,
  DoorClosed,
  X,
  Stethoscope,
} from 'lucide-react';
import { BookAppointmentModal } from '../patient/BookAppointmentModal';

export const AgendaModule: React.FC = () => {
  const {
    appointments,
    professionals,
    rooms,
    updateAppointmentStatus,
    checkInPatientToQueue,
    checkScheduleConflict,
  } = useClinic();
  const { currentUser } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedProfId, setSelectedProfId] = useState<string>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesDate = a.date === selectedDate;
    const matchesProf = selectedProfId === 'all' || a.professionalId === selectedProfId;
    const matchesRoom = selectedRoomId === 'all' || a.roomId === selectedRoomId;
    return matchesDate && matchesProf && matchesRoom;
  });

  // Time slots from 07:00 to 17:00
  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ];

  const handleQuickCheckIn = async (aptId: string) => {
    try {
      const q = await checkInPatientToQueue(aptId);
      alert(`Paciente recebido na recepção! Senha gerada: ${q.ticketNumber}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar check-in');
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-[#185BA6]">Confirmado</span>;
      case 'em_espera':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">Em Espera</span>;
      case 'em_triagem':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800">Em Triagem</span>;
      case 'em_atendimento':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">Em Consulta</span>;
      case 'concluido':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Concluído</span>;
      case 'cancelado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">Cancelado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">Agendado</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">Agenda Médica</h2>
          <p className="text-xs text-[#52606D]">
            Grade diária de atendimentos com detecção de conflitos de sala e profissional (07:00 às 17:00).
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="h-[40px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#185BA6]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-1.5 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold text-[#17212B]"
            />
          </div>

          {/* Quick Date buttons */}
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-2.5 py-1 rounded-[6px] border ${
              selectedDate === todayStr ? 'bg-[#185BA6] text-white border-[#185BA6]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            Hoje
          </button>

          {/* Filter by Professional */}
          <div className="flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedProfId}
              onChange={(e) => setSelectedProfId(e.target.value)}
              className="p-1.5 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B]"
            >
              <option value="all">Todos os Médicos</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.crm})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Room */}
          <div className="flex items-center gap-1.5">
            <DoorClosed className="w-4 h-4 text-[#185BA6]" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="p-1.5 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B]"
            >
              <option value="all">Todas as Salas</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#52606D] font-medium">
          Total de agendamentos no dia: <strong>{filteredAppointments.length}</strong>
        </div>
      </div>

      {/* Schedule Time Grid */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F5F9FD] border-b border-[#D9DFE5] flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-[#17212B]">
            Grade Horária Ambulatorial — {selectedDate}
          </span>
          <span className="text-xs text-[#52606D]">Intervalo padrão: 30 minutos</span>
        </div>

        <div className="divide-y divide-gray-100 max-h-[650px] overflow-y-auto">
          {timeSlots.map((slot) => {
            const aptsInSlot = filteredAppointments.filter((a) => a.time === slot);

            return (
              <div key={slot} className="flex items-start p-3 sm:p-4 hover:bg-gray-50/50 transition">
                {/* Time Column */}
                <div className="w-20 shrink-0 text-xs font-bold text-[#185BA6] flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {slot}
                </div>

                {/* Appointments in slot */}
                <div className="flex-1 min-w-0">
                  {aptsInSlot.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aptsInSlot.map((apt) => {
                        const cleanPatientPhone = apt.patientPhone.replace(/\D/g, '');
                        const waPatientUrl = `https://wa.me/55${cleanPatientPhone}?text=${encodeURIComponent(
                          `Olá ${apt.patientName}, confirmamos sua consulta na Lucy Clinica para hoje às ${apt.time} com ${apt.professionalName}.`
                        )}`;

                        return (
                          <div
                            key={apt.id}
                            className="bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] p-3 space-y-2 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-sm text-[#17212B]">{apt.patientName}</h4>
                                  {getStatusBadge(apt.status)}
                                </div>
                                <p className="text-xs text-[#52606D] mt-0.5">
                                  {apt.professionalName} • {apt.roomName}
                                </p>
                              </div>
                              <span className="text-xs font-extrabold text-[#185BA6] tabular-nums">
                                {apt.price > 0 ? `R$ ${apt.price.toFixed(2)}` : 'Retorno'}
                              </span>
                            </div>

                            {apt.notes && (
                              <p className="text-[11px] text-gray-600 bg-white p-2 rounded-[6px] border border-gray-100">
                                💬 {apt.notes}
                              </p>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                              <a
                                href={waPatientUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-[11px] font-semibold"
                                title="Enviar lembrete via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </a>

                              <div className="flex items-center gap-1">
                                {apt.status === 'confirmado' && (
                                  <button
                                    onClick={() => handleQuickCheckIn(apt.id)}
                                    className="px-2 py-1 rounded bg-[#185BA6] text-white text-[10px] font-semibold hover:bg-[#144b8a]"
                                  >
                                    Fazer Check-in
                                  </button>
                                )}

                                <select
                                  value={apt.status}
                                  onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                                  className="text-[10px] bg-white border border-[#D9DFE5] rounded px-1.5 py-0.5 text-gray-700"
                                >
                                  <option value="confirmado">Confirmado</option>
                                  <option value="em_espera">Em espera</option>
                                  <option value="em_atendimento">Em consulta</option>
                                  <option value="concluido">Concluído</option>
                                  <option value="falta">Falta / Não veio</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-1 flex items-center justify-between">
                      <span>Horário Livre</span>
                      <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="text-[11px] text-[#185BA6] hover:underline font-medium"
                      >
                        + Agendar neste horário
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
};
