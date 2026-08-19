/**
 * SAMUEL - Safety Resources & Crisis Support
 * 
 * Provides verified support resources and non-diagnostic safety guidelines.
 */

import { JURISDICTIONS, JurisdictionInfo, DEFAULT_JURISDICTION_CODE } from './jurisdictions';

export interface EmergencyContact {
  title: string;
  phone: string;
  description: string;
  hours: string;
  url?: string;
}

export function getSafetyResourcesForJurisdiction(code: string = DEFAULT_JURISDICTION_CODE): EmergencyContact[] {
  const jur = JURISDICTIONS[code] || JURISDICTIONS[DEFAULT_JURISDICTION_CODE];

  if (jur.code === 'AR') {
    return [
      {
        title: 'Centro de Asistencia al Suicida (CAS)',
        phone: '135 o (011) 5275-1135',
        description: 'Atención gratuita, anónima y confidencial para personas en crisis o familiares.',
        hours: '24 horas / 365 días',
        url: 'https://www.cas.org.ar',
      },
      {
        title: 'Línea Nacional de Salud Mental',
        phone: '0800-999-0091',
        description: 'Orientación y apoyo en salud mental del Ministerio de Salud de la Nación.',
        hours: '24 horas',
        url: 'https://www.argentina.gob.ar/salud/mental-y-adicciones',
      },
      {
        title: 'Emergencias Médicas / Policía',
        phone: '107 (SAME) / 911',
        description: 'Atención presencial inmediata en situaciones de emergencia vital.',
        hours: '24 horas',
      },
    ];
  }

  if (jur.code === 'ES') {
    return [
      {
        title: 'Línea de Atención a la Conducta Suicida',
        phone: '024',
        description: 'Servicio público, gratuito, confidencial y atendido por profesionales especializados.',
        hours: '24 horas',
        url: 'https://www.sanidad.gob.es/linea024/',
      },
      {
        title: 'Teléfono de la Esperanza',
        phone: '717 003 717',
        description: 'Escucha activa e intervención en situaciones de crisis emocional.',
        hours: '24 horas',
        url: 'https://telefonodelaesperanza.org',
      },
      {
        title: 'Emergencias Generales',
        phone: '112',
        description: 'Atención de emergencias sanitarias y policiales.',
        hours: '24 horas',
      },
    ];
  }

  if (jur.code === 'MX') {
    return [
      {
        title: 'Línea de la Vida',
        phone: '800 911 2000',
        description: 'Atención especializada sobre crisis emocionales y salud mental (CONASAMA).',
        hours: '24 horas / 365 días',
        url: 'https://www.gob.mx/salud/conasama',
      },
      {
        title: 'Emergencias 911',
        phone: '911',
        description: 'Servicio único de atención para emergencias médicas y de seguridad.',
        hours: '24 horas',
      },
    ];
  }

  if (jur.code === 'US') {
    return [
      {
        title: '988 Suicide & Crisis Lifeline',
        phone: '988 (Call or Text)',
        description: 'Free, confidential support for people in distress and crisis resources.',
        hours: '24/7',
        url: 'https://988lifeline.org',
      },
      {
        title: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        description: 'Free, 24/7 crisis support via SMS with a crisis counselor.',
        hours: '24/7',
        url: 'https://www.crisistextline.org',
      },
    ];
  }

  // Generic fallback
  return [
    {
      title: jur.crisisHelplineName,
      phone: jur.crisisHelplineNumber,
      description: 'Línea de asistencia y escucha en momentos difíciles o crisis.',
      hours: 'Consultar según región',
      url: jur.crisisHelplineWeb,
    },
    {
      title: 'Emergencias Generales',
      phone: jur.emergencyGeneral,
      description: 'Servicios de emergencia para asistencia inmediata.',
      hours: '24 horas',
    },
  ];
}

export function formatSafetySupportMessage(jurisdiction: JurisdictionInfo): string {
  return (
    `Noto que podés estar pasando por un momento muy difícil o doloroso. ` +
    `Samuel es una herramienta conversacional de IA y no puede brindarte la asistencia humana o médica que merecés en este instante.\n\n` +
    `Si sentís que estás en riesgo o necesitás ayuda urgente, por favor comunicate de inmediato con una línea de asistencia gratuita y especializada:\n\n` +
    `• **${jurisdiction.crisisHelplineName}**: ${jurisdiction.crisisHelplineNumber}\n` +
    `• **Emergencias**: ${jurisdiction.emergencyGeneral}\n\n` +
    `Hablar con una persona capacitada puede marcar la diferencia ahora mismo.`
  );
}
