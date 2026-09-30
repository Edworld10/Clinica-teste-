import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Clock, Calendar, MessageCircle, AlertCircle, CheckCircle2, User } from 'lucide-react';

export const ReturnsModule: React.FC = () => {
  const { appointments, organization } = useClinic();

  // Find all appointments with returnDeadlineDate
  const returnApts = appointments.filter((a) => a.returnDeadlineDate);

  const calculateDaysLeft = (deadlineDateStr: string) => {
    const today = new Date();
    const deadline = new Date(deadlineDateStr);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Controle de Retornos Médicos (Prazo de 30 Dias)
          </h2>
          <p className="text-xs text-[#52606D]">
            Acompanhe o prazo regulamentar para retorno sem custo de reavaliação de exames.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F5F9FD] border-b border-[#D9DFE5] flex items-center justify-between">
          <span className="font-heading font-bold text-xs text-[#17212B]">
            Pacientes com Direito a Retorno Ativo
          </span>
          <span className="text-xs text-[#52606D]">
            Prazo legal padrão: 30 dias a partir da consulta inicial
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                <th className="py-3 px-4 font-semibold">Paciente</th>
                <th className="py-3 px-4 font-semibold">Especialista</th>
                <th className="py-3 px-4 font-semibold">Data da Consulta</th>
                <th className="py-3 px-4 font-semibold">Prazo Limite</th>
                <th className="py-3 px-4 font-semibold">Dias Restantes</th>
                <th className="py-3 px-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returnApts.map((apt) => {
                const daysLeft = calculateDaysLeft(apt.returnDeadlineDate!);
                const isUrgent = daysLeft <= 7 && daysLeft > 0;
                const isExpired = daysLeft <= 0;

                const cleanPhone = apt.patientPhone.replace(/\D/g, '');
                const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                  `Olá ${apt.patientName}, informamos que o prazo para seu retorno com ${apt.professionalName} na Lucy Clinica vence em ${apt.returnDeadlineDate}. Deseja agendar seu retorno hoje?`
                )}`;

                return (
                  <tr key={apt.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#17212B]">{apt.patientName}</p>
                      <span className="text-[10px] text-gray-500">{apt.patientPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#185BA6]">{apt.professionalName}</p>
                      <span className="text-[10px] text-gray-500">{apt.specialty}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{apt.date}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{apt.returnDeadlineDate}</td>
                    <td className="py-3 px-4">
                      {isExpired ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Expirado
                        </span>
                      ) : isUrgent ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {daysLeft} dias restantes (Urgente)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {daysLeft} dias restantes (No prazo)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-[6px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Lembrar no WhatsApp
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
