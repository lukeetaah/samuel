/**
 * SAMUEL - Jurisdictions Configuration
 * 
 * Centralized jurisdiction data for localization, legal frameworks, and support resources.
 */

export interface JurisdictionInfo {
  code: string;
  name: string;
  defaultLanguage: string;
  legalFramework: string;
  dataProtectionLaw: string;
  mentalHealthLawNote?: string;
  crisisHelplineName: string;
  crisisHelplineNumber: string;
  crisisHelplineWeb?: string;
  emergencyGeneral: string;
}

export const JURISDICTIONS: Record<string, JurisdictionInfo> = {
  AR: {
    code: 'AR',
    name: 'Argentina',
    defaultLanguage: 'es-AR',
    legalFramework: 'Marco Legal República Argentina',
    dataProtectionLaw: 'Ley 25.326 de Protección de los Datos Personales',
    mentalHealthLawNote: 'Ley 26.657 de Salud Mental (SAMUEL no constituye servicio de salud mental ni diagnóstico)',
    crisisHelplineName: 'Centro de Asistencia al Suicida / Salud Mental Nacional',
    crisisHelplineNumber: '135 (CABA/GBA) o (011) 5275-1135 | 0800-999-0091 (Nacional)',
    crisisHelplineWeb: 'https://www.cas.org.ar',
    emergencyGeneral: '911 / 107 (SAME)',
  },
  ES: {
    code: 'ES',
    name: 'España',
    defaultLanguage: 'es-ES',
    legalFramework: 'Regulación de España y Unión Europea',
    dataProtectionLaw: 'RGPD (Reglamento UE 2016/679) y LOPDGDD 3/2018',
    mentalHealthLawNote: 'Herramienta no sanitaria sin valor diagnóstico',
    crisisHelplineName: 'Línea de Atención a la Conducta Suicida',
    crisisHelplineNumber: '024 / Teléfono de la Esperanza 717 003 717',
    crisisHelplineWeb: 'https://www.sanidad.gob.es/linea024/',
    emergencyGeneral: '112',
  },
  MX: {
    code: 'MX',
    name: 'México',
    defaultLanguage: 'es-MX',
    legalFramework: 'Marco Legal Estados Unidos Mexicanos',
    dataProtectionLaw: 'Ley Federal de Protección de Datos Personales (LFPDPPP)',
    crisisHelplineName: 'Línea de la Vida',
    crisisHelplineNumber: '800 911 2000',
    crisisHelplineWeb: 'https://www.gob.mx/salud/conasama',
    emergencyGeneral: '911',
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    defaultLanguage: 'es-CO',
    legalFramework: 'Marco Legal República de Colombia',
    dataProtectionLaw: 'Ley 1581 de 2012 de Protección de Datos Personales',
    crisisHelplineName: 'Línea 106 de Apoyo Emocional / Línea 192',
    crisisHelplineNumber: '106 / 192',
    emergencyGeneral: '123',
  },
  CL: {
    code: 'CL',
    name: 'Chile',
    defaultLanguage: 'es-CL',
    legalFramework: 'Marco Legal República de Chile',
    dataProtectionLaw: 'Ley 19.628 Sobre Protección de la Vida Privada',
    crisisHelplineName: 'Línea *4141 No Estás Solo / Salud Responde',
    crisisHelplineNumber: '*4141 | 600 360 7777',
    emergencyGeneral: '131 / 133',
  },
  US: {
    code: 'US',
    name: 'United States',
    defaultLanguage: 'en-US',
    legalFramework: 'United States Federal & State Frameworks',
    dataProtectionLaw: 'Applicable US Privacy Standards (No remote transmission)',
    crisisHelplineName: '988 Suicide & Crisis Lifeline',
    crisisHelplineNumber: '988 (Call or Text)',
    crisisHelplineWeb: 'https://988lifeline.org',
    emergencyGeneral: '911',
  },
  INTL: {
    code: 'INTL',
    name: 'Internacional / Otros',
    defaultLanguage: 'es',
    legalFramework: 'Estándares Internacionales de Privacidad Local',
    dataProtectionLaw: 'Privacidad por diseño: Inferencia 100% en dispositivo',
    crisisHelplineName: 'Befrienders Worldwide / IASP Helpline Directory',
    crisisHelplineNumber: 'Consulte recursos locales de emergencia',
    crisisHelplineWeb: 'https://www.befrienders.org',
    emergencyGeneral: 'Servicios de emergencia locales de su país',
  },
};

export const DEFAULT_JURISDICTION_CODE = 'AR';

export function detectUserJurisdiction(): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (timeZone.includes('Buenos_Aires') || timeZone.includes('Argentina')) return 'AR';
      if (timeZone.includes('Madrid')) return 'ES';
      if (timeZone.includes('Mexico') || timeZone.includes('Monterrey') || timeZone.includes('Cancun')) return 'MX';
      if (timeZone.includes('Bogota')) return 'CO';
      if (timeZone.includes('Santiago')) return 'CL';
      if (timeZone.includes('New_York') || timeZone.includes('Chicago') || timeZone.includes('Los_Angeles')) return 'US';
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_JURISDICTION_CODE;
}
