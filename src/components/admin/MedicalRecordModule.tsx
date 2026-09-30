import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { MedicalRecord, Patient } from '../../types';
import {
  FileText,
  User,
  Stethoscope,
  Plus,
  AlertCircle,
  History,
  CheckCircle2,
  Lock,
  Search,
  Printer,
  Edit3,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';

export const MedicalRecordModule: React.FC = () => {
  const { medicalRecords, patients, finishConsultation, rectifyMedicalRecord, queue } = useClinic();
  const { currentUser } = useAuth();

  // ACCESS CONTROL GATE: Strict CFM/LGPD protection!
  const hasClinicalAccess = currentUser.role === 'medico' || currentUser.role === 'admin';

  const [selectedRecordId, setSelectedRecordId] = useState<string>(medicalRecords[0]?.id ?? '');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState<boolean>(false);
  const [isRectificationModalOpen, setIsRectificationModalOpen] = useState<boolean>(false);

  // New Consultation Form state (SOEP / SOAP)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id ?? '');
  const [subjective, setSubjective] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [examRequestsText, setExamRequestsText] = useState<string>('');
  const [prescriptionMedication, setPrescriptionMedication] = useState<string>('');
  const [prescriptionDosage, setPrescriptionDosage] = useState<string>('');
  const [prescriptionFrequency, setPrescriptionFrequency] = useState<string>('');
  const [prescriptionDuration, setPrescriptionDuration] = useState<string>('');

  // Rectification form state
  const [rectificationReason, setRectificationReason] = useState<string>('');
  const [rectifiedPlan, setRectifiedPlan] = useState<string>('');

  if (!hasClinicalAccess) {
    return (
      <div className="bg-white rounded-[10px] border border-red-200 p-8 text-center max-w-2xl mx-auto shadow-sm my-10">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-[#17212B]">
          Acesso Restrito ao Prontuário Médico (PEP)
        </h2>
        <p className="text-xs text-[#52606D] mt-2 leading-relaxed">
          Por determinação do Conselho Federal de Medicina (CFM) e da Lei Geral de Proteção de Dados (LGPD),
          o acesso às anotações clínicas, diagnósticos e prescrições é restrito exclusivamente ao profissional médico habilitado e à diretoria clínica.
        </p>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-[8px] text-[11px] text-amber-900 text-left">
          <strong>Seu perfil atual:</strong> <span className="capitalize">{currentUser.displayName}</span> ({currentUser.role}).
          Recepção, financeiro e administradores master não possuem autorização para violar o sigilo clínico dos pacientes.
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Para testar esta tela, utilize o <strong>Alternador de Perfis</strong> no topo da página e selecione <strong>Médica Habilitada (Dra. Lúcia)</strong>.
        </p>
      </div>
    );
  }

  const selectedRecord = medicalRecords.find((r) => r.id === selectedRecordId) || medicalRecords[0];

  const filteredRecords = medicalRecords.filter(
    (rec) =>
      rec.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      rec.professionalCrm.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleStartNewConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjective.trim() || !assessment.trim()) {
      alert('Por favor, preencha a queixa clínica (Subjetivo) e a Hipótese Diagnóstica (Avaliação).');
      return;
    }

    // Split exams
    const exams = examRequestsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // Build prescription array
    const prescriptions = prescriptionMedication
      ? [
          {
            medication: prescriptionMedication,
            dosage: prescriptionDosage || '1 comprimido',
            route: 'Via oral',
            frequency: prescriptionFrequency || 'Conforme receita',
            duration: prescriptionDuration || 'Uso contínuo',
            instructions: 'Tomar com água.',
          },
        ]
      : [];

    try {
      // Find queue entry if any, or mock queueId
      const targetQueue = queue.find((q) => q.patientId === selectedPatientId) || queue[0];
      const newRec = await finishConsultation(targetQueue.id, {
        subjective,
        objective: objective || 'Exame físico sem alterações significativas.',
        assessment,
        plan,
        examRequests: exams,
        prescriptions,
      });

      setSelectedRecordId(newRec.id);
      setIsNewRecordModalOpen(false);
      // Reset
      setSubjective('');
      setObjective('');
      setAssessment('');
      setPlan('');
      setExamRequestsText('');
      setPrescriptionMedication('');
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar evolução clínica.');
    }
  };

  const handleRectifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rectificationReason.trim()) {
      alert('A justificativa da retificação é obrigatória por norma legal do CFM.');
      return;
    }

    rectifyMedicalRecord(selectedRecord.id, rectificationReason, {
      plan: rectifiedPlan || selectedRecord.plan,
    });

    setIsRectificationModalOpen(false);
    setRectificationReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Prontuário Eletrônico do Paciente (PEP)
          </h2>
          <p className="text-xs text-[#52606D]">
            Evolução clínica no modelo SOEP/SOAP, solicitações de exames, prescrições e histórico de retificações.
          </p>
        </div>

        <button
          onClick={() => setIsNewRecordModalOpen(true)}
          className="h-[40px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Nova Evolução Clínica
        </button>
      </div>

      {/* Main Grid: Left List + Right Record Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Records list */}
        <div className="lg:col-span-4 bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs flex flex-col max-h-[750px] overflow-hidden">
          <div className="p-3.5 border-b border-[#D9DFE5] bg-[#F5F9FD]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente ou CRM..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {filteredRecords.map((rec) => {
              const isSelected = rec.id === selectedRecord?.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-l-[#185BA6]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#17212B]">{rec.patientName}</h4>
                    <span className="text-[10px] text-gray-500">
                      {new Date(rec.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#185BA6] font-semibold mt-0.5">
                    {rec.professionalName} ({rec.professionalCrm})
                  </p>
                  <p className="text-[11px] text-[#52606D] line-clamp-1 mt-1">
                    {rec.assessment}
                  </p>

                  {rec.rectified && (
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Retificado ({rec.rectifications.length})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Clinical Chart (SOEP) */}
        <div className="lg:col-span-8 bg-white rounded-[10px] border border-[#D9DFE5] p-6 shadow-xs space-y-6">
          {selectedRecord ? (
            <div>
              {/* Patient and Doctor header card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D9DFE5] gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Registro de Atendimento Médico
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#17212B] mt-1">
                    {selectedRecord.patientName}
                  </h3>
                  <p className="text-xs text-[#52606D]">
                    Responsável: <strong>{selectedRecord.professionalName}</strong> ({selectedRecord.professionalCrm})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRectifiedPlan(selectedRecord.plan);
                      setIsRectificationModalOpen(true);
                    }}
                    className="h-[36px] px-3 rounded-[8px] border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" /> Retificar Registro
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="h-[36px] px-3 rounded-[8px] border border-[#D9DFE5] text-[#17212B] text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-500" /> Imprimir
                  </button>
                </div>
              </div>

              {/* Rectification Alert Banner */}
              {selectedRecord.rectified && selectedRecord.rectifications.length > 0 && (
                <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-[10px] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <History className="w-4 h-4 text-amber-700" />
                    Histórico de Retificações Registradas (Conformidade CFM)
                  </div>
                  {selectedRecord.rectifications.map((r, i) => (
                    <div key={i} className="text-xs text-amber-950 bg-white/70 p-2.5 rounded border border-amber-100">
                      <div className="flex justify-between font-semibold text-[11px] text-gray-600">
                        <span>Retificado por: {r.rectifiedByName} ({r.rectifiedByCrm})</span>
                        <span>{new Date(r.rectifiedAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="mt-1">
                        <strong>Motivo legal:</strong> {r.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* SOEP Structure */}
              <div className="mt-6 space-y-5">
                {/* S - Subjetivo */}
                <div className="p-4 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px]">
                  <h4 className="font-heading font-bold text-xs uppercase text-[#185BA6] flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#185BA6] text-white flex items-center justify-center text-[10px]">S</span>
                    Subjetivo (Anamnese & Queixa Principal)
                  </h4>
                  <p className="text-xs text-[#17212B] leading-relaxed whitespace-pre-line">
                    {selectedRecord.subjective}
                  </p>
                </div>

                {/* O - Objetivo */}
                <div className="p-4 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px]">
                  <h4 className="font-heading font-bold text-xs uppercase text-[#185BA6] flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#185BA6] text-white flex items-center justify-center text-[10px]">O</span>
                    Objetivo (Exame Físico & Sinais Vitais)
                  </h4>
                  <p className="text-xs text-[#17212B] leading-relaxed whitespace-pre-line">
                    {selectedRecord.objective}
                  </p>
                </div>

                {/* E / A - Avaliação */}
                <div className="p-4 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px]">
                  <h4 className="font-heading font-bold text-xs uppercase text-[#185BA6] flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#185BA6] text-white flex items-center justify-center text-[10px]">A</span>
                    Avaliação (Hipótese Diagnóstica & Raciocínio Clínico)
                  </h4>
                  <p className="text-xs text-[#17212B] font-semibold leading-relaxed">
                    {selectedRecord.assessment}
                  </p>
                </div>

                {/* P - Plano & Conduta */}
                <div className="p-4 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px]">
                  <h4 className="font-heading font-bold text-xs uppercase text-[#185BA6] flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#185BA6] text-white flex items-center justify-center text-[10px]">P</span>
                    Plano Terapêutico & Orientações
                  </h4>
                  <p className="text-xs text-[#17212B] leading-relaxed whitespace-pre-line">
                    {selectedRecord.plan}
                  </p>
                </div>

                {/* Exames Solicitados */}
                {selectedRecord.examRequests && selectedRecord.examRequests.length > 0 && (
                  <div className="p-4 bg-white border border-[#D9DFE5] rounded-[10px]">
                    <h5 className="font-bold text-xs text-[#17212B] mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#185BA6]" />
                      Exames Complementares Solicitados
                    </h5>
                    <ul className="list-disc list-inside text-xs text-[#52606D] space-y-1">
                      {selectedRecord.examRequests.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prescrição Médica Registrada */}
                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div className="p-4 bg-white border border-[#D9DFE5] rounded-[10px]">
                    <h5 className="font-bold text-xs text-[#17212B] mb-2 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-emerald-700" />
                      Prescrição Médica Registrada pelo Profissional
                    </h5>
                    <div className="space-y-2">
                      {selectedRecord.prescriptions.map((rx, idx) => (
                        <div key={idx} className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs">
                          <p className="font-bold text-[#17212B]">{rx.medication}</p>
                          <p className="text-[#52606D] text-[11px]">
                            Posologia: {rx.dosage} • {rx.route} • {rx.frequency} • {rx.duration}
                          </p>
                          {rx.instructions && (
                            <p className="text-gray-500 text-[10px] mt-0.5">Obs: {rx.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Signature Footer */}
              <div className="pt-4 border-t border-[#D9DFE5] flex items-center justify-between text-xs text-[#52606D]">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Autoria registrada por {selectedRecord.professionalName} ({selectedRecord.professionalCrm})</span>
                </div>
                <span>Data do registro: {new Date(selectedRecord.createdAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              Nenhum prontuário selecionado.
            </div>
          )}
        </div>
      </div>

      {/* New Consultation Modal */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-[#D9DFE5] bg-[#F5F9FD] flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#185BA6] flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#185BA6]" />
                  Nova Evolução Clínica — Prontuário Médico (SOEP)
                </h3>
                <p className="text-xs text-[#52606D]">
                  Autoria médica habilitada vinculada ao seu CRM: {currentUser.crm || 'CRM/SP Registrado'}
                </p>
              </div>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartNewConsultation} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Selecione o Paciente
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold text-[#17212B]"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (CPF: {p.cpf})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  S — Subjetivo (Anamnese, Queixa Principal e HDA)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Relato do paciente, início dos sintomas, fatores de melhora ou piora..."
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  O — Objetivo (Exame Físico Específico e Sinais Vitais)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ausculta cardíaca, pulmonar, inspeção, palpação, PA e dados da triagem..."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  A — Avaliação (Hipótese Diagnóstica / Raciocínio Clínico)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hipertensão Arterial Sistêmica Estágio 1 / Cefaleia tensional..."
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  P — Plano Terapêutico, Orientações e Conduta
                </label>
                <textarea
                  rows={2}
                  placeholder="Conduta clínica, medidas higienodietéticas, orientações de retorno..."
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Exames Solicitados (1 por linha)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hemograma Completo&#10;Eletrocardiograma de repouso"
                    value={examRequestsText}
                    onChange={(e) => setExamRequestsText(e.target.value)}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Prescrição de Medicamento
                  </label>
                  <input
                    type="text"
                    placeholder="Medicamento (Ex: Losartana 50mg)"
                    value={prescriptionMedication}
                    onChange={(e) => setPrescriptionMedication(e.target.value)}
                    className="w-full p-1.5 mb-1 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Posologia (Ex: 1 comp pela manhã por 30 dias)"
                    value={prescriptionFrequency}
                    onChange={(e) => setPrescriptionFrequency(e.target.value)}
                    className="w-full p-1.5 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-[8px] text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Registro médico em conformidade estrita com o CFM: a autoria é vinculada e não há diagnósticos automáticos.
                </span>
              </div>

              <div className="pt-3 border-t border-[#D9DFE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="h-[38px] px-4 rounded-[8px] border border-[#D9DFE5] text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-[8px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold"
                >
                  Assinar e Finalizar Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retification Modal */}
      {isRectificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-lg p-6">
            <h3 className="font-heading text-lg font-bold text-amber-900 flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-amber-600" />
              Retificação Justificada de Prontuário
            </h3>
            <p className="text-xs text-[#52606D] mb-4">
              Por norma ética do CFM, o texto original nunca é apagado. Sua retificação ficará arquivada com CRM e carimbo de data/hora.
            </p>

            <form onSubmit={handleRectifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Justificativa Legal da Retificação (Obrigatória)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Informe detalhadamente o motivo da correção clínica..."
                  value={rectificationReason}
                  onChange={(e) => setRectificationReason(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Texto Retificado / Complemento de Conduta (Plano)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rectifiedPlan}
                  onChange={(e) => setRectifiedPlan(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#D9DFE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRectificationModalOpen(false)}
                  className="h-[36px] px-3.5 rounded-[8px] border border-[#D9DFE5] text-xs font-semibold text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  Salvar Retificação com CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
