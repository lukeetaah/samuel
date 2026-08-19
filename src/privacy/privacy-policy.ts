/**
 * SAMUEL - Privacy Policy & Technical Disclosures
 * 
 * Formal statement of technical privacy guarantees and architecture.
 */

import { REGULATORY_CONFIG } from '../config/regulatory';

export interface PrivacySection {
  title: string;
  simpleText: string;
  technicalDetails: string;
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: '1. Inferencia 100% en tu Dispositivo',
    simpleText: 'Cada palabra que escribís y cada respuesta generada se procesa en el chip gráfico de tu propia máquina. El texto no viaja a nuestros servidores.',
    technicalDetails: 'El motor de inferencia corre localmente mediante WebGPU compilado a través de WebLLM / Apache TVM. El pipeline de generación de texto opera enteramente en memoria aislada del navegador.',
  },
  {
    title: '2. Descarga Inicial vs. Uso Confidencial',
    simpleText: 'La primera vez se descargan los archivos necesarios del modelo. Después de eso, no se transmiten datos de tus conversaciones.',
    technicalDetails: 'El tráfico de red se limita a la descarga estática de pesos cuantizados (formato q4f16_1) desde CDN. Una vez cacheados en Cache API / IndexedDB, no se produce ninguna petición saliente asociada a los prompts o respuestas.',
  },
  {
    title: '3. Sin Cuentas ni Perfiles',
    simpleText: 'No te pedimos crear usuario, email ni contraseña. Samuel no asocia lo que decís a ninguna identidad.',
    technicalDetails: 'Arquitectura sin base de datos de usuarios, sin JWT/cookies de rastreo, sin telemetría ni identificadores cruzados. Cumplimiento estricto del principio de minimización de datos.',
  },
  {
    title: '4. Memoria de Sesión Volátil',
    simpleText: 'Samuel no guarda tu conversación permanentemente. Cuando cerrás la pestaña o pulsás "Nueva conversación", todo se borra.',
    technicalDetails: 'El estado conversacional (ConversationState) se almacena únicamente en variables de memoria en tiempo de ejecución (RAM del hilo del navegador) y se descarta explícitamente sin persistencia en localStorage ni IndexedDB.',
  },
  {
    title: '5. Límites y Seguridad',
    simpleText: 'Samuel es una herramienta para ayudarte a pensar y ordenar ideas, no es un profesional de la salud ni diagnostica.',
    technicalDetails: 'SAMUEL CORE implementa filtros heurísticos locales conservadores para detectar situaciones de riesgo vital y ofrecer recursos de ayuda directa según tu país, sin enviar telemetría a terceros.',
  },
];

export const PRIVACY_META = {
  version: REGULATORY_CONFIG.policyVersion,
  lastUpdated: REGULATORY_CONFIG.lastUpdated,
  guaranteeSummary: REGULATORY_CONFIG.privacyStatement.badgeText,
};
