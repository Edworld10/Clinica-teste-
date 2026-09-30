import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  AlertTriangle,
  Heart,
  Calendar,
  Shield,
  X,
} from 'lucide-react';

export const PatientsModule: React.FC = () => {
  const { patients, createPatient, appointments, medicalRecords } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [gender, setGender] = useState<'M' | 'F' | 'Outro'>('F');
  const [bloodType, setBloodType] = useState('A+');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicText, setChronicText] = useState('');
  const [insurance, setInsurance] = useState('Particular');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(searchTerm) ||
      p.phone.includes(searchTerm)
  );

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cpf.trim() || !phone.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    createPatient({
      organizationId: 'lucy-clinica-matriz',
      name,
      cpf,
      email,
      phone,
      birthDate,
      gender,
      bloodType,
      allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()) : [],
      chronicConditions: chronicText ? chronicText.split(',').map((s) => s.trim()) : [],
      insuranceProvider: insurance,
    });

    setIsNewPatientModalOpen(false);
    setName('');
    setCpf('');
    setPhone('');
    setEmail('');
    setAllergiesText('');
    setChronicText('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Cadastro de Pacientes
          </h2>
          <p className="text-xs text-[#52606D]">
            Prontuários cadastrais, alergias, convênios e contatos de emergência.
          </p>
        </div>

        <button
          onClick={() => setIsNewPatientModalOpen(true)}
          className="h-[40px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D9DFE5] bg-[#F5F9FD] flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#52606D]">
            Total cadastrado: <strong>{patients.length} pacientes</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                <th className="py-3 px-4 font-semibold">Paciente</th>
                <th className="py-3 px-4 font-semibold">CPF</th>
                <th className="py-3 px-4 font-semibold">Contato</th>
                <th className="py-3 px-4 font-semibold">Convênio</th>
                <th className="py-3 px-4 font-semibold">Alergias</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => {
                const cleanPhone = patient.phone.replace(/\D/g, '');
                const waUrl = `https://wa.me/55${cleanPhone}?text=Olá ${patient.name}, contato da Lucy Clinica.`;

                return (
                  <tr key={patient.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#185BA6] flex items-center justify-center font-bold text-xs">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#17212B]">{patient.name}</p>
                          <span className="text-[11px] text-gray-500">
                            {patient.gender} • Sangue {patient.bloodType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">{patient.cpf}</td>
                    <td className="py-3 px-4">
                      <p className="text-[#17212B] font-medium">{patient.phone}</p>
                      <p className="text-[10px] text-gray-500">{patient.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#185BA6] border border-blue-200">
                        {patient.insuranceProvider}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((a, i) => (
                            <span key={i} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Nenhuma</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block p-1.5 rounded text-emerald-700 hover:bg-emerald-50"
                        title="Abrir WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-2.5 py-1 rounded-[6px] border border-[#D9DFE5] text-[11px] font-semibold hover:bg-blue-50 hover:text-[#185BA6]"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Modal */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <h3 className="font-heading text-lg font-bold text-[#185BA6]">
                Cadastrar Novo Paciente
              </h3>
              <button
                onClick={() => setIsNewPatientModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Convênio
                  </label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  >
                    <option value="Particular">Particular</option>
                    <option value="Bradesco Saúde">Bradesco Saúde</option>
                    <option value="SulAmérica">SulAmérica</option>
                    <option value="Unimed">Unimed</option>
                    <option value="Amil">Amil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Tipo Sanguíneo
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Alergias conhecidas (separar por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Dipirona, Penicilina, Iodo..."
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Condições Crônicas
                </label>
                <input
                  type="text"
                  placeholder="Hipertensão, Diabetes..."
                  value={chronicText}
                  onChange={(e) => setChronicText(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#D9DFE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="h-[36px] px-3.5 rounded-[8px] border border-[#D9DFE5] text-xs text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-5 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold hover:bg-[#144b8a]"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <h3 className="font-heading text-lg font-bold text-[#17212B]">
                Ficha Cadastral — {selectedPatient.name}
              </h3>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F5F9FD] rounded-[8px] border border-[#D9DFE5]">
                <div>CPF: <strong>{selectedPatient.cpf}</strong></div>
                <div>Nascimento: <strong>{selectedPatient.birthDate}</strong></div>
                <div>Telefone: <strong>{selectedPatient.phone}</strong></div>
                <div>Convênio: <strong>{selectedPatient.insuranceProvider}</strong></div>
                <div>Sangue: <strong>{selectedPatient.bloodType}</strong></div>
                <div>Cadastrado em: <strong>{new Date(selectedPatient.createdAt).toLocaleDateString('pt-BR')}</strong></div>
              </div>

              <div>
                <h5 className="font-bold text-[#17212B] mb-1">Alergias Documentadas:</h5>
                {selectedPatient.allergies.length > 0 ? (
                  <p className="text-red-700 bg-red-50 p-2 rounded border border-red-200">
                    {selectedPatient.allergies.join(', ')}
                  </p>
                ) : (
                  <p className="text-gray-500">Nenhuma alergia relatada.</p>
                )}
              </div>

              <div>
                <h5 className="font-bold text-[#17212B] mb-1">Histórico de Atendimentos:</h5>
                <p className="text-gray-600">
                  {appointments.filter((a) => a.patientId === selectedPatient.id).length} agendamentos registrados no sistema.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#D9DFE5] text-right">
              <button
                onClick={() => setSelectedPatient(null)}
                className="h-[36px] px-4 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
