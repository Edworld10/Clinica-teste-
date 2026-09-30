import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ClinicOrganization,
  Professional,
  Room,
  Patient,
  Appointment,
  QueueEntry,
  MedicalRecord,
  PrivateDocument,
  FinancialTransaction,
  InventoryItem,
  AuditLog,
  BudgetEstimate,
  AppointmentStatus,
  RectificationEntry,
} from '../types';
import {
  INITIAL_ORGANIZATION,
  INITIAL_ROOMS,
  INITIAL_PROFESSIONALS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_PRIVATE_DOCUMENTS,
  INITIAL_INVENTORY,
  INITIAL_FINANCIAL,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

interface ClinicContextType {
  organization: ClinicOrganization;
  updateOrganization: (org: Partial<ClinicOrganization>) => void;
  rooms: Room[];
  professionals: Professional[];
  patients: Patient[];
  appointments: Appointment[];
  queue: QueueEntry[];
  medicalRecords: MedicalRecord[];
  documents: PrivateDocument[];
  inventory: InventoryItem[];
  financial: FinancialTransaction[];
  auditLogs: AuditLog[];
  // Conflict checker
  checkScheduleConflict: (
    date: string,
    time: string,
    professionalId: string,
    roomId: string,
    ignoreAppointmentId?: string
  ) => { hasConflict: boolean; reason?: string };
  // Operations
  bookAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  checkInPatientToQueue: (appointmentId: string) => Promise<QueueEntry>;
  recordTriageVitals: (queueId: string, vitals: NonNullable<QueueEntry['vitals']>) => void;
  advanceQueueProcess: (queueId: string, targetStatus?: QueueEntry['status'], vitals?: NonNullable<QueueEntry['vitals']>) => void;
  callPatientToRoom: (queueId: string) => void;
  finishConsultation: (
    queueId: string,
    recordData: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
      examRequests: string[];
      prescriptions: MedicalRecord['prescriptions'];
    }
  ) => Promise<MedicalRecord>;
  rectifyMedicalRecord: (
    recordId: string,
    reason: string,
    updatedData: Partial<Pick<MedicalRecord, 'subjective' | 'objective' | 'assessment' | 'plan'>>
  ) => void;
  uploadPrivateDocument: (docData: Omit<PrivateDocument, 'id' | 'createdAt' | 'accessLogs'>) => void;
  logDocumentAccess: (documentId: string, action: 'visualizado' | 'baixado') => void;
  createPatient: (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => void;
  updateInventoryQuantity: (itemId: string, delta: number) => void;
  addAuditLog: (action: AuditLog['action'], resource: AuditLog['resource'], resourceId: string | undefined, details: string) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [organization, setOrganization] = useState<ClinicOrganization>(() => {
    const saved = localStorage.getItem('lucia_clinic_org');
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATION;
  });

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('lucia_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('lucia_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });
  const [queue, setQueue] = useState<QueueEntry[]>(() => {
    const saved = localStorage.getItem('lucia_queue');
    return saved ? JSON.parse(saved) : INITIAL_QUEUE;
  });
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('lucia_records');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_RECORDS;
  });
  const [documents, setDocuments] = useState<PrivateDocument[]>(() => {
    const saved = localStorage.getItem('lucia_documents');
    return saved ? JSON.parse(saved) : INITIAL_PRIVATE_DOCUMENTS;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('lucia_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [financial, setFinancial] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('lucia_financial');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('lucia_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Save to localStorage for seamless persistence
  useEffect(() => {
    localStorage.setItem('lucia_clinic_org', JSON.stringify(organization));
  }, [organization]);

  useEffect(() => {
    localStorage.setItem('lucia_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('lucia_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('lucia_queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem('lucia_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('lucia_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('lucia_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('lucia_financial', JSON.stringify(financial));
  }, [financial]);

  useEffect(() => {
    localStorage.setItem('lucia_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Centralized audit logger
  const addAuditLog = useCallback(
    (action: AuditLog['action'], resource: AuditLog['resource'], resourceId: string | undefined, details: string) => {
      const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        organizationId: organization.id,
        userId: currentUser.id,
        userRole: currentUser.role,
        userName: currentUser.displayName,
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      // Attempt async Firestore write in background
      try {
        const path = `organizations/${organization.id}/audit_logs/${newLog.id}`;
        setDoc(doc(db, 'organizations', organization.id, 'audit_logs', newLog.id), newLog).catch(() => {
          // Silent local fallback
        });
      } catch (err) {
        // Ignored
      }
    },
    [currentUser, organization.id]
  );

  // Check schedule conflict
  const checkScheduleConflict = useCallback(
    (date: string, time: string, professionalId: string, roomId: string, ignoreAppointmentId?: string) => {
      // Find any active appointment at same date & time
      const activeApts = appointments.filter(
        (a) => a.date === date && a.time === time && a.status !== 'cancelado' && a.id !== ignoreAppointmentId
      );

      // Check professional conflict
      const profConflict = activeApts.find((a) => a.professionalId === professionalId);
      if (profConflict) {
        return {
          hasConflict: true,
          reason: `O profissional ${profConflict.professionalName} já possui atendimento marcado neste horário (${time}) para ${profConflict.patientName}.`,
        };
      }

      // Check room conflict
      const roomConflict = activeApts.find((a) => a.roomId === roomId);
      if (roomConflict) {
        return {
          hasConflict: true,
          reason: `A sala ${roomConflict.roomName} já está ocupada neste horário (${time}) pelo Dr(a). ${roomConflict.professionalName}.`,
        };
      }

      return { hasConflict: false };
    },
    [appointments]
  );

  // Book Appointment
  const bookAppointment = async (aptData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    // Conflict verification
    const conflict = checkScheduleConflict(aptData.date, aptData.time, aptData.professionalId, aptData.roomId);
    if (conflict.hasConflict) {
      throw new Error(conflict.reason || 'Conflito de agenda detectado.');
    }

    const newId = `apt-${Date.now()}`;
    const newApt: Appointment = {
      ...aptData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newApt, ...prev]);
    addAuditLog(
      'CREATE',
      'appointment',
      newId,
      `Agendamento de consulta para ${newApt.patientName} com ${newApt.professionalName} em ${newApt.date} às ${newApt.time}.`
    );

    // If paid, create financial transaction
    if (newApt.paymentStatus === 'pago' && newApt.price > 0) {
      const prof = professionals.find((p) => p.id === newApt.professionalId);
      const cut = prof ? (newApt.price * prof.commissionPercentage) / 100 : newApt.price * 0.7;
      const tx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        organizationId: organization.id,
        appointmentId: newId,
        patientId: newApt.patientId,
        patientName: newApt.patientName,
        description: `Consulta ${newApt.specialty} - ${newApt.professionalName}`,
        amount: newApt.price,
        type: 'receita',
        category: 'consulta',
        paymentMethod: newApt.paymentMethod || 'pix',
        status: 'pago',
        dueDate: newApt.date,
        paidAt: new Date().toISOString(),
        professionalCutAmount: cut,
        createdAt: new Date().toISOString(),
      };
      setFinancial((prev) => [tx, ...prev]);
    }

    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
    addAuditLog('UPDATE', 'appointment', id, `Status da consulta alterado para: ${status}`);
  };

  // Check-in patient to reception queue
  const checkInPatientToQueue = async (appointmentId: string): Promise<QueueEntry> => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) throw new Error('Consulta não encontrada.');

    // Count tickets today to generate sequencial code
    const ticketSeq = queue.length + 40;
    const ticketNumber = `CL-${ticketSeq.toString().padStart(3, '0')}`;

    const newQueueEntry: QueueEntry = {
      id: `q-${Date.now()}`,
      organizationId: organization.id,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      professionalId: apt.professionalId,
      professionalName: apt.professionalName,
      roomId: apt.roomId,
      roomName: apt.roomName,
      ticketNumber,
      status: 'esperando_triagem',
      arrivedAt: new Date().toISOString(),
    };

    setQueue((prev) => [newQueueEntry, ...prev]);
    updateAppointmentStatus(appointmentId, 'em_espera');
    addAuditLog(
      'TRIAGE',
      'queue',
      newQueueEntry.id,
      `Check-in de recepção realizado para ${apt.patientName}. Senha gerada: ${ticketNumber}.`
    );

    return newQueueEntry;
  };

  // Record vitals in triage
  const recordTriageVitals = (queueId: string, vitals: NonNullable<QueueEntry['vitals']>) => {
    setQueue((prev) =>
      prev.map((q) => {
        if (q.id === queueId) {
          return {
            ...q,
            status: 'aguardando_medico',
            triageDoneAt: new Date().toISOString(),
            vitals,
          };
        }
        return q;
      })
    );
    addAuditLog(
      'TRIAGE',
      'queue',
      queueId,
      `Triagem de sinais vitais realizada: PA ${vitals.bloodPressure || 'N/A'}, FC ${vitals.heartRate || 'N/A'} bpm.`
    );
  };

  // Progress queue entry to next workflow state with automatic appointment sync
  const advanceQueueProcess = (
    queueId: string,
    targetStatus?: QueueEntry['status'],
    vitals?: NonNullable<QueueEntry['vitals']>
  ) => {
    let updatedEntry: QueueEntry | undefined;

    setQueue((prev) =>
      prev.map((q) => {
        if (q.id === queueId) {
          let nextStatus: QueueEntry['status'] = q.status;
          const now = new Date().toISOString();

          if (targetStatus) {
            nextStatus = targetStatus;
          } else {
            // Sequential progression: esperando_triagem -> aguardando_medico -> em_consulta -> finalizado
            if (q.status === 'esperando_triagem') nextStatus = 'aguardando_medico';
            else if (q.status === 'aguardando_medico') nextStatus = 'em_consulta';
            else if (q.status === 'em_consulta') nextStatus = 'finalizado';
          }

          const entry: QueueEntry = {
            ...q,
            status: nextStatus,
            triageDoneAt: nextStatus !== 'esperando_triagem' ? q.triageDoneAt || now : undefined,
            calledAt: nextStatus === 'em_consulta' || nextStatus === 'finalizado' ? q.calledAt || now : undefined,
            finishedAt: nextStatus === 'finalizado' ? now : undefined,
            vitals: vitals || q.vitals,
          };

          updatedEntry = entry;
          return entry;
        }
        return q;
      })
    );

    if (updatedEntry) {
      const aptId = (updatedEntry as QueueEntry).appointmentId;
      if (aptId) {
        let aptStatus: AppointmentStatus = 'em_espera';
        if ((updatedEntry as QueueEntry).status === 'esperando_triagem') aptStatus = 'em_triagem';
        else if ((updatedEntry as QueueEntry).status === 'aguardando_medico') aptStatus = 'em_espera';
        else if ((updatedEntry as QueueEntry).status === 'em_consulta') aptStatus = 'em_atendimento';
        else if ((updatedEntry as QueueEntry).status === 'finalizado') aptStatus = 'concluido';

        updateAppointmentStatus(aptId, aptStatus);
      }

      addAuditLog(
        'UPDATE',
        'queue',
        queueId,
        `Etapa de atendimento avançada para: ${(updatedEntry as QueueEntry).status}. Sincronizado com a recepção e TV.`
      );
    }
  };

  // Call patient to doctor's office
  const callPatientToRoom = (queueId: string) => {
    const target = queue.find((q) => q.id === queueId);
    if (!target) return;

    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'em_consulta', calledAt: new Date().toISOString() } : q))
    );
    if (target.appointmentId) {
      updateAppointmentStatus(target.appointmentId, 'em_atendimento');
    }
    addAuditLog(
      'CALL_QUEUE',
      'queue',
      queueId,
      `Chamada no painel da recepção: Paciente ${target.patientName} chamado para ${target.roomName} com ${target.professionalName}.`
    );
  };

  // Finish consultation & create medical record
  const finishConsultation = async (
    queueId: string,
    recordData: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
      examRequests: string[];
      prescriptions: MedicalRecord['prescriptions'];
    }
  ): Promise<MedicalRecord> => {
    const targetQueue = queue.find((q) => q.id === queueId);
    if (!targetQueue) throw new Error('Atendimento não localizado na fila.');

    const prof = professionals.find((p) => p.id === targetQueue.professionalId);
    const newRecordId = `rec-${Date.now()}`;

    const newRecord: MedicalRecord = {
      id: newRecordId,
      organizationId: organization.id,
      patientId: targetQueue.patientId,
      patientName: targetQueue.patientName,
      professionalId: targetQueue.professionalId,
      professionalName: targetQueue.professionalName,
      professionalCrm: prof ? `CRM/${prof.crmUf} ${prof.crm}` : 'CRM/SP Habilitado',
      appointmentId: targetQueue.appointmentId,
      date: new Date().toISOString(),
      subjective: recordData.subjective,
      objective: recordData.objective,
      assessment: recordData.assessment,
      plan: recordData.plan,
      examRequests: recordData.examRequests,
      prescriptions: recordData.prescriptions,
      rectified: false,
      rectifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMedicalRecords((prev) => [newRecord, ...prev]);

    // Update queue & appointment
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, status: 'finalizado', finishedAt: new Date().toISOString() } : q))
    );
    if (targetQueue.appointmentId) {
      updateAppointmentStatus(targetQueue.appointmentId, 'concluido');
    }

    addAuditLog(
      'CREATE',
      'medical_record',
      newRecordId,
      `Prontuário médico finalizado e assinado digitalmente por ${newRecord.professionalName} (${newRecord.professionalCrm}) para ${newRecord.patientName}.`
    );

    return newRecord;
  };

  // Rectify medical record (preserving history and legal compliance)
  const rectifyMedicalRecord = (
    recordId: string,
    reason: string,
    updatedData: Partial<Pick<MedicalRecord, 'subjective' | 'objective' | 'assessment' | 'plan'>>
  ) => {
    const target = medicalRecords.find((r) => r.id === recordId);
    if (!target) return;

    const previousSnapshot = `[SOEP Anterior]
S: ${target.subjective}
O: ${target.objective}
A: ${target.assessment}
P: ${target.plan}`;

    const rectification: RectificationEntry = {
      rectifiedAt: new Date().toISOString(),
      rectifiedByCrm: currentUser.crm || 'CRM/SP Registrado',
      rectifiedByName: currentUser.displayName,
      reason,
      previousContent: previousSnapshot,
    };

    setMedicalRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return {
            ...rec,
            ...updatedData,
            rectified: true,
            rectifications: [rectification, ...rec.rectifications],
            updatedAt: new Date().toISOString(),
          };
        }
        return rec;
      })
    );

    addAuditLog(
      'RECTIFY_RECORD',
      'medical_record',
      recordId,
      `Retificação efetuada por ${currentUser.displayName}. Motivo: ${reason}`
    );
  };

  // Upload private document
  const uploadPrivateDocument = (docData: Omit<PrivateDocument, 'id' | 'createdAt' | 'accessLogs'>) => {
    const newDoc: PrivateDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      accessLogs: [],
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addAuditLog('CREATE', 'document', newDoc.id, `Envio de documento confidencial (${newDoc.category}): "${newDoc.title}".`);
  };

  // Log private document reading
  const logDocumentAccess = (documentId: string, action: 'visualizado' | 'baixado') => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === documentId) {
          return {
            ...d,
            accessLogs: [
              {
                accessedBy: currentUser.displayName,
                accessedRole: currentUser.role,
                timestamp: new Date().toISOString(),
                action,
              },
              ...d.accessLogs,
            ],
          };
        }
        return d;
      })
    );
    addAuditLog('READ', 'document', documentId, `Acesso ao documento restrito (${action}) por ${currentUser.displayName}.`);
  };

  // Create Patient
  const createPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPatients((prev) => [newPatient, ...prev]);
    addAuditLog('CREATE', 'patient', newPatient.id, `Cadastro do paciente ${newPatient.name} (CPF: ${newPatient.cpf}).`);
    return newPatient;
  };

  // Add Financial Transaction
  const addFinancialTransaction = (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFinancial((prev) => [newTx, ...prev]);
    addAuditLog(
      'CREATE',
      'financial',
      newTx.id,
      `Lançamento financeiro: ${newTx.type.toUpperCase()} R$ ${newTx.amount.toFixed(2)} - ${newTx.description}.`
    );
  };

  // Update Inventory
  const updateInventoryQuantity = (itemId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQ = Math.max(0, item.currentQuantity + delta);
          return { ...item, currentQuantity: newQ };
        }
        return item;
      })
    );
    addAuditLog('UPDATE', 'inventory', itemId, `Ajuste de estoque: delta ${delta > 0 ? '+' : ''}${delta}.`);
  };

  // Update organization
  const updateOrganization = (org: Partial<ClinicOrganization>) => {
    setOrganization((prev) => ({ ...prev, ...org, updatedAt: new Date().toISOString() }));
    addAuditLog('UPDATE', 'user', organization.id, 'Configurações da clínica Lucy Clinica atualizadas.');
  };

  return (
    <ClinicContext.Provider
      value={{
        organization,
        updateOrganization,
        rooms,
        professionals,
        patients,
        appointments,
        queue,
        medicalRecords,
        documents,
        inventory,
        financial,
        auditLogs,
        checkScheduleConflict,
        bookAppointment,
        updateAppointmentStatus,
        checkInPatientToQueue,
        recordTriageVitals,
        advanceQueueProcess,
        callPatientToRoom,
        finishConsultation,
        rectifyMedicalRecord,
        uploadPrivateDocument,
        logDocumentAccess,
        createPatient,
        addFinancialTransaction,
        updateInventoryQuantity,
        addAuditLog,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
