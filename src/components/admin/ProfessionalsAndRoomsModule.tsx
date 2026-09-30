import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Professional, Room } from '../../types';
import { Stethoscope, DoorClosed, Plus, Phone, Mail, Award, Clock } from 'lucide-react';

export const ProfessionalsAndRoomsModule: React.FC = () => {
  const { professionals, rooms } = useClinic();
  const [activeTab, setActiveTab] = useState<'profissionais' | 'salas'>('profissionais');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Corpo Clínico & Salas de Atendimento
          </h2>
          <p className="text-xs text-[#52606D]">
            Gestão dos médicos habilitados (CRM), especialidades, repasses e consultórios ativos.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-[#F5F9FD] p-1 rounded-[10px] border border-[#D9DFE5] flex items-center text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profissionais')}
            className={`px-3 py-1.5 rounded-[8px] transition ${
              activeTab === 'profissionais'
                ? 'bg-[#185BA6] text-white shadow-xs'
                : 'text-[#52606D] hover:text-[#17212B]'
            }`}
          >
            Médicos Especialistas ({professionals.length})
          </button>
          <button
            onClick={() => setActiveTab('salas')}
            className={`px-3 py-1.5 rounded-[8px] transition ${
              activeTab === 'salas'
                ? 'bg-[#185BA6] text-white shadow-xs'
                : 'text-[#52606D] hover:text-[#17212B]'
            }`}
          >
            Salas & Consultórios ({rooms.length})
          </button>
        </div>
      </div>

      {activeTab === 'profissionais' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((pro) => {
            const assignedRoom = rooms.find((r) => r.id === pro.defaultRoomId);

            return (
              <div
                key={pro.id}
                className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-[#185BA6] text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {pro.name.split(' ')[1]?.charAt(0) || 'M'}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      CRM/{pro.crmUf} {pro.crm}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#17212B] mt-3">{pro.name}</h3>
                  <p className="text-xs font-semibold text-[#185BA6] mt-0.5">{pro.specialty}</p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-[#52606D]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{pro.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DoorClosed className="w-3.5 h-3.5 text-gray-400" />
                      <span>{assignedRoom ? assignedRoom.name : 'Sala rotativa'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Atendimento: {pro.workHoursStart} às {pro.workHoursEnd}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#52606D] block">Consulta</span>
                    <strong className="text-[#17212B] tabular-nums">
                      R$ {pro.consultationFee.toFixed(2)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#52606D] block">Repasse Médico</span>
                    <span className="text-emerald-700 font-bold tabular-nums">
                      {pro.commissionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs flex items-start gap-3.5"
            >
              <div className="p-3 bg-blue-50 text-[#185BA6] rounded-[10px]">
                <DoorClosed className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#17212B]">{room.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    Ativa
                  </span>
                </div>
                <p className="text-xs text-[#52606D] mt-1 capitalize">
                  Tipo: {room.type} • Localização: {room.floor}
                </p>
                <div className="mt-3 text-[11px] text-gray-400">
                  Pronta para higienização e atendimento
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
