import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { AppointmentType } from '../../types';
import { X, Calendar, Clock, User, Stethoscope, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSpecialty?: string;
  preselectedProfessionalId?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedSpecialty,
  preselectedProfessionalId,
}) => {
  const { professionals, rooms, checkScheduleConflict, bookAppointment, patients, createPatient } = useClinic();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(preselectedSpecialty || 'Cardiologia & Clínica Médica');
  const [selectedProfId, setSelectedProfId] = useState<string>(preselectedProfessionalId || (professionals[0]?.id ?? ''));
  
  // Tomorrow or today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('primeira_consulta');
  const [isTelemedicine, setIsTelemedicine] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'convenio'>('pix');

  // Patient Info fields
  const [patientName, setPatientName] = useState<string>(currentUser.displayName || 'Laura Pereira');
  const [patientPhone, setPatientPhone] = useState<string>(currentUser.phone || '(11) 98765-4321');
  const [patientCpf, setPatientCpf] = useState<string>(currentUser.cpf || '324.542.198-02');
  const [insuranceName, setInsuranceName] = useState<string>('Particular');

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter professionals by specialty if selected
  const availablePros = selectedSpecialty
    ? professionals.filter((p) => p.specialty.includes(selectedSpecialty) || p.specialty === selectedSpecialty)
    : professionals;

  const currentPro = professionals.find((p) => p.id === selectedProfId) || professionals[0];
  const currentRoom = rooms.find((r) => r.id === currentPro?.defaultRoomId) || rooms[0];

  // Time slots generated from 07:00 to 17:00
  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '13:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleNextStep1 = () => {
    if (!selectedProfId) {
      alert('Por favor, selecione um médico especialista.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    // Check conflicts
    const conflict = checkScheduleConflict(selectedDate, selectedTime, currentPro.id, currentRoom.id);
    if (conflict.hasConflict) {
      setConflictError(conflict.reason || 'Conflito de horário detectado.');
      return;
    }
    setConflictError(null);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setConflictError(null);

    try {
      // Find or create patient
      let patient = patients.find((p) => p.cpf === patientCpf || p.email === currentUser.email);
      let patientId = patient?.id;

      if (!patient) {
        const newP = createPatient({
          organizationId: 'lucy-clinica-matriz',
          name: patientName,
          cpf: patientCpf,
          email: currentUser.email || 'paciente@lucyclinica.com.br',
          phone: patientPhone,
          birthDate: '1995-01-01',
          gender: 'F',
          bloodType: 'A+',
          allergies: [],
          chronicConditions: [],
          insuranceProvider: insuranceName,
        });
        patientId = newP.id;
      }

      const price = appointmentType === 'retorno' ? currentPro.returnFee : currentPro.consultationFee;

      await bookAppointment({
        organizationId: 'lucy-clinica-matriz',
        patientId: patientId || 'pat-1',
        patientName,
        patientPhone,
        patientCpf,
        professionalId: currentPro.id,
        professionalName: currentPro.name,
        specialty: currentPro.specialty,
        roomId: currentRoom.id,
        roomName: currentRoom.name,
        date: selectedDate,
        time: selectedTime,
        durationMinutes: 30,
        type: appointmentType,
        status: 'confirmado',
        notes: notes || undefined,
        price,
        paymentStatus: paymentMethod === 'convenio' ? 'cortesia' : 'pago',
        paymentMethod,
        isTelemedicine,
        returnDeadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
        setStep(1);
      }, 1800);
    } catch (err: any) {
      setConflictError(err.message || 'Erro ao realizar agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#D9DFE5] bg-[#F5F9FD] flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#185BA6] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#185BA6]" />
              Agendar Consulta Médica — Lucy Clinica
            </h2>
            <p className="text-xs text-[#52606D]">
              Horário ambulatorial: 07:00 às 17:00 | São Paulo - SP
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-3 bg-white border-b border-[#D9DFE5] flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#185BA6]' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 1 ? 'bg-[#185BA6]' : 'bg-gray-300'}`}>
              1
            </span>
            <span>Especialista</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-3" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#185BA6]' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 2 ? 'bg-[#185BA6]' : 'bg-gray-300'}`}>
              2
            </span>
            <span>Data e Horário</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-3" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#185BA6]' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step >= 3 ? 'bg-[#185BA6]' : 'bg-gray-300'}`}>
              3
            </span>
            <span>Confirmação</span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {bookingSuccess ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-bounce" />
              <h3 className="font-heading text-xl font-bold text-[#17212B]">
                Consulta Agendada com Sucesso!
              </h3>
              <p className="text-sm text-[#52606D] mt-2">
                O agendamento com {currentPro.name} foi confirmado para {selectedDate} às {selectedTime}.
              </p>
              <p className="text-xs text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full mt-3">
                Lembrete enviado via WhatsApp ({patientPhone})
              </p>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                  1. Selecione a Especialidade Médica
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Cardiologia & Clínica Médica',
                    'Clínica Geral & Check-up',
                    'Pediatria & Neonatologia',
                    'Dermatologia Clínica',
                    'Ginecologia e Obstetrícia',
                  ].map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => {
                        setSelectedSpecialty(spec);
                        const match = professionals.find((p) => p.specialty.includes(spec));
                        if (match) setSelectedProfId(match.id);
                      }}
                      className={`p-3 text-left rounded-[10px] border text-xs font-semibold transition ${
                        selectedSpecialty === spec
                          ? 'border-[#185BA6] bg-blue-50/70 text-[#185BA6] ring-1 ring-[#185BA6]'
                          : 'border-[#D9DFE5] hover:bg-gray-50 text-[#17212B]'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 mb-1 text-[#185BA6]" />
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                  2. Escolha o Médico Especialista
                </label>
                <div className="space-y-2">
                  {availablePros.map((pro) => (
                    <div
                      key={pro.id}
                      onClick={() => setSelectedProfId(pro.id)}
                      className={`p-3.5 rounded-[10px] border cursor-pointer flex items-center justify-between transition ${
                        selectedProfId === pro.id
                          ? 'border-[#185BA6] bg-blue-50/60 ring-2 ring-[#185BA6]/30'
                          : 'border-[#D9DFE5] hover:border-gray-400 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#185BA6] text-white flex items-center justify-center font-bold text-sm">
                          {pro.name.split(' ')[1]?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#17212B]">{pro.name}</p>
                          <p className="text-xs text-[#52606D]">
                            CRM/{pro.crmUf} {pro.crm} • {pro.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#185BA6] block">
                          R$ {pro.consultationFee.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Retorno sem custo (30 dias)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-5">
              <div className="p-3 bg-blue-50 rounded-[10px] border border-blue-200 flex items-center gap-3 text-xs text-[#185BA6]">
                <User className="w-4 h-4 shrink-0" />
                <div>
                  <strong>{currentPro.name}</strong> ({currentPro.specialty}) • {currentRoom.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                  Selecione a Data da Consulta
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setConflictError(null);
                  }}
                  className="w-full p-2.5 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-sm text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#185BA6]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#17212B]">
                    Horários Disponíveis (07:00 às 17:00)
                  </label>
                  <span className="text-[11px] text-[#52606D]">Intervalos de 30 minutos</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((time) => {
                    const conflict = checkScheduleConflict(selectedDate, time, currentPro.id, currentRoom.id);
                    const isOccupied = conflict.hasConflict;
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => {
                          setSelectedTime(time);
                          setConflictError(null);
                        }}
                        className={`py-2 px-1 text-xs font-semibold rounded-[8px] border transition ${
                          isOccupied
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#185BA6] text-white border-[#185BA6] shadow-sm'
                            : 'bg-white hover:bg-blue-50 border-[#D9DFE5] text-[#17212B]'
                        }`}
                        title={isOccupied ? 'Horário já reservado (conflito)' : 'Horário livre'}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {conflictError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{conflictError}</span>
                </div>
              )}

              {/* Mode: In person or Telemedicine */}
              <div className="pt-2 border-t border-[#D9DFE5] flex items-center justify-between">
                <span className="text-xs font-medium text-[#17212B]">
                  Deseja atendimento por Telemedicina?
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTelemedicine}
                    onChange={(e) => setIsTelemedicine(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#185BA6]"></div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#17212B] text-sm">
                  <span>{currentPro.name}</span>
                  <span className="text-[#185BA6]">
                    {appointmentType === 'retorno' ? 'Gratuito (Retorno)' : `R$ ${currentPro.consultationFee.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-[#52606D]">
                  {currentPro.specialty} • {currentRoom.name}
                </p>
                <p className="text-[#52606D] font-medium pt-1">
                  Data: <strong>{selectedDate}</strong> às <strong>{selectedTime}</strong> ({isTelemedicine ? 'Telemedicina' : 'Presencial'})
                </p>
              </div>

              {/* Patient Information Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#17212B] mb-1">
                      Nome Completo do Paciente
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17212B] mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={patientCpf}
                      onChange={(e) => setPatientCpf(e.target.value)}
                      className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#17212B] mb-1">
                      WhatsApp / Celular
                    </label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17212B] mb-1">
                      Tipo de Agendamento
                    </label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                      className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                    >
                      <option value="primeira_consulta">Primeira Consulta</option>
                      <option value="retorno">Retorno (Dentro dos 30 dias)</option>
                      <option value="exame">Exame / Procedimento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Forma de Pagamento / Convênio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pix', label: 'PIX Instantâneo' },
                      { id: 'cartao_credito', label: 'Cartão de Crédito' },
                      { id: 'convenio', label: 'Convênio Médico' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-[8px] border text-xs font-semibold transition ${
                          paymentMethod === m.id
                            ? 'border-[#185BA6] bg-blue-50 text-[#185BA6]'
                            : 'border-[#D9DFE5] text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Observações / Sintomas principais (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Descreva brevemente o motivo da consulta ou sintomas..."
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-[10px] flex items-center gap-2 text-[11px] text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Garantia de Sigilo Médico CFM e isolamento LGPD para todas as consultas registradas.
                  </span>
                </div>
              </div>

              {conflictError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-700">
                  {conflictError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!bookingSuccess && (
          <div className="p-4 border-t border-[#D9DFE5] bg-[#F5F9FD] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="h-[40px] px-4 rounded-[10px] border border-[#D9DFE5] text-xs font-semibold text-[#17212B] hover:bg-white transition"
              >
                Voltar
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-[40px] px-4 rounded-[10px] border border-[#D9DFE5] text-xs font-semibold text-[#52606D] hover:bg-white transition"
              >
                Cancelar
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep1}
                className="h-[40px] px-5 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold transition"
              >
                Continuar para Data e Horário
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleNextStep2}
                className="h-[40px] px-5 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold transition"
              >
                Prosseguir para Confirmação
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="h-[40px] px-6 rounded-[10px] bg-[#1E675F] hover:bg-[#17524c] text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
