/**
 * SAMUEL - Regulatory, Legal & Privacy Configuration
 * 
 * Versioned, centralized policy declarations and legal disclaimers.
 * Modifying policies here does not require altering SAMUEL CORE.
 */

export interface RegulatoryConfig {
  policyVersion: string;
  lastUpdated: string;
  minimumAge: number;
  allowMinorWithConsent: boolean;
  productClassification: {
    category: 'AI Conversational Tool';
    isMedicalDevice: false;
    isTherapeuticService: false;
    isDiagnosticTool: false;
  };
  disclaimers: {
    primary: string;
    nonMedical: string;
    confidentiality: string;
    noMemory: string;
  };
  legalReferences: {
    dataProtection: string;
    healthRegulationNote: string;
    regulatoryNotice: string;
  };
  privacyStatement: {
    badgeText: string;
    simpleExplanation: string;
    technicalExplanation: string;
    installationNotice: string;
    offlineCapability: string;
  };
}

export const REGULATORY_CONFIG: RegulatoryConfig = {
  policyVersion: '1.0.0-2026',
  lastUpdated: '2026-08-19',
  minimumAge: 18,
  allowMinorWithConsent: true,
  productClassification: {
    category: 'AI Conversational Tool',
    isMedicalDevice: false,
    isTherapeuticService: false,
    isDiagnosticTool: false,
  },
  disclaimers: {
    primary:
      'SAMUEL es un espacio conversacional para pensar, ordenar ideas y explorar situaciones personales. No sustituye la atención profesional.',
    nonMedical:
      'SAMUEL NO es un psicólogo, médico, psiquiatra ni terapeuta. No realiza diagnósticos, no prescribe tratamientos ni sustituye el asesoramiento clínico o de salud mental.',
    confidentiality:
      'En modo CONFIDENCIAL, el procesamiento del lenguaje se realiza de forma íntegra en el procesador gráfico (WebGPU) de tu dispositivo. El contenido de tus mensajes nunca se transmite a nuestros servidores ni a APIs de terceros.',
    noMemory:
      'Por defecto, SAMUEL no almacena el historial de tus conversaciones de manera persistente ni genera perfiles psicológicos. Al reiniciar la sesión o cerrar la pestaña, la conversación se descarta de la memoria volátil.',
  },
  legalReferences: {
    dataProtection:
      'Cumplimiento de principios de Minimización de Datos y Privacidad por Diseño (conforme Ley 25.326 de la República Argentina y estándares internacionales análogos): El responsable del servicio no recolecta ni almacena datos sensibles conversacionales.',
    healthRegulationNote:
      'En el marco de la Ley 26.657 de Salud Mental y normativas comparadas, este software se define estrictamente como herramienta de reflexión y soporte expresivo personal sin alcance sanitario.',
    regulatoryNotice:
      'Este producto está sujeto a actualizaciones técnicas y normativas transparentes orientadas a garantizar la protección del usuario y la integridad local de la inferencia.',
  },
  privacyStatement: {
    badgeText: 'CONFIDENCIAL · Sin transmisión de conversación',
    simpleExplanation:
      'Lo que escribís y las respuestas de Samuel se procesan directamente en este dispositivo. El contenido de tu charla nunca llega a nuestros servidores.',
    technicalExplanation:
      'Samuel ejecuta un modelo de lenguaje local cuantizado mediante WebGPU y WebLLM en un Web Worker dedicado. Durante una sesión CONFIDENCIAL, 0 bytes de texto conversacional, embeddings, contexto o inferencias son enviados por red.',
    installationNotice:
      'La primera vez que uses Samuel en un dispositivo nuevo, se descargará el modelo de IA local necesario. Una vez completada la descarga y almacenada en la caché local del navegador, podrás conversar incluso sin conexión a Internet.',
    offlineCapability:
      'Una vez instalado el modelo en tu navegador, el modo CONFIDENCIAL funciona sin conexión a Internet.',
  },
};
