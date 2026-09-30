import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Heart,
  Shield,
  FileText,
  Upload,
  MessageCircle,
  Stethoscope,
  CheckCircle,
  Download,
  Eye,
  Lock,
  ChevronRight,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { BookAppointmentModal } from './BookAppointmentModal';

export const PatientPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    organization,
    appointments,
    professionals,
    documents,
    uploadPrivateDocument,
    logDocumentAccess,
  } = useClinic();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocToView, setSelectedDocToView] = useState<any>(null);

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'exame' | 'receita' | 'atestado' | 'outro'>('exame');
  const [fileName, setFileName] = useState('');
  const [isConfidential, setIsConfidential] = useState(true);

  // Find next appointment for current patient
  const patientApts = appointments.filter(
    (a) =>
      a.patientId === currentUser.id ||
      a.patientName.toLowerCase().includes(currentUser.displayName.toLowerCase()) ||
      a.patientCpf === currentUser.cpf
  );

  const nextAppointment =
    patientApts.find((a) => a.status !== 'concluido' && a.status !== 'cancelado') || patientApts[0];

  // Patient documents
  const patientDocs = documents.filter(
    (d) =>
      d.patientId === currentUser.id ||
      d.patientName.toLowerCase().includes(currentUser.displayName.toLowerCase())
  );

  const cleanPhone = organization.whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá! Sou ${currentUser.displayName}, paciente da Lucy Clinica. Gostaria de tirar uma dúvida sobre meu atendimento.`
  )}`;

  // Stepper calculations
  const getStepperIndex = (status?: string) => {
    switch (status) {
      case 'agendado':
        return 0;
      case 'confirmado':
        return 1;
      case 'em_espera':
      case 'em_triagem':
        return 2;
      case 'em_atendimento':
        return 3;
      case 'concluido':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepperIndex(nextAppointment?.status);

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    uploadPrivateDocument({
      organizationId: organization.id,
      patientId: currentUser.id,
      patientName: currentUser.displayName,
      uploaderId: currentUser.id,
      uploaderName: currentUser.displayName,
      uploaderRole: 'paciente',
      title: docTitle,
      category: docCategory,
      fileUrl: '#arquivo-seguro',
      fileName: fileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.4 MB',
      isConfidential,
    });

    setDocTitle('');
    setFileName('');
    setUploadModalOpen(false);
  };

  const handleViewDoc = (docItem: any) => {
    logDocumentAccess(docItem.id, 'visualizado');
    setSelectedDocToView(docItem);
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Category Navigation Pills (simulating top nav of image 1) */}
      <div className="bg-white rounded-[10px] p-2 border border-[#D9DFE5] flex items-center gap-2 overflow-x-auto text-xs font-semibold text-[#52606D]">
        <button className="px-3.5 py-1.5 rounded-full bg-[#185BA6] text-white flex items-center gap-1.5 shrink-0">
          <Heart className="w-3.5 h-3.5" />
          Início
        </button>
        <button
          onClick={() => setBookingModalOpen(true)}
          className="px-3.5 py-1.5 rounded-full hover:bg-gray-100 hover:text-[#17212B] transition flex items-center gap-1.5 shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 text-[#185BA6]" />
          Agendar Consulta
        </button>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-3.5 py-1.5 rounded-full hover:bg-gray-100 hover:text-[#17212B] transition flex items-center gap-1.5 shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          Enviar Receita ou Exame
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-full hover:bg-gray-100 hover:text-[#17212B] transition flex items-center gap-1.5 shrink-0 text-emerald-700"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          Falar com a Recepção (WhatsApp)
        </a>
      </div>

      {/* Main Grid: Hero Banner + Next Appointment Tracker (Fidelity to Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero Banner */}
        <div className="lg:col-span-7 bg-gradient-to-r from-[#EBF3FC] via-[#F0F7FF] to-white rounded-[10px] border border-[#D9DFE5] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xs">
          <div className="relative z-10 max-w-md">
            <span className="inline-block text-[11px] font-bold text-[#185BA6] bg-blue-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-3">
              Lucy Clinica • São Paulo - SP
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#17212B] leading-tight">
              Cuidar de você faz parte da nossa história
            </h1>
            <p className="text-sm text-[#52606D] mt-2.5 leading-relaxed">
              Consultas médicas presenciais e teleatendimento com médicos especialistas, pontualidade, sigilo e prontuário integrado.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedSpecialty('');
                  setBookingModalOpen(true);
                }}
                className="h-[44px] px-6 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white font-semibold text-sm transition shadow-sm flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Agendar Consulta
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[44px] px-5 rounded-[10px] bg-white hover:bg-gray-50 border border-[#D9DFE5] text-[#17212B] font-semibold text-sm transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Atendimento Rápido
              </a>
            </div>
          </div>

          {/* Decorative badge in banner */}
          <div className="hidden sm:block absolute right-6 bottom-4 pointer-events-none opacity-20">
            <Heart className="w-48 h-48 text-[#185BA6]" />
          </div>
        </div>

        {/* Right Card: Meu próximo agendamento (Matches Image 1) */}
        <div className="lg:col-span-5 bg-white rounded-[10px] border border-[#D9DFE5] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-[#185BA6]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#17212B]">
                    Meu próximo agendamento
                  </h3>
                  <p className="text-xs text-[#52606D]">Status em tempo real</p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="text-xs font-bold text-[#185BA6] hover:underline"
              >
                Ver todos &gt;
              </button>
            </div>

            {nextAppointment ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                      {nextAppointment.type === 'primeira_consulta' ? 'Consulta Médica' : 'Retorno'}
                    </span>
                    <h4 className="font-bold text-sm text-[#17212B] mt-1.5">
                      {nextAppointment.professionalName}
                    </h4>
                    <p className="text-xs text-[#52606D]">
                      {nextAppointment.specialty} • {nextAppointment.roomName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-[#185BA6] block">
                      {nextAppointment.price > 0 ? `R$ ${nextAppointment.price.toFixed(2)}` : 'Sem Custo (Retorno)'}
                    </span>
                    <span className="text-[11px] text-[#52606D]">
                      {nextAppointment.date} às {nextAppointment.time}
                    </span>
                  </div>
                </div>

                {/* Stepper (as seen in mockup 01) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-center mb-1.5">
                    <span className={currentStep >= 0 ? 'text-[#185BA6]' : 'text-gray-400'}>
                      Confirmado
                    </span>
                    <span className={currentStep >= 1 ? 'text-[#185BA6]' : 'text-gray-400'}>
                      Em triagem
                    </span>
                    <span className={currentStep >= 2 ? 'text-[#185BA6]' : 'text-gray-400'}>
                      Aguardando
                    </span>
                    <span className={currentStep >= 3 ? 'text-[#185BA6]' : 'text-gray-400'}>
                      Em consulta
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between px-2">
                    <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-0" />
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-[#185BA6] -z-0 transition-all duration-300"
                      style={{ width: `${Math.min(100, currentStep * 33.3)}%` }}
                    />

                    {[0, 1, 2, 3].map((stepIdx) => (
                      <div
                        key={stepIdx}
                        className={`w-5 h-5 rounded-full z-10 flex items-center justify-center text-[10px] font-bold transition ${
                          stepIdx <= currentStep
                            ? 'bg-[#185BA6] text-white ring-4 ring-blue-50'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}
                      >
                        {stepIdx <= currentStep ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">
                Nenhuma consulta agendada para hoje.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#D9DFE5] mt-4 flex items-center justify-between">
            <span className="text-xs text-[#52606D] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Horário ambulatorial: 07:00 às 17:00
            </span>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="h-[36px] px-3.5 rounded-[10px] bg-[#185BA6] text-white text-xs font-semibold hover:bg-[#144b8a] transition"
            >
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Row of Action Cards (Matches 01-painel-usuario.png) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Atendimento Clínico */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-[10px] bg-blue-50 text-[#185BA6]">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#17212B] text-base">
                Atendimento Clínico
              </h3>
              <p className="text-xs text-[#52606D] mt-1 leading-relaxed">
                Tire suas dúvidas pré-consulta, orientações de exames e triagem de forma rápida e segura.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-[#52606D]">Atendimento seg. a sáb. 07h às 17h</span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[36px] px-3 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Falar agora
            </a>
          </div>
        </div>

        {/* Card 2: Enviar Receita ou Exame */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-[10px] bg-emerald-50 text-emerald-700">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#17212B] text-base">
                Enviar Receita ou Exame
              </h3>
              <p className="text-xs text-[#52606D] mt-1 leading-relaxed">
                Envie seus laudos e exames para anexarmos de forma confidencial ao seu prontuário médico.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> Dados protegidos e confidenciais
            </span>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="h-[36px] px-3.5 rounded-[10px] border border-[#D9DFE5] text-[#17212B] hover:bg-gray-50 text-xs font-semibold transition"
            >
              Enviar documento
            </button>
          </div>
        </div>

        {/* Card 3: Segurança e Conformidade */}
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-[10px] bg-blue-50 text-[#1E675F]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#17212B] text-base">
                Prontuário Seguro & LGPD
              </h3>
              <ul className="text-xs text-[#52606D] mt-1.5 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Conferência médica por profissional habilitado
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Histórico e retificações registradas
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Auditoria de leitura e sigilo inviolável
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-[#52606D]">
            Em conformidade com as resoluções do Conselho Federal de Medicina.
          </div>
        </div>
      </div>

      {/* Specialties & Doctors Carousel / Cards (Reference to Mockup's Products em Destaque) */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9DFE5]">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#17212B]">
              Especialidades Médicas & Corpo Clínico
            </h3>
            <p className="text-xs text-[#52606D]">
              Agendamentos disponíveis para hoje e próximas datas na Lucy Clinica
            </p>
          </div>
          <button
            onClick={() => setBookingModalOpen(true)}
            className="text-xs font-bold text-[#185BA6] hover:underline"
          >
            Ver todas as especialidades &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] p-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#185BA6] text-white flex items-center justify-center font-bold text-base mb-3 shadow-xs">
                  {pro.name.split(' ')[1]?.charAt(0) || 'D'}
                </div>
                <h4 className="font-bold text-sm text-[#17212B] line-clamp-1">{pro.name}</h4>
                <p className="text-[11px] text-[#185BA6] font-semibold mt-0.5">
                  CRM/{pro.crmUf} {pro.crm}
                </p>
                <p className="text-xs text-[#52606D] mt-1 line-clamp-1">{pro.specialty}</p>
                <p className="text-[11px] text-[#52606D] mt-2">
                  Atendimento: {pro.workHoursStart} às {pro.workHoursEnd}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <span className="text-xs font-extrabold text-[#17212B] block">
                  R$ {pro.consultationFee.toFixed(2)}
                </span>
                <button
                  onClick={() => {
                    setSelectedSpecialty(pro.specialty);
                    setBookingModalOpen(true);
                  }}
                  className="w-full mt-2 h-[34px] rounded-[8px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold transition"
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents & Receipts Section */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9DFE5]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#185BA6]" />
            <div>
              <h3 className="font-heading text-lg font-bold text-[#17212B]">
                Meus Documentos e Receitas Privadas
              </h3>
              <p className="text-xs text-[#52606D]">
                Acesso restrito ao paciente com log de auditoria de visualização
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="h-[36px] px-3.5 rounded-[10px] bg-[#1E675F] hover:bg-[#16504a] text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Novo Documento
          </button>
        </div>

        {patientDocs.length > 0 ? (
          <div className="divide-y divide-gray-100 mt-2">
            {patientDocs.map((docItem) => (
              <div
                key={docItem.id}
                className="py-3.5 flex items-center justify-between hover:bg-gray-50/50 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#185BA6]">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#17212B]">{docItem.title}</h5>
                    <p className="text-xs text-[#52606D]">
                      Enviado por: {docItem.uploaderName} • Categoria: <strong className="capitalize">{docItem.category}</strong> • {docItem.fileSize}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      Disponibilizado em: {new Date(docItem.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDoc(docItem)}
                    className="h-[34px] px-3 rounded-[8px] border border-[#D9DFE5] text-xs font-semibold text-[#185BA6] hover:bg-blue-50 flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Visualizar
                  </button>
                  <button
                    onClick={() => {
                      logDocumentAccess(docItem.id, 'baixado');
                      alert(`Download iniciado para ${docItem.fileName}. Auditoria registrada no sistema.`);
                    }}
                    className="h-[34px] px-3 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#17212B] flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-gray-500">
            Nenhum documento confidencial cadastrado até o momento.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedSpecialty={selectedSpecialty}
      />

      {/* Document Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-md p-6">
            <h3 className="font-heading text-lg font-bold text-[#17212B] mb-1 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#185BA6]" />
              Enviar Receita ou Exame
            </h3>
            <p className="text-xs text-[#52606D] mb-4">
              O arquivo será anexado de forma sigilosa ao seu prontuário clínico.
            </p>

            <form onSubmit={handleUploadDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Título do Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Exame de Sangue / Receita de Cardiologia"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Categoria
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                >
                  <option value="exame">Exame Laboratorial / Imagem</option>
                  <option value="receita">Receita Médica</option>
                  <option value="atestado">Atestado Médico</option>
                  <option value="laudo">Laudo Clínico</option>
                  <option value="outro">Outro Documento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Nome do Arquivo (PDF ou Imagem)
                </label>
                <input
                  type="text"
                  placeholder="laudo_exame_2026.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-xs text-[#17212B]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded text-[#185BA6]"
                />
                <label htmlFor="confidential" className="text-xs font-medium text-[#17212B]">
                  Manter documento protegido por sigilo médico estrito
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="h-[38px] px-4 rounded-[10px] border border-[#D9DFE5] text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold"
                >
                  Enviar Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <h3 className="font-heading text-lg font-bold text-[#17212B] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#185BA6]" />
                {selectedDocToView.title}
              </h3>
              <button
                onClick={() => setSelectedDocToView(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="my-5 p-6 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[10px] text-center space-y-3">
              <FileText className="w-16 h-16 text-[#185BA6] mx-auto opacity-75" />
              <p className="font-bold text-sm text-[#17212B]">{selectedDocToView.fileName}</p>
              <p className="text-xs text-[#52606D]">
                Arquivo confidencial autenticado sob custódia digital da Lucy Clinica.
              </p>
              <div className="text-[11px] text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
                ✓ Auditoria de visualização salva às {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#52606D]">Tamanho: {selectedDocToView.fileSize}</span>
              <button
                onClick={() => setSelectedDocToView(null)}
                className="h-[36px] px-4 rounded-[10px] bg-[#185BA6] text-white text-xs font-semibold"
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
