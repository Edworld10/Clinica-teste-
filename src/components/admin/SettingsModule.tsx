import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Settings,
  Building,
  MapPin,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  Database,
  Palette,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { organization, updateOrganization } = useClinic();

  const [name, setName] = useState(organization.name);
  const [legalName, setLegalName] = useState(organization.legalName);
  const [city, setCity] = useState(organization.city);
  const [state, setState] = useState(organization.state);
  const [address, setAddress] = useState(organization.address);
  const [whatsapp, setWhatsapp] = useState(organization.whatsapp);
  const [phone, setPhone] = useState(organization.phone);
  const [startHour, setStartHour] = useState(organization.openingHoursStart);
  const [endHour, setEndHour] = useState(organization.openingHoursEnd);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name,
      legalName,
      city,
      state,
      address,
      whatsapp,
      phone,
      openingHoursStart: startHour,
      openingHoursEnd: endHour,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#17212B]">
          Configurações da Clínica
        </h2>
        <p className="text-xs text-[#52606D]">
          Parâmetros operacionais, dados cadastrais da empresa e horários de funcionamento.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-[10px] border border-[#D9DFE5] p-6 shadow-xs space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[8px] flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Configurações salvas e aplicadas com sucesso em todo o sistema!
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-heading text-sm font-bold text-[#17212B] flex items-center gap-2 border-b border-gray-100 pb-2">
            <Building className="w-4 h-4 text-[#185BA6]" />
            Dados da Empresa & Marca
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Nome do SaaS / Nome Fantasia
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-bold text-[#17212B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Razão Social (Empresa)
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Cidade
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                UF
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                WhatsApp Oficial
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-bold text-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Endereço Físico Completo
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
            />
          </div>
        </div>

        {/* Operating Hours & Timezone */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-heading text-sm font-bold text-[#17212B] flex items-center gap-2 border-b border-gray-100 pb-2">
            <Clock className="w-4 h-4 text-[#185BA6]" />
            Horário Ambulatorial & Fuso de Atendimento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Início do Atendimento
              </label>
              <input
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Término do Atendimento
              </label>
              <input
                type="time"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-[8px] text-xs text-gray-700">
            Fuso configurado: <strong>07:00 às 17:00</strong> (América/São Paulo - Horário de Brasília). Intervalos de consulta fixados em 30 minutos com detecção automática de conflito de sala e profissional.
          </div>
        </div>

        {/* System & Cloud Information */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-heading text-sm font-bold text-[#17212B] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1E675F]" />
            Banco de Dados & Paleta 2026
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F5F9FD] rounded border border-[#D9DFE5]">
              <span className="text-[#52606D]">Banco de Dados Ativo:</span>
              <p className="font-bold text-[#185BA6] mt-0.5">Firebase Cloud Firestore + Firebase Auth</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Provisionado com Regras ABAC</span>
            </div>
            <div className="p-3 bg-[#F5F9FD] rounded border border-[#D9DFE5]">
              <span className="text-[#52606D]">Tokens Visuais Clara Saúde 2026:</span>
              <p className="font-bold text-[#17212B] mt-0.5">Primária #185BA6 • Fundo #F5F9FD • Apoio #1E675F</p>
              <span className="text-[10px] text-[#52606D]">Tipografia: Atkinson Hyperlegible + Source Sans 3</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="h-[44px] px-6 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
