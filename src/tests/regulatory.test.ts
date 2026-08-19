/**
 * SAMUEL Test Suite - Regulatory Decoupling
 * 
 * Verifies that legal policies, jurisdiction data, and safety contacts
 * are decoupled and can be updated without modifying core conversational logic.
 */

import { describe, it, expect } from 'vitest';
import { REGULATORY_CONFIG } from '../config/regulatory';
import { JURISDICTIONS, detectUserJurisdiction } from '../config/jurisdictions';
import { getSafetyResourcesForJurisdiction } from '../config/safety-resources';

describe('Regulatory & Legal Decoupling', () => {
  it('contains versioned policies and valid minimum age', () => {
    expect(REGULATORY_CONFIG.policyVersion).toBeDefined();
    expect(REGULATORY_CONFIG.minimumAge).toBeGreaterThanOrEqual(13);
    expect(REGULATORY_CONFIG.productClassification.isMedicalDevice).toBe(false);
    expect(REGULATORY_CONFIG.productClassification.isDiagnosticTool).toBe(false);
  });

  it('provides verified crisis contacts for key jurisdictions', () => {
    const jurisdictionsToCheck = ['AR', 'ES', 'MX', 'US'];
    
    for (const code of jurisdictionsToCheck) {
      const jur = JURISDICTIONS[code];
      expect(jur).toBeDefined();
      expect(jur.crisisHelplineNumber).toBeTruthy();
      expect(jur.emergencyGeneral).toBeTruthy();

      const resources = getSafetyResourcesForJurisdiction(code);
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].phone).toBeTruthy();
      expect(resources[0].title).toBeTruthy();
    }
  });

  it('detectUserJurisdiction returns a valid fallback string', () => {
    const detected = detectUserJurisdiction();
    expect(typeof detected).toBe('string');
    expect(JURISDICTIONS[detected]).toBeDefined();
  });
});
