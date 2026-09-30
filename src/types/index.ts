export type UserRole = 'master' | 'admin' | 'medico' | 'recepcao' | 'financeiro' | 'paciente';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: string;
  crm?: string;
  specialty?: string;
  phone?: string;
  cpf?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClinicOrganization {
  id: string;
  name: string;
  legalName: string;
  cnpj: string;
  city: string;
  state: string;
  address: string;
  whatsapp: string;
  phone: string;
  email: string;
  openingHoursStart: string; // "07:00"
  openingHoursEnd: string; // "17:00"
  timeSlotDurationMinutes: number; // 30
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  organizationId: string;
  name: string;
  crm: string;
  crmUf: string;
  specialty: string;
  phone: string;
  email: string;
  defaultRoomId: string;
  consultationFee: number;
  returnFee: number;
  commissionPercentage: number; // e.g. 70%
  daysOfWeek: number[]; // 1: Seg, 2: Ter, 3: Qua, 4: Qui, 5: Sex, 6: Sáb
  workHoursStart: string;
  workHoursEnd: string;
  color: string;
  avatarUrl?: string;
  active: boolean;
}

export interface Room {
  id: string;
  organizationId: string;
  name: string;
  type: 'consultorio' | 'procedimento' | 'triagem' | 'coleta' | 'exames';
  floor: string;
  active: boolean;
}

export interface Patient {
  id: string;
  organizationId: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Outro';
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider: string; // "Particular" | "Unimed" | "Bradesco Saúde" | "SulAmérica" | "Amil"
  insuranceCardNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 
  | 'agendado' 
  | 'confirmado' 
  | 'em_espera' 
  | 'em_triagem'
  | 'em_atendimento' 
  | 'concluido' 
  | 'cancelado' 
  | 'falta';

export type AppointmentType = 'primeira_consulta' | 'retorno' | 'exame' | 'procedimento' | 'teleconsulta';

export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientCpf: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  paymentStatus: 'pendente' | 'pago' | 'cortesia';
  paymentMethod?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'convenio';
  isTelemedicine: boolean;
  telemedicineLink?: string;
  returnDeadlineDate?: string; // Data limite para retorno sem custo (30 dias)
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  id: string;
  organizationId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  roomId: string;
  roomName: string;
  ticketNumber: string; // Ex: CL-042
  status: 'esperando_triagem' | 'aguardando_medico' | 'em_consulta' | 'finalizado';
  arrivedAt: string; // ISO
  triageDoneAt?: string;
  calledAt?: string;
  finishedAt?: string;
  vitals?: {
    bloodPressure?: string; // ex: "120/80 mmHg"
    heartRate?: number; // bpm
    temperature?: number; // °C
    weightKg?: number;
    heightCm?: number;
    oxygenSaturation?: number; // %
    triageNotes?: string;
  };
}

export interface RectificationEntry {
  rectifiedAt: string;
  rectifiedByCrm: string;
  rectifiedByName: string;
  reason: string;
  previousContent: string;
}

export interface MedicalRecord {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  professionalCrm: string;
  appointmentId: string;
  date: string; // ISO
  // SOEP / SOAP
  subjective: string; // Queixa principal, HDA, sintomas relatados
  objective: string; // Exame físico, sinais vitais constatados
  assessment: string; // Avaliação clínica, hipótese diagnóstica (CID / descrição livre)
  plan: string; // Conduta terapêutica, orientações ao paciente
  examRequests: string[]; // Exames solicitados
  prescriptions: {
    medication: string;
    dosage: string;
    route: string; // via oral, tópica, etc.
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  rectified: boolean;
  rectifications: RectificationEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PrivateDocument {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: string;
  title: string;
  category: 'exame' | 'receita' | 'atestado' | 'laudo' | 'encaminhamento' | 'outro';
  fileUrl: string;
  fileName: string;
  fileSize: string;
  isConfidential: boolean;
  accessLogs: {
    accessedBy: string;
    accessedRole: string;
    timestamp: string;
    action: 'visualizado' | 'baixado';
  }[];
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  organizationId: string;
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: 'consulta' | 'procedimento' | 'repasse_medico' | 'insumos' | 'aluguel' | 'folha' | 'software' | 'outros';
  paymentMethod: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'convenio';
  status: 'pago' | 'pendente' | 'cancelado';
  dueDate: string;
  paidAt?: string;
  professionalCutAmount?: number;
  invoiceUrl?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  category: 'medicamento' | 'material_descartavel' | 'epi' | 'reagente' | 'instrumental';
  unit: 'un' | 'cx' | 'ampola' | 'frasco' | 'par' | 'pacote';
  currentQuantity: number;
  minQuantity: number;
  batchNumber: string;
  expirationDate: string;
  unitCost: number;
  supplier: string;
  lastRestockedAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userRole: UserRole;
  userName: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'TRIAGE' | 'CALL_QUEUE' | 'RECTIFY_RECORD' | 'EXPORT_DATA';
  resource: 'medical_record' | 'appointment' | 'queue' | 'patient' | 'financial' | 'inventory' | 'document' | 'user';
  resourceId?: string;
  details: string;
  timestamp: string;
}

export interface BudgetEstimate {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  professionalName: string;
  date: string;
  validUntil: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }[];
  totalAmount: number;
  paymentOptions: string;
  status: 'rascunho' | 'aprovado' | 'faturado' | 'cancelado';
  createdAt: string;
}
