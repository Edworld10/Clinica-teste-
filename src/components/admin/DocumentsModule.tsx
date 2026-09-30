import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { PrivateDocument } from '../../types';
import {
  FileText,
  Lock,
  Upload,
  Eye,
  Download,
  ShieldCheck,
  Search,
  History,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const DocumentsModule: React.FC = () => {
  const { documents, logDocumentAccess, uploadPrivateDocument, patients } = useClinic();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<PrivateDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form
  const [docTitle, setDocTitle] = useState('');
  const [docPatientId, setDocPatientId] = useState(patients[0]?.id ?? '');
  const [docCategory, setDocCategory] = useState<'exame' | 'receita' | 'atestado' | 'laudo' | 'outro'>('laudo');
  const [fileName, setFileName] = useState('');

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDoc = (docItem: PrivateDocument) => {
    logDocumentAccess(docItem.id, 'visualizado');
    setSelectedDoc(docItem);
  };

  const handleDownload = (docItem: PrivateDocument) => {
    logDocumentAccess(docItem.id, 'baixado');
    alert(`Download do arquivo ${docItem.fileName} registrado com sucesso para auditoria.`);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const patient = patients.find((p) => p.id === docPatientId) || patients[0];

    uploadPrivateDocument({
      organizationId: 'lucy-clinica-matriz',
      patientId: patient.id,
      patientName: patient.name,
      uploaderId: currentUser.id,
      uploaderName: currentUser.displayName,
      uploaderRole: currentUser.role,
      title: docTitle,
      category: docCategory,
      fileUrl: '#arquivo-seguro',
      fileName: fileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: '840 KB',
      isConfidential: true,
    });

    setIsUploadModalOpen(false);
    setDocTitle('');
    setFileName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B]">
            Documentos Médicos Privados & Anexos
          </h2>
          <p className="text-xs text-[#52606D]">
            Repositório seguro de exames, laudos e receitas com auditoria de visualização e download.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="h-[40px] px-4 rounded-[10px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
        >
          <Upload className="w-4 h-4" /> Anexar Novo Documento
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-[10px] flex items-center gap-3 text-xs text-[#185BA6]">
        <ShieldCheck className="w-5 h-5 text-[#185BA6] shrink-0" />
        <div>
          <strong>Controle de Sigilo Ativo:</strong> Todos os acessos a documentos confidenciais são rastreados com carimbo de data/hora, perfil do usuário e identificação do solicitante.
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D9DFE5] bg-[#F5F9FD] flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por documento, paciente ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#52606D]">
            Total: <strong>{documents.length} documentos</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[#52606D] bg-gray-50/50">
                <th className="py-3 px-4 font-semibold">Documento / Título</th>
                <th className="py-3 px-4 font-semibold">Paciente</th>
                <th className="py-3 px-4 font-semibold">Categoria</th>
                <th className="py-3 px-4 font-semibold">Responsável</th>
                <th className="py-3 px-4 font-semibold">Acessos</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((docItem) => (
                <tr key={docItem.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-[#185BA6] shrink-0" />
                      <div>
                        <p className="font-bold text-[#17212B]">{docItem.title}</p>
                        <span className="text-[10px] text-gray-400 font-mono">{docItem.fileName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#17212B]">{docItem.patientName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                      {docItem.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#52606D]">
                    {docItem.uploaderName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold text-[#185BA6]">
                      {docItem.accessLogs.length} leituras
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDoc(docItem)}
                      className="px-2.5 py-1 rounded bg-[#F5F9FD] border border-[#D9DFE5] text-[11px] font-semibold text-[#185BA6] hover:bg-blue-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" /> Ver
                    </button>
                    <button
                      onClick={() => handleDownload(docItem)}
                      className="px-2.5 py-1 rounded bg-gray-100 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 transition"
                    >
                      <Download className="w-3.5 h-3.5 inline mr-1" /> Baixar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Details Modal with Audit History */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <h3 className="font-heading text-lg font-bold text-[#17212B] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#185BA6]" />
                {selectedDoc.title}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-[#F5F9FD] rounded border border-[#D9DFE5]">
                <p>Paciente: <strong>{selectedDoc.patientName}</strong></p>
                <p>Enviado por: <strong>{selectedDoc.uploaderName}</strong></p>
                <p>Data: <strong>{new Date(selectedDoc.createdAt).toLocaleString('pt-BR')}</strong></p>
                <p>Tamanho: <strong>{selectedDoc.fileSize}</strong></p>
              </div>

              <div>
                <h5 className="font-bold text-[#17212B] mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#185BA6]" />
                  Auditoria de Leitura e Download deste Documento
                </h5>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded max-h-48 overflow-y-auto">
                  {selectedDoc.accessLogs.map((log, i) => (
                    <div key={i} className="p-2 text-[11px] flex justify-between bg-white">
                      <span>{log.accessedBy} ({log.accessedRole}) - {log.action}</span>
                      <span className="text-gray-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                  {selectedDoc.accessLogs.length === 0 && (
                    <div className="p-3 text-gray-400 text-center">Nenhum acesso registrado ainda.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9DFE5] text-right">
              <button
                onClick={() => setSelectedDoc(null)}
                className="h-[36px] px-4 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-md p-6">
            <h3 className="font-heading text-lg font-bold text-[#185BA6] mb-3">
              Anexar Documento Confidencial
            </h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Paciente
                </label>
                <select
                  value={docPatientId}
                  onChange={(e) => setDocPatientId(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Título do Arquivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Resultado MAPA 24h"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Categoria
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                >
                  <option value="laudo">Laudo Clínico</option>
                  <option value="exame">Exame Laboratorial / Imagem</option>
                  <option value="receita">Receita Médica</option>
                  <option value="atestado">Atestado Médico</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Nome do Arquivo (PDF)
                </label>
                <input
                  type="text"
                  placeholder="laudo_exame.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#D9DFE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="h-[36px] px-3.5 rounded-[8px] border border-[#D9DFE5] text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-4 rounded-[8px] bg-[#185BA6] text-white text-xs font-semibold"
                >
                  Salvar e Anexar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
