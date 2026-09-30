import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QueueEntry } from '../../types';
import {
  Users,
  Activity,
  Bell,
  CheckCircle,
  Clock,
  Plus,
  Tv,
  ArrowRight,
  Heart,
  Thermometer,
  ShieldCheck,
  DoorClosed,
  Check,
  CheckSquare,
  Square,
  ArrowRightCircle,
  X,
  Volume2,
  Sparkles,
  ListChecks,
  Kanban,
  Repeat,
  Radio,
  UserCheck,
} from 'lucide-react';

export type ProcessStage = 'triagem' | 'espera' | 'consulta' | 'conclusao';

interface ProcessStepInfo {
  id: ProcessStage;
  stepNum: number;
  status: QueueEntry['status'];
  title: string;
  shortLabel: string;
  destination: string;
  badgeClass: string;
  colorHex: string;
}

const PROCESS_STEPS: ProcessStepInfo[] = [
  {
    id: 'triagem',
    stepNum: 1,
    status: 'esperando_triagem',
    title: '1. Triagem & Acolhimento',
    shortLabel: 'Triagem',
    destination: 'Sala de Triagem e Acolhimento',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    colorHex: '#D97706',
  },
  {
    id: 'espera',
    stepNum: 2,
    status: 'aguardando_medico',
    title: '2. Em Espera (Aguardando Médico)',
    shortLabel: 'Em Espera',
    destination: 'Sala de Espera (Aguardando Médico)',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    colorHex: '#185BA6',
  },
  {
    id: 'consulta',
    stepNum: 3,
    status: 'em_consulta',
    title: '3. Em Consulta (Consultório)',
    shortLabel: 'Em Consulta',
    destination: 'Consultório Médico',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    colorHex: '#7C3AED',
  },
  {
    id: 'conclusao',
    stepNum: 4,
    status: 'finalizado',
    title: '4. Conclusão (Finalizado)',
    shortLabel: 'Conclusão',
    destination: 'Atendimento Concluído',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    colorHex: '#059669',
  },
];

export const ReceptionQueueModule: React.FC = () => {
  const {
    queue,
    recordTriageVitals,
    callPatientToRoom,
    advanceQueueProcess,
    appointments,
    checkInPatientToQueue,
  } = useClinic();

  // Active view tab: 'kanban' or 'checklist'
  const [activeViewTab, setActiveViewTab] = useState<'kanban' | 'checklist'>('kanban');

  // Modals
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueEntry | null>(null);

  // Triage form inputs
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(36.5);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [o2, setO2] = useState(98);
  const [notes, setNotes] = useState('');

  // Call announcement state
  const [lastCalled, setLastCalled] = useState<QueueEntry | null>(() => {
    return queue.find((q) => q.status === 'em_consulta') || queue[0] || null;
  });

  // Voice Gender: 'feminino' (default) or 'masculino'
  const [voiceGender, setVoiceGender] = useState<'feminino' | 'masculino'>('feminino');

  // Audio Auto Call on Check toggle (default true: automatic call on every process check)
  const [autoAudioOnCheck, setAutoAudioOnCheck] = useState<boolean>(true);

  // Fullscreen TV Mode state
  const [isTvFullscreen, setIsTvFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; timestamp: number } | null>(null);

  // Call history with process type
  const [callHistory, setCallHistory] = useState<
    Array<{
      ticket: string;
      name: string;
      room: string;
      doctor?: string;
      time: string;
      type: ProcessStage;
      stepLabel: string;
    }>
  >([
    {
      ticket: 'CL-042',
      name: 'Carlos M. Silva',
      room: 'Consultório 2 - Cardiologia & ECG',
      doctor: 'Dra. Lúcia Santos',
      time: '09:20',
      type: 'espera',
      stepLabel: 'Em Espera',
    },
    {
      ticket: 'CL-040',
      name: 'Laura Pereira',
      room: 'Consultório 2 - Cardiologia',
      doctor: 'Dra. Lúcia Santos',
      time: '09:02',
      type: 'conclusao',
      stepLabel: 'Conclusão',
    },
    {
      ticket: 'CL-041',
      name: 'Mariana Costa',
      room: 'Sala de Triagem e Acolhimento',
      doctor: 'Dr. Marcelo Ramos',
      time: '08:50',
      type: 'triagem',
      stepLabel: 'Triagem',
    },
  ]);

  // Load voices when available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Sound chime using Web Audio API (Classic hospital 3-tone chime)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 3-tone pleasant hospital chime: C5 -> E5 -> G5
      const notesChime = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.18 },
        { freq: 783.99, time: 0.36 },
      ];

      notesChime.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.32, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.52);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + 0.55);
      });
    } catch (e) {
      // Audio fallback
    }
  };

  // Speak announcement in pt-BR using SpeechSynthesis API (Feminino ou Masculino)
  const speakAnnouncement = (
    ticket: string,
    patientName: string,
    destination: string,
    doctorName?: string,
    stage: ProcessStage = 'consulta',
    overrideGender?: 'feminino' | 'masculino'
  ) => {
    const genderToUse = overrideGender || voiceGender;

    // 1. Play hospital chime first
    playChime();

    // 2. Build spoken text in Brazilian Portuguese (pt-BR) based on exact process stage
    let text = '';
    switch (stage) {
      case 'triagem':
        text = `Atenção. Senha ${ticket}. Paciente ${patientName}. Favor comparecer à sala de triagem e acolhimento.`;
        break;
      case 'espera':
        text = `Atenção. Senha ${ticket}. Paciente ${patientName}. Triagem realizada com sucesso. Favor aguardar na recepção para a consulta médica.`;
        break;
      case 'consulta':
        text = `Atenção. Senha ${ticket}. Paciente ${patientName}. Favor comparecer ao ${destination}, com ${doctorName ? `doutor ${doctorName}` : 'o médico'}.`;
        break;
      case 'conclusao':
        text = `Atenção. Senha ${ticket}. Paciente ${patientName}. Atendimento médico concluído. A Lucy Clínica agradece e deseja uma ótima recuperação.`;
        break;
      default:
        text = `Atenção. Senha ${ticket}. Paciente ${patientName}. Favor comparecer ao ${destination}.`;
    }

    // 3. Synthesize speech in pt-BR with selected gender
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.90; // Natural, clear clinical pace
      // Pitch adjustment based on gender
      utterance.pitch = genderToUse === 'feminino' ? 1.18 : 0.88;

      const voices = window.speechSynthesis.getVoices();
      const feminineKeywords = [
        'luciana',
        'francisca',
        'leticia',
        'letícia',
        'heloisa',
        'heloísa',
        'maria',
        'vitoria',
        'vitória',
        'feminina',
        'female',
        'fabiola',
        'camila',
        'thalita',
      ];
      const masculineKeywords = [
        'ricardo',
        'felipe',
        'antonio',
        'antônio',
        'daniel',
        'roberto',
        'masculino',
        'male',
        'marcos',
        'lucas',
      ];

      const ptBrVoices = voices.filter(
        (v) =>
          v.lang === 'pt-BR' ||
          v.lang === 'pt_BR' ||
          (v.lang.startsWith('pt') && v.name.toLowerCase().includes('brasil'))
      );

      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (genderToUse === 'feminino') {
        selectedVoice = ptBrVoices.find((v) =>
          feminineKeywords.some((kw) => v.name.toLowerCase().includes(kw))
        );
        if (!selectedVoice) {
          selectedVoice = ptBrVoices.find(
            (v) => !masculineKeywords.some((kw) => v.name.toLowerCase().includes(kw))
          );
        }
      } else {
        selectedVoice = ptBrVoices.find((v) =>
          masculineKeywords.some((kw) => v.name.toLowerCase().includes(kw))
        );
        if (!selectedVoice) {
          selectedVoice = ptBrVoices.find(
            (v) => !feminineKeywords.some((kw) => v.name.toLowerCase().includes(kw))
          );
        }
      }

      if (!selectedVoice && ptBrVoices.length > 0) {
        selectedVoice = ptBrVoices[0];
      }
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith('pt'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Speak after chime intro
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 620);
    }
  };

  // Helper to map Queue status to ProcessStage index
  const getStageIndex = (status: QueueEntry['status']): number => {
    switch (status) {
      case 'esperando_triagem':
        return 0; // Triagem
      case 'aguardando_medico':
        return 1; // Em Espera
      case 'em_consulta':
        return 2; // Em Consulta
      case 'finalizado':
        return 3; // Conclusão
      default:
        return 0;
    }
  };

  // EXECUTE PROCESS CHECK:
  // Marcar check de cada processo, subir automaticamente no fluxo e sincronizar com a TV de chamada
  const handleProcessCheck = (
    item: QueueEntry,
    targetStage: ProcessStage,
    options?: { customVitals?: NonNullable<QueueEntry['vitals']>; playVoice?: boolean }
  ) => {
    let targetStatus: QueueEntry['status'];
    let stepTitle = '';
    let destination = item.roomName;

    switch (targetStage) {
      case 'triagem':
        targetStatus = 'esperando_triagem';
        stepTitle = '1. Triagem & Acolhimento';
        destination = 'Sala de Triagem e Acolhimento';
        break;
      case 'espera':
        targetStatus = 'aguardando_medico';
        stepTitle = '2. Em Espera (Sala de Espera)';
        destination = 'Sala de Espera (Aguardando Médico)';
        break;
      case 'consulta':
        targetStatus = 'em_consulta';
        stepTitle = '3. Em Consulta Médica';
        destination = item.roomName || 'Consultório Médico';
        break;
      case 'conclusao':
        targetStatus = 'finalizado';
        stepTitle = '4. Conclusão do Atendimento';
        destination = 'Atendimento Concluído';
        break;
    }

    // Auto-generate standard vitals if moving to 'espera' or beyond and vitals aren't set
    const finalVitals =
      options?.customVitals ||
      item.vitals ||
      (targetStage !== 'triagem'
        ? {
            bloodPressure: '120/80 mmHg',
            heartRate: 72,
            temperature: 36.5,
            weightKg: 70,
            heightCm: 170,
            oxygenSaturation: 98,
            triageNotes: 'Triagem rápida confirmada no fluxo de recepção.',
          }
        : undefined);

    // 1. Subir automático no estado do banco/contexto
    advanceQueueProcess(item.id, targetStatus, finalVitals);

    // 2. Sincronizar em tempo real com o Telão TV
    const updatedItem: QueueEntry = {
      ...item,
      status: targetStatus,
      vitals: finalVitals,
      triageDoneAt: targetStage !== 'triagem' ? item.triageDoneAt || new Date().toISOString() : undefined,
      calledAt: targetStage === 'consulta' || targetStage === 'conclusao' ? new Date().toISOString() : item.calledAt,
      finishedAt: targetStage === 'conclusao' ? new Date().toISOString() : undefined,
    };
    setLastCalled(updatedItem);

    // 3. Atualizar histórico do painel de TV
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setCallHistory((prev) => [
      {
        ticket: item.ticketNumber,
        name: item.patientName,
        room: destination,
        doctor: item.professionalName,
        time: nowStr,
        type: targetStage,
        stepLabel: stepTitle,
      },
      ...prev.slice(0, 5),
    ]);

    // 4. Disparar áudio em pt-BR com voz feminina/masculina se habilitado
    const shouldSpeak = options?.playVoice !== undefined ? options.playVoice : autoAudioOnCheck;
    if (shouldSpeak) {
      speakAnnouncement(item.ticketNumber, item.patientName, destination, item.professionalName, targetStage);
    }

    // 5. Visual sync confirmation badge
    setSyncFeedback({
      message: `✓ Check realizado! Paciente ${item.patientName} (${item.ticketNumber}) avançou para "${stepTitle}" e sincronizou com a TV.`,
      timestamp: Date.now(),
    });

    // Auto-dismiss feedback after 4.5s
    setTimeout(() => {
      setSyncFeedback((curr) => (curr && Date.now() - curr.timestamp >= 4000 ? null : curr));
    }, 4500);
  };

  // Test sound triggers
  const handleTestAudio = (stage: ProcessStage = 'consulta') => {
    const dest = stage === 'triagem' ? 'Sala de Triagem' : stage === 'espera' ? 'Sala de Espera' : stage === 'conclusao' ? 'Recepção' : 'Consultório 2 - Cardiologia';
    speakAnnouncement('CL-042', 'Carlos M. Silva', dest, 'Dra. Lúcia Santos', stage);
  };

  // Open detailed vitals triage modal
  const openTriage = (item: QueueEntry) => {
    setSelectedQueueItem(item);
    if (item.vitals) {
      setBp(item.vitals.bloodPressure?.replace(' mmHg', '') || '120/80');
      setHr(item.vitals.heartRate || 72);
      setTemp(item.vitals.temperature || 36.5);
      setWeight(item.vitals.weightKg || 70);
      setHeight(item.vitals.heightCm || 170);
      setO2(item.vitals.oxygenSaturation || 98);
      setNotes(item.vitals.triageNotes || '');
    } else {
      setBp('120/80');
      setHr(72);
      setTemp(36.5);
      setWeight(70);
      setHeight(170);
      setO2(98);
      setNotes('');
    }
    setTriageModalOpen(true);
  };

  // Save vitals from modal and auto-check into 'espera'
  const saveTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueItem) return;

    const vitalsData = {
      bloodPressure: `${bp} mmHg`,
      heartRate: Number(hr),
      temperature: Number(temp),
      weightKg: Number(weight),
      heightCm: Number(height),
      oxygenSaturation: Number(o2),
      triageNotes: notes || 'Sinais vitais aferidos e conferidos na recepção.',
    };

    recordTriageVitals(selectedQueueItem.id, vitalsData);
    handleProcessCheck(selectedQueueItem, 'espera', { customVitals: vitalsData, playVoice: true });
    setTriageModalOpen(false);
  };

  // Appointments ready for check-in today
  const appointmentsNotCheckedIn = appointments.filter(
    (apt) =>
      apt.status === 'agendado' ||
      apt.status === 'confirmado'
  );

  const waitingTriage = queue.filter((q) => q.status === 'esperando_triagem');
  const waitingDoctor = queue.filter((q) => q.status === 'aguardando_medico');
  const inConsultation = queue.filter((q) => q.status === 'em_consulta');
  const finished = queue.filter((q) => q.status === 'finalizado');

  // Active step calculation for the currently called patient on TV
  const currentTvStageIndex = lastCalled ? getStageIndex(lastCalled.status) : -1;

  return (
    <div className="space-y-6">
      {/* Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#17212B] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#185BA6]" />
            Recepção, Fila & Check de Processos
          </h2>
          <p className="text-xs text-[#52606D] mt-0.5">
            Check-in de pacientes, controle sequencial das etapas (Triagem ➔ Em Espera ➔ Consulta ➔ Conclusão) e sincronização automática com o painel de TV por áudio pt-BR.
          </p>
        </div>

        {/* View Switcher: Kanban vs Checklist */}
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-[8px] border border-[#D9DFE5] flex items-center shadow-xs">
            <button
              onClick={() => setActiveViewTab('kanban')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition ${
                activeViewTab === 'kanban'
                  ? 'bg-[#185BA6] text-white shadow-xs'
                  : 'text-[#52606D] hover:text-[#17212B]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Colunas de Atendimento
            </button>
            <button
              onClick={() => setActiveViewTab('checklist')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition ${
                activeViewTab === 'checklist'
                  ? 'bg-[#185BA6] text-white shadow-xs'
                  : 'text-[#52606D] hover:text-[#17212B]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              Tabela Checklist de Processos
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Sync Toast Notification */}
      {syncFeedback && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-[10px] shadow-lg flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">{syncFeedback.message}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TV Calling Panel Simulation */}
      <div className="bg-[#17212B] text-white rounded-[12px] p-6 shadow-xl border border-[#20262E] flex flex-col gap-5 relative overflow-hidden">
        {/* Animated speaking aura banner when audio speaks */}
        {isSpeaking && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-amber-300 to-blue-400 animate-pulse" />
        )}

        {/* TV Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-sm transition-all ${
                isSpeaking ? 'bg-emerald-500 scale-105 animate-pulse' : 'bg-[#185BA6]'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-6 h-6 animate-bounce" /> : <Tv className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" /> Painel de Chamada em TV com Áudio pt-BR
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Sincronização Automática com TV: ATIVA
                </span>
                {isSpeaking && (
                  <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-spin" />
                    Reproduzindo áudio em português...
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Voz {voiceGender === 'feminino' ? 'feminina' : 'masculina'} em Português do Brasil com sinal hospitalar de 3 tons. Cada check de processo sobe e chama na TV em tempo real.
              </p>
            </div>
          </div>

          {/* Action buttons and configuration on TV panel */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto Audio on Check toggle */}
            <button
              onClick={() => setAutoAudioOnCheck(!autoAudioOnCheck)}
              className={`h-[36px] px-3 rounded-[8px] border text-xs font-semibold flex items-center gap-1.5 transition ${
                autoAudioOnCheck
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#1E2630] border-gray-700 text-gray-400'
              }`}
              title="Disparar voz automaticamente a cada check de etapa"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Áudio Automático: {autoAudioOnCheck ? 'Ligado' : 'Mudo'}
            </button>

            {/* Gender voice selector (Feminino / Masculino) */}
            <div className="flex items-center bg-[#11171E] p-1 rounded-[8px] border border-[#2A3441] text-xs">
              <span className="text-[11px] text-gray-400 px-2 font-medium">Voz:</span>
              <button
                type="button"
                onClick={() => setVoiceGender('feminino')}
                className={`px-2.5 py-1 rounded-[6px] font-bold text-xs transition ${
                  voiceGender === 'feminino'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Feminina
              </button>
              <button
                type="button"
                onClick={() => setVoiceGender('masculino')}
                className={`px-2.5 py-1 rounded-[6px] font-bold text-xs transition ${
                  voiceGender === 'masculino'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Masculina
              </button>
            </div>

            {/* Test Call Patient Button */}
            <button
              onClick={() => handleTestAudio('consulta')}
              className="h-[36px] px-3.5 rounded-[8px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Disparar chamada de teste de paciente na TV com voz pt-BR"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              Testar Voz ({voiceGender === 'feminino' ? 'Feminina' : 'Masculina'})
            </button>

            {lastCalled && (
              <button
                onClick={() =>
                  speakAnnouncement(
                    lastCalled.ticketNumber,
                    lastCalled.patientName,
                    lastCalled.roomName,
                    lastCalled.professionalName,
                    lastCalled.status === 'esperando_triagem'
                      ? 'triagem'
                      : lastCalled.status === 'aguardando_medico'
                      ? 'espera'
                      : lastCalled.status === 'em_consulta'
                      ? 'consulta'
                      : 'conclusao'
                  )
                }
                className="h-[36px] px-3.5 rounded-[8px] bg-[#222B35] hover:bg-[#2C3847] border border-[#3A4757] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Repetir a chamada sonora do último paciente"
              >
                <Repeat className="w-3.5 h-3.5 text-amber-400" />
                Repetir Chamada
              </button>
            )}

            <button
              onClick={() => setIsTvFullscreen(true)}
              className="h-[36px] px-3.5 rounded-[8px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Tv className="w-3.5 h-3.5" />
              Modo Telão (Tela Cheia)
            </button>
          </div>
        </div>

        {/* Big TV Screen Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Big Call Screen (8 cols) */}
          <div className="lg:col-span-8 bg-[#11171E] rounded-[10px] p-6 border border-[#232D3B] flex flex-col justify-between relative overflow-hidden min-h-[220px]">
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800/80 pb-2">
              <span className="font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Chamada Atual na TV
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {lastCalled ? (
              <div className="my-3 space-y-3">
                {/* Process Step Progress Bar directly on the TV Screen */}
                <div className="bg-[#18202A] p-2.5 rounded-[8px] border border-gray-800">
                  <div className="flex items-center justify-between gap-1">
                    {PROCESS_STEPS.map((step, idx) => {
                      const isCompleted = currentTvStageIndex > idx;
                      const isCurrent = currentTvStageIndex === idx;

                      return (
                        <div
                          key={step.id}
                          className={`flex-1 flex items-center gap-1.5 py-1 px-2 rounded-[6px] text-[11px] font-bold transition ${
                            isCurrent
                              ? 'bg-amber-400 text-black shadow-md ring-2 ring-amber-300 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-gray-800/40 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-extrabold ${
                              isCurrent
                                ? 'bg-black text-amber-400'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {isCompleted ? '✓' : step.stepNum}
                          </span>
                          <span className="truncate">{step.shortLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-amber-400 tracking-tight tabular-nums">
                    {lastCalled.ticketNumber}
                  </span>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    {lastCalled.patientName}
                  </span>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3 text-sm">
                  <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-[6px] font-bold flex items-center gap-2">
                    <DoorClosed className="w-4 h-4 text-emerald-400" />
                    <span>
                      {lastCalled.status === 'esperando_triagem'
                        ? 'Dirija-se à: Sala de Triagem e Acolhimento'
                        : lastCalled.status === 'aguardando_medico'
                        ? 'Dirija-se à: Sala de Espera'
                        : lastCalled.status === 'finalizado'
                        ? 'Atendimento Concluído'
                        : `Dirija-se ao: ${lastCalled.roomName}`}
                    </span>
                  </div>
                  <div className="text-gray-300 text-xs font-medium">
                    Médico(a): <strong>{lastCalled.professionalName}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-auto py-6 text-center">
                <p className="text-base text-gray-300 font-semibold">
                  Aguardando próxima chamada na recepção ou consultório.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Clique no botão &quot;Check&quot; de qualquer paciente abaixo para sincronizar e emitir a chamada sonora em português.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-800/80">
              <span>Lucy Clinica • São Paulo - SP</span>
              <span>Chamada por Voz Sintetizada pt-BR • Sincronização Automática</span>
            </div>
          </div>

          {/* Recent Call History on TV (4 cols) */}
          <div className="lg:col-span-4 bg-[#11171E] rounded-[10px] p-4 border border-[#232D3B] flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-800 block">
                Últimas Chamadas no Telão
              </span>
              <div className="divide-y divide-gray-800/70 overflow-y-auto max-h-[170px] mt-2 space-y-1.5">
                {callHistory.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400 text-[11px]">
                          {item.ticket}
                        </span>
                        <span className="font-semibold text-gray-200 text-xs truncate max-w-[110px]">
                          {item.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            item.type === 'triagem'
                              ? 'bg-amber-900/60 text-amber-300'
                              : item.type === 'espera'
                              ? 'bg-blue-900/60 text-blue-300'
                              : item.type === 'consulta'
                              ? 'bg-purple-900/60 text-purple-300'
                              : 'bg-emerald-900/60 text-emerald-300'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block truncate max-w-[170px]">
                        {item.room}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Modo sincronizado</span>
              <span className="text-emerald-400 font-semibold">100% Ativo</span>
            </div>
          </div>
        </div>

        {/* Quick action triggers row inside TV panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2A3441] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 font-medium">Chamadas Rápidas:</span>
            {waitingTriage.length > 0 && (
              <button
                onClick={() => handleProcessCheck(waitingTriage[0], 'triagem', { playVoice: true })}
                className="px-2.5 py-1 rounded bg-amber-600/30 border border-amber-500/50 text-amber-300 hover:bg-amber-600/50 transition font-semibold flex items-center gap-1"
              >
                <Bell className="w-3 h-3" />
                Chamar Triagem ({waitingTriage[0].ticketNumber})
              </button>
            )}
            {waitingDoctor.length > 0 && (
              <button
                onClick={() => handleProcessCheck(waitingDoctor[0], 'consulta', { playVoice: true })}
                className="px-2.5 py-1 rounded bg-purple-600/30 border border-purple-500/50 text-purple-300 hover:bg-purple-600/50 transition font-semibold flex items-center gap-1"
              >
                <Bell className="w-3 h-3" />
                Chamar Consulta ({waitingDoctor[0].ticketNumber})
              </button>
            )}
          </div>

          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Monitores de sala de espera e consultórios sincronizados automaticamente.</span>
          </div>
        </div>
      </div>

      {/* Fullscreen TV Mode Modal */}
      {isTvFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0B0F14] text-white p-6 sm:p-12 flex flex-col justify-between animate-in fade-in duration-200">
          {/* TV Topbar */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-gradient-to-br from-[#185BA6] to-[#1E675F] flex items-center justify-center text-white shadow-lg">
                <Heart className="w-8 h-8 fill-white stroke-none" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                  Lucy Clinica — Painel de Atendimento
                </h1>
                <p className="text-sm text-gray-400">São Paulo - SP • Ambulatório Médico</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Voice Gender Switcher on Fullscreen TV */}
              <div className="flex items-center bg-[#131A22] p-1 rounded-[8px] border border-gray-700 text-xs">
                <span className="text-[11px] text-gray-400 px-2 font-medium">Voz:</span>
                <button
                  type="button"
                  onClick={() => setVoiceGender('feminino')}
                  className={`px-3 py-1.5 rounded-[6px] font-bold text-xs transition ${
                    voiceGender === 'feminino'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Feminina
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender('masculino')}
                  className={`px-3 py-1.5 rounded-[6px] font-bold text-xs transition ${
                    voiceGender === 'masculino'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Masculina
                </button>
              </div>

              <button
                onClick={() => handleTestAudio('consulta')}
                className="h-[40px] px-4 rounded-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md"
              >
                <Bell className="w-4 h-4 text-amber-300" />
                Chamada de Paciente (Teste)
              </button>

              <div className="text-right">
                <span className="text-3xl font-extrabold font-mono text-emerald-400 block tabular-nums">
                  {new Date().toLocaleTimeString('pt-BR')}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <button
                onClick={() => setIsTvFullscreen(false)}
                className="h-[44px] px-4 rounded-[10px] bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-gray-700"
              >
                ✕ Sair da Tela Cheia
              </button>
            </div>
          </div>

          {/* Central Mega Call Screen */}
          <div className="my-auto py-8">
            {lastCalled ? (
              <div className="max-w-5xl mx-auto bg-[#131A22] rounded-[16px] p-8 sm:p-12 border-2 border-emerald-500/50 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
                {/* Process Steps Bar in Fullscreen */}
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 p-2 rounded-full bg-gray-900 border border-gray-800">
                  {PROCESS_STEPS.map((step, idx) => {
                    const isCompleted = currentTvStageIndex > idx;
                    const isCurrent = currentTvStageIndex === idx;

                    return (
                      <div
                        key={step.id}
                        className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? 'bg-amber-400 text-black shadow-lg animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'text-gray-500'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                          {isCompleted ? '✓' : step.stepNum}
                        </span>
                        <span>{step.shortLabel}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-6xl sm:text-7xl lg:text-8xl font-extrabold font-mono text-amber-400 tracking-tight tabular-nums">
                  {lastCalled.ticketNumber}
                </div>

                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                  {lastCalled.patientName}
                </div>

                <div className="p-6 bg-emerald-950/90 border border-emerald-400/50 rounded-[12px] max-w-2xl mx-auto space-y-2">
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                    {lastCalled.status === 'esperando_triagem'
                      ? 'Sala de Triagem e Acolhimento'
                      : lastCalled.status === 'aguardando_medico'
                      ? 'Sala de Espera (Aguardando Médico)'
                      : lastCalled.status === 'finalizado'
                      ? 'Atendimento Concluído'
                      : lastCalled.roomName}
                  </p>
                  <p className="text-base text-emerald-100 font-semibold">
                    Profissional: {lastCalled.professionalName}
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
                <Tv className="w-20 h-20 text-gray-600 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-300">
                  Aguardando próxima chamada médica
                </h3>
                <p className="text-gray-500 text-sm">
                  As senhas e chamadas sonoras em português serão emitidas automaticamente neste painel a cada check realizado.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Last Calls Bar on Fullscreen TV */}
          <div className="border-t border-gray-800 pt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">
              Últimos Pacientes Chamados
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {callHistory.slice(0, 4).map((hist, idx) => (
                <div
                  key={idx}
                  className="bg-[#131A22] p-3 rounded-[8px] border border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-amber-400 text-sm block">
                        {hist.ticket}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 uppercase">
                        {hist.type}
                      </span>
                    </div>
                    <span className="font-semibold text-white text-xs truncate block max-w-[150px]">
                      {hist.name}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate block max-w-[150px]">
                      {hist.room}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">{hist.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Check-in Bar for Scheduled Appointments */}
      {appointmentsNotCheckedIn.length > 0 && (
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9DFE5]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#185BA6]" />
              <div>
                <h3 className="font-heading text-sm font-bold text-[#17212B]">
                  Agendamentos de Hoje Aguardando Chegada ({appointmentsNotCheckedIn.length})
                </h3>
                <p className="text-xs text-[#52606D]">
                  Clique em &quot;Check-in na Fila&quot; quando o paciente se apresentar na recepção.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {appointmentsNotCheckedIn.map((apt) => (
              <div
                key={apt.id}
                className="p-3 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#17212B]">{apt.patientName}</span>
                    <span className="font-mono text-[10px] bg-blue-100 text-[#185BA6] px-1.5 py-0.5 rounded font-bold">
                      {apt.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#52606D] mt-0.5">
                    {apt.professionalName} • {apt.roomName}
                  </p>
                </div>

                <button
                  onClick={async () => {
                    const newEntry = await checkInPatientToQueue(apt.id);
                    if (newEntry) {
                      handleProcessCheck(newEntry, 'triagem', { playVoice: true });
                    }
                  }}
                  className="px-3 py-1.5 bg-[#185BA6] hover:bg-[#144b8a] text-white rounded-[6px] font-bold text-[11px] flex items-center gap-1 shrink-0 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Check-in na Fila
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 1: KANBAN COLUMNS WITH INTERACTIVE PROCESS CHECK */}
      {activeViewTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* ==================== COL 1: AGUARDANDO TRIAGEM ==================== */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs flex flex-col">
            <div className="p-3 bg-amber-50 border-b border-amber-200 rounded-t-[10px] flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                1. Triagem ({waitingTriage.length})
              </span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                Etapa 1
              </span>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[620px]">
              {waitingTriage.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-[10px] border-2 border-amber-200 bg-white hover:border-amber-300 space-y-2.5 shadow-xs transition"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-[#185BA6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.ticketNumber}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Chegou: {new Date(item.arrivedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#17212B]">{item.patientName}</h4>
                    <p className="text-[11px] text-[#52606D]">{item.professionalName}</p>
                  </div>

                  {/* 4-Step Interactive Checklist */}
                  <div className="bg-[#F5F9FD] p-2 rounded-[8px] border border-gray-200 space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block">
                      Check de Processo (Clique para marcar):
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {PROCESS_STEPS.map((step, idx) => {
                        const isCurrent = idx === 0;
                        const isDone = false;

                        return (
                          <button
                            key={step.id}
                            onClick={() => handleProcessCheck(item, step.id)}
                            className={`p-1 rounded text-center font-bold text-[9px] flex flex-col items-center justify-center transition border ${
                              isCurrent
                                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                            title={`Marcar check: ${step.title}`}
                          >
                            <span className="text-[10px]">
                              {isDone ? '✓' : isCurrent ? '●' : '○'}
                            </span>
                            <span className="truncate w-full">{step.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Action Button: Fazer Check e Subir para Espera */}
                  <button
                    onClick={() => handleProcessCheck(item, 'espera')}
                    className="w-full h-[36px] rounded-[8px] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    title="Realizar check da triagem e subir automaticamente para Em Espera"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Check: Triagem OK ➔ Subir p/ Espera</span>
                  </button>

                  {/* Secondary buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleProcessCheck(item, 'triagem', { playVoice: true })}
                      className="h-[30px] rounded-[6px] bg-[#1E2630] text-gray-200 hover:text-white text-[11px] font-semibold transition flex items-center justify-center gap-1"
                      title="Chamar paciente na TV com voz pt-BR para a sala de triagem"
                    >
                      <Bell className="w-3 h-3 text-amber-400" /> Chamar TV
                    </button>
                    <button
                      onClick={() => openTriage(item)}
                      className="h-[30px] rounded-[6px] bg-blue-50 hover:bg-blue-100 text-[#185BA6] border border-blue-200 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                      title="Preencher sinais vitais detalhados"
                    >
                      <Activity className="w-3 h-3" /> Sinais Vitais
                    </button>
                  </div>
                </div>
              ))}

              {waitingTriage.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-10 space-y-1">
                  <CheckCircle className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>Nenhum paciente aguardando triagem.</p>
                </div>
              )}
            </div>
          </div>

          {/* ==================== COL 2: EM ESPERA (AGUARDANDO MÉDICO) ==================== */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs flex flex-col">
            <div className="p-3 bg-blue-50 border-b border-blue-200 rounded-t-[10px] flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-[#185BA6] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#185BA6]" />
                2. Em Espera ({waitingDoctor.length})
              </span>
              <span className="text-[10px] font-bold bg-blue-200/80 text-[#185BA6] px-2 py-0.5 rounded-full">
                Etapa 2
              </span>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[620px]">
              {waitingDoctor.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-[10px] border-2 border-blue-200 bg-white hover:border-blue-300 space-y-2.5 shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-[#185BA6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.ticketNumber}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Triagem OK
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#17212B]">{item.patientName}</h4>
                    <p className="text-[11px] text-[#52606D]">
                      {item.professionalName} • {item.roomName}
                    </p>
                  </div>

                  {/* Vitals summary */}
                  {item.vitals && (
                    <div className="text-[10px] text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span>PA: <strong>{item.vitals.bloodPressure}</strong></span>
                        <span>FC: <strong>{item.vitals.heartRate} bpm</strong></span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500">
                        <span>Temp: {item.vitals.temperature}°C</span>
                        <span>Sat O2: {item.vitals.oxygenSaturation}%</span>
                      </div>
                    </div>
                  )}

                  {/* 4-Step Interactive Checklist */}
                  <div className="bg-[#F5F9FD] p-2 rounded-[8px] border border-gray-200 space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block">
                      Check de Processo:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {PROCESS_STEPS.map((step, idx) => {
                        const isDone = idx < 1;
                        const isCurrent = idx === 1;

                        return (
                          <button
                            key={step.id}
                            onClick={() => handleProcessCheck(item, step.id)}
                            className={`p-1 rounded text-center font-bold text-[9px] flex flex-col items-center justify-center transition border ${
                              isCurrent
                                ? 'bg-blue-100 text-blue-900 border-blue-400 shadow-xs'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                            title={`Marcar check: ${step.title}`}
                          >
                            <span className="text-[10px]">
                              {isDone ? '✓' : isCurrent ? '●' : '○'}
                            </span>
                            <span className="truncate w-full">{step.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Action Button: Fazer Check e Subir para Consulta */}
                  <button
                    onClick={() => handleProcessCheck(item, 'consulta')}
                    className="w-full h-[36px] rounded-[8px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    title="Realizar check e chamar o paciente diretamente para o consultório médico na TV"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                    <span>✓ Check: Chamar ➔ Subir p/ Consulta</span>
                  </button>

                  {/* Re-announce button */}
                  <button
                    onClick={() => handleProcessCheck(item, 'espera', { playVoice: true })}
                    className="w-full h-[28px] rounded-[6px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                    title="Reanunciar chamada de sala de espera"
                  >
                    <Volume2 className="w-3 h-3 text-gray-500" />
                    Avisar na TV que está em espera
                  </button>
                </div>
              ))}

              {waitingDoctor.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-10 space-y-1">
                  <CheckCircle className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>Nenhum paciente aguardando médico.</p>
                </div>
              )}
            </div>
          </div>

          {/* ==================== COL 3: EM CONSULTA ==================== */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs flex flex-col">
            <div className="p-3 bg-purple-50 border-b border-purple-200 rounded-t-[10px] flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-purple-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                3. Em Consulta ({inConsultation.length})
              </span>
              <span className="text-[10px] font-bold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                Etapa 3
              </span>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[620px]">
              {inConsultation.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-[10px] border-2 border-purple-300 bg-purple-50/30 hover:border-purple-400 space-y-2.5 shadow-xs transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                      {item.ticketNumber}
                    </span>
                    <span className="text-[10px] font-extrabold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" /> No consultório
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#17212B]">{item.patientName}</h4>
                    <p className="text-[11px] text-[#52606D]">
                      {item.professionalName} • {item.roomName}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Início da consulta: {item.calledAt ? new Date(item.calledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '09:00'}
                    </p>
                  </div>

                  {/* 4-Step Interactive Checklist */}
                  <div className="bg-white p-2 rounded-[8px] border border-gray-200 space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block">
                      Check de Processo:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {PROCESS_STEPS.map((step, idx) => {
                        const isDone = idx < 2;
                        const isCurrent = idx === 2;

                        return (
                          <button
                            key={step.id}
                            onClick={() => handleProcessCheck(item, step.id)}
                            className={`p-1 rounded text-center font-bold text-[9px] flex flex-col items-center justify-center transition border ${
                              isCurrent
                                ? 'bg-purple-100 text-purple-900 border-purple-400 shadow-xs'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                            title={`Marcar check: ${step.title}`}
                          >
                            <span className="text-[10px]">
                              {isDone ? '✓' : isCurrent ? '●' : '○'}
                            </span>
                            <span className="truncate w-full">{step.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Action Button: Fazer Check e Subir para Conclusão */}
                  <button
                    onClick={() => handleProcessCheck(item, 'conclusao')}
                    className="w-full h-[36px] rounded-[8px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    title="Realizar check e concluir o atendimento médico"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span>✓ Check: Concluir ➔ Subir p/ Finalizado</span>
                  </button>

                  {/* Re-announce into office */}
                  <button
                    onClick={() => handleProcessCheck(item, 'consulta', { playVoice: true })}
                    className="w-full h-[28px] rounded-[6px] bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                    title="Repetir chamada no áudio da TV"
                  >
                    <Volume2 className="w-3 h-3 text-purple-600" />
                    Reanunciar chamada no consultório
                  </button>
                </div>
              ))}

              {inConsultation.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-10 space-y-1">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>Nenhuma consulta ativa no momento.</p>
                </div>
              )}
            </div>
          </div>

          {/* ==================== COL 4: CONCLUSÃO (FINALIZADOS) ==================== */}
          <div className="bg-white rounded-[10px] border border-[#D9DFE5] shadow-xs flex flex-col">
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 rounded-t-[10px] flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                4. Concluídos Hoje ({finished.length})
              </span>
              <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                Etapa 4
              </span>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[620px]">
              {finished.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-[8px] border border-gray-200 bg-gray-50/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-600">{item.ticketNumber}</span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> 100% Concluído
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#17212B]">{item.patientName}</h4>
                    <p className="text-[11px] text-[#52606D]">{item.professionalName}</p>
                  </div>

                  {/* 4 Checks Completed Indicator */}
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50/80 p-1.5 rounded border border-emerald-200 text-center">
                    <span className="truncate">✓ Triagem</span>
                    <span className="truncate">✓ Espera</span>
                    <span className="truncate">✓ Consulta</span>
                    <span className="truncate">✓ Concluído</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                    <span>Finalizado às {item.finishedAt ? new Date(item.finishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '09:35'}</span>
                    <button
                      onClick={() => handleProcessCheck(item, 'conclusao', { playVoice: true })}
                      className="text-[#185BA6] hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Volume2 className="w-3 h-3" /> Reanunciar
                    </button>
                  </div>
                </div>
              ))}

              {finished.length === 0 && (
                <div className="text-center text-xs text-gray-400 py-10 space-y-1">
                  <p>Nenhum atendimento concluído hoje.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: STREAMLINED CHECKLIST TABLE (CHECK EM 1 CLIQUE) */}
      {activeViewTab === 'checklist' && (
        <div className="bg-white rounded-[10px] border border-[#D9DFE5] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9DFE5]">
            <div>
              <h3 className="font-heading text-base font-bold text-[#17212B] flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[#185BA6]" />
                Tabela Checklist de Processos Clínicos
              </h3>
              <p className="text-xs text-[#52606D]">
                Marque o check de cada processo (Triagem ➔ Em Espera ➔ Consulta ➔ Conclusão) com 1 clique para subir automaticamente o paciente e sincronizar a TV por voz.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-[8px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Sincronização Ativa na TV
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[#52606D] bg-[#F5F9FD]">
                  <th className="py-3 px-3 font-semibold">Senha</th>
                  <th className="py-3 px-3 font-semibold">Paciente</th>
                  <th className="py-3 px-3 font-semibold">Médico & Sala</th>
                  <th className="py-3 px-3 font-semibold text-center text-amber-800">
                    1. Triagem
                  </th>
                  <th className="py-3 px-3 font-semibold text-center text-blue-800">
                    2. Em Espera
                  </th>
                  <th className="py-3 px-3 font-semibold text-center text-purple-800">
                    3. Em Consulta
                  </th>
                  <th className="py-3 px-3 font-semibold text-center text-emerald-800">
                    4. Conclusão
                  </th>
                  <th className="py-3 px-3 font-semibold text-right">Ação Rápida na TV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queue.map((item) => {
                  const stageIdx = getStageIndex(item.status);

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#185BA6]">
                        {item.ticketNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#17212B] block">{item.patientName}</span>
                        <span className="text-[10px] text-gray-500">
                          Chegada: {new Date(item.arrivedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#52606D]">
                        <span className="font-medium text-[#17212B] block">{item.professionalName}</span>
                        <span className="text-[10px]">{item.roomName}</span>
                      </td>

                      {/* Check 1: Triagem */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleProcessCheck(item, 'triagem')}
                          className={`w-8 h-8 rounded-[8px] inline-flex items-center justify-center font-bold transition shadow-xs ${
                            stageIdx >= 0
                              ? 'bg-amber-100 text-amber-800 border-2 border-amber-400 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 hover:border-gray-400'
                          }`}
                          title="Fazer Check: Triagem & Acolhimento"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Check 2: Em Espera */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleProcessCheck(item, 'espera')}
                          className={`w-8 h-8 rounded-[8px] inline-flex items-center justify-center font-bold transition shadow-xs ${
                            stageIdx >= 1
                              ? 'bg-blue-100 text-[#185BA6] border-2 border-blue-400 hover:bg-blue-200'
                              : 'bg-gray-50 text-gray-300 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          title="Fazer Check: Em Espera (Aguardando Médico)"
                        >
                          {stageIdx >= 1 ? <Check className="w-4 h-4" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Check 3: Em Consulta */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleProcessCheck(item, 'consulta')}
                          className={`w-8 h-8 rounded-[8px] inline-flex items-center justify-center font-bold transition shadow-xs ${
                            stageIdx >= 2
                              ? 'bg-purple-100 text-purple-800 border-2 border-purple-400 hover:bg-purple-200'
                              : 'bg-gray-50 text-gray-300 border border-gray-200 hover:bg-purple-50 hover:text-purple-600'
                          }`}
                          title="Fazer Check: Em Consulta no Consultório"
                        >
                          {stageIdx >= 2 ? <Check className="w-4 h-4" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Check 4: Conclusão */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleProcessCheck(item, 'conclusao')}
                          className={`w-8 h-8 rounded-[8px] inline-flex items-center justify-center font-bold transition shadow-xs ${
                            stageIdx >= 3
                              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 hover:bg-emerald-200'
                              : 'bg-gray-50 text-gray-300 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                          title="Fazer Check: Conclusão do Atendimento"
                        >
                          {stageIdx >= 3 ? <Check className="w-4 h-4" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Ação / Chamar na TV */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            handleProcessCheck(
                              item,
                              stageIdx === 0
                                ? 'espera'
                                : stageIdx === 1
                                ? 'consulta'
                                : stageIdx === 2
                                ? 'conclusao'
                                : 'conclusao',
                              { playVoice: true }
                            )
                          }
                          className="px-3 py-1.5 rounded-[6px] bg-[#185BA6] hover:bg-[#144b8a] text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                          title="Avançar para o próximo check e chamar no áudio da TV"
                        >
                          <Bell className="w-3 h-3 text-amber-300" />
                          <span>
                            {stageIdx === 0
                              ? 'Avançar p/ Espera'
                              : stageIdx === 1
                              ? 'Chamar Consulta'
                              : stageIdx === 2
                              ? 'Concluir Atendimento'
                              : 'Reanunciar TV'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Triage Modal for In-depth Vital Signs */}
      {triageModalOpen && selectedQueueItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[10px] shadow-2xl border border-[#D9DFE5] w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DFE5]">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#17212B] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#185BA6]" />
                  Aferição de Sinais Vitais — {selectedQueueItem.patientName}
                </h3>
                <p className="text-xs text-[#52606D]">
                  Senha: {selectedQueueItem.ticketNumber} • Médico: {selectedQueueItem.professionalName}
                </p>
              </div>
              <button
                onClick={() => setTriageModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveTriage} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Pressão Arterial (mmHg)
                  </label>
                  <input
                    type="text"
                    required
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold text-[#17212B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1">
                    Freq. Cardíaca (bpm)
                  </label>
                  <input
                    type="number"
                    required
                    value={hr}
                    onChange={(e) => setHr(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold text-[#17212B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                    Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                    Sat O2 (%)
                  </label>
                  <input
                    type="number"
                    value={o2}
                    onChange={(e) => setO2(Number(e.target.value))}
                    className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1">
                  Queixa Principal / Observações da Triagem
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Relato de sintomas e histórico recente..."
                  className="w-full p-2 bg-[#F5F9FD] border border-[#D9DFE5] rounded-[8px] text-xs text-[#17212B]"
                />
              </div>

              <div className="pt-3 border-t border-[#D9DFE5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTriageModalOpen(false)}
                  className="h-[36px] px-3.5 rounded-[8px] border border-[#D9DFE5] text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[36px] px-5 rounded-[8px] bg-[#185BA6] hover:bg-[#144b8a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Salvar, Concluir Triagem & Chamar na TV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
