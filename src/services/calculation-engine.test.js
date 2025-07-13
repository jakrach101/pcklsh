/**
 * Calculation Engine Tests
 */

import { CalculationEngine } from '../services/calculation-engine.js';
import { DRUG_CONFIG } from '../config/drug-config.js';

describe('CalculationEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new CalculationEngine();
    });

    describe('calculateMME', () => {
        test('should calculate MME for fentanyl patch correctly', () => {
            const mme = engine.calculateMME('fentanyl_patch', 25);
            expect(mme).toBe(10.42); // 25 / 2.4 = 10.42
        });

        test('should calculate MME for MST correctly', () => {
            const mme = engine.calculateMME('mst_10', 3);
            expect(mme).toBe(30); // 3 * 10 / 1 = 30
        });

        test('should return 0 for invalid drug key', () => {
            const mme = engine.calculateMME('invalid_drug', 25);
            expect(mme).toBe(0);
        });

        test('should return 0 for zero dose', () => {
            const mme = engine.calculateMME('fentanyl_patch', 0);
            expect(mme).toBe(0);
        });
    });

    describe('calculateTotalMME', () => {
        test('should calculate total MME from multiple medications', () => {
            engine.medications = [
                { key: 'fentanyl_patch', dose: 25 },
                { key: 'mst_10', dose: 3 }
            ];

            const result = engine.calculateTotalMME();
            expect(result.basal).toBe(40.42); // 10.42 + 30
            expect(result.breakthrough).toBe(0);
            expect(result.total).toBe(40.42);
        });

        test('should calculate breakthrough MME separately', () => {
            engine.medications = [
                { key: 'fentanyl_patch', dose: 25 }
            ];
            engine.breakthroughMedications = [
                { key: 'morphine_ir_tab_10', dose: 2 }
            ];

            const result = engine.calculateTotalMME();
            expect(result.basal).toBe(10.42);
            expect(result.breakthrough).toBe(20); // 2 * 10 / 1
            expect(result.total).toBe(30.42);
        });
    });

    describe('calculateBreakthroughRecommendation', () => {
        test('should calculate breakthrough recommendation correctly', () => {
            const recommendation = engine.calculateBreakthroughRecommendation(
                100, 'morphine_ir_tab_10', 15
            );

            expect(recommendation).toEqual({
                drug: 'Morphine IR 10mg',
                dose: 2, // (100 * 15 / 100) * 1 / 10 = 1.5, rounded to 2
                unit: 'เม็ด/day',
                targetMME: 15,
                percentage: 15
            });
        });

        test('should return null for invalid drug', () => {
            const recommendation = engine.calculateBreakthroughRecommendation(
                100, 'invalid_drug', 15
            );
            expect(recommendation).toBeNull();
        });
    });

    describe('calculateTDDFromRate', () => {
        test('should calculate TDD from IV rate correctly', () => {
            const tdd = engine.calculateTDDFromRate(100, 50, 2);
            expect(tdd).toBe(96); // (100/50) * 2 * 24 = 96
        });

        test('should return 0 for invalid inputs', () => {
            const tdd = engine.calculateTDDFromRate(0, 50, 2);
            expect(tdd).toBe(0);
        });
    });

    describe('calculateRotation', () => {
        test('should calculate rotation with reduction', () => {
            const rotation = engine.calculateRotation('morphine_sr', 100, 25);
            
            expect(rotation).toEqual({
                drug: 'Morphine SR',
                dose: 75, // 100 * 0.75 * 1 = 75
                unit: 'mg/day',
                originalMME: 100,
                reducedMME: 75,
                reductionPercent: 25,
                helper: undefined,
                drugInfo: undefined
            });
        });

        test('should handle fentanyl patch with allowed doses', () => {
            const rotation = engine.calculateRotation('fentanyl_patch', 120, 25);
            
            expect(rotation.drug).toBe('Fentanyl Patch');
            expect(rotation.dose).toBe(75); // Should be rounded to nearest allowed dose
            expect(rotation.unit).toBe('mcg/hr');
        });
    });
});