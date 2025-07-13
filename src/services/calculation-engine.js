/**
 * Calculation Engine Service
 * Handles all medical calculations including MME conversion, dose calculations, and clinical computations
 */

import { DRUG_CONFIG, ROTATION_DRUGS, SYRINGE_DATA, CLINICAL_PEARLS } from '../config/drug-config.js';

export class CalculationEngine {
    constructor() {
        this.medications = [];
        this.breakthroughMedications = [];
        this.rotationBasalMedications = [];
        this.percentAdjustment = 0;
        this.lockedDrugs = [];
        this.balancePair = { decreaseKey: null, increaseKey: null };
    }

    /**
     * Calculate MME for a single medication
     * @param {string} drugKey - Drug identifier
     * @param {number} dose - Dose amount
     * @returns {number} MME value
     */
    calculateMME(drugKey, dose) {
        const drug = DRUG_CONFIG[drugKey] || ROTATION_DRUGS[drugKey];
        if (!drug || !dose) return 0;

        let mme = 0;
        if (drug.strength) {
            mme = (dose * drug.strength) / drug.factor;
        } else {
            mme = dose / drug.factor;
        }

        return Math.round(mme * 100) / 100;
    }

    /**
     * Calculate total MME from all medications
     * @returns {Object} MME breakdown
     */
    calculateTotalMME() {
        let basalMME = 0;
        let breakthroughMME = 0;
        let totalMME = 0;

        // Calculate basal MME
        this.medications.forEach(med => {
            if (med.key && med.dose) {
                const mme = this.calculateMME(med.key, med.dose);
                basalMME += mme;
            }
        });

        // Calculate breakthrough MME
        this.breakthroughMedications.forEach(med => {
            if (med.key && med.dose) {
                const mme = this.calculateMME(med.key, med.dose);
                breakthroughMME += mme;
            }
        });

        // Calculate rotation basal MME
        this.rotationBasalMedications.forEach(med => {
            if (med.key && med.dose) {
                const mme = this.calculateMME(med.key, med.dose);
                basalMME += mme;
            }
        });

        totalMME = basalMME + breakthroughMME;

        return {
            basal: Math.round(basalMME * 100) / 100,
            breakthrough: Math.round(breakthroughMME * 100) / 100,
            total: Math.round(totalMME * 100) / 100,
            breakthroughRatio: totalMME > 0 ? Math.round((breakthroughMME / totalMME) * 100) : 0
        };
    }

    /**
     * Calculate breakthrough dose recommendation
     * @param {number} totalMME - Total MME value
     * @param {string} drugKey - Drug key for breakthrough medication
     * @param {number} percentage - Percentage of total MME (default 10%)
     * @returns {Object} Breakthrough recommendation
     */
    calculateBreakthroughRecommendation(totalMME, drugKey, percentage = 10) {
        if (!totalMME || !drugKey) return null;

        const drug = DRUG_CONFIG[drugKey];
        if (!drug || !drug.isBreakthrough) return null;

        const targetMME = (totalMME * percentage) / 100;
        let recommendedDose = 0;

        if (drug.strength) {
            recommendedDose = (targetMME * drug.factor) / drug.strength;
        } else {
            recommendedDose = targetMME * drug.factor;
        }

        // Round to appropriate precision
        if (drug.step) {
            recommendedDose = Math.round(recommendedDose / drug.step) * drug.step;
        } else {
            recommendedDose = Math.round(recommendedDose * 100) / 100;
        }

        return {
            drug: drug.name,
            dose: recommendedDose,
            unit: drug.unit,
            targetMME: Math.round(targetMME * 100) / 100,
            percentage: percentage
        };
    }

    /**
     * Calculate opioid rotation
     * @param {string} targetDrugKey - Target drug key
     * @param {number} currentMME - Current total MME
     * @param {number} reductionPercent - Reduction percentage (default 25%)
     * @returns {Object} Rotation result
     */
    calculateRotation(targetDrugKey, currentMME, reductionPercent = 25) {
        if (!targetDrugKey || !currentMME) return null;

        const targetDrug = ROTATION_DRUGS[targetDrugKey];
        if (!targetDrug) return null;

        const reducedMME = currentMME * (1 - reductionPercent / 100);
        let targetDose = 0;

        if (targetDrug.strength) {
            targetDose = (reducedMME * targetDrug.factor) / targetDrug.strength;
        } else {
            targetDose = reducedMME * targetDrug.factor;
        }

        // Apply rounding based on drug type
        if (targetDrug.allowedDoses) {
            // For drugs with specific allowed doses (like fentanyl patches)
            targetDose = this.findNearestAllowedDose(targetDose, targetDrug.allowedDoses);
        } else if (targetDrug.factor < 1) {
            // For high-potency drugs (like fentanyl)
            targetDose = Math.round(targetDose * 10) / 10;
        } else {
            targetDose = Math.round(targetDose);
        }

        return {
            drug: targetDrug.name,
            dose: targetDose,
            unit: targetDrug.unit,
            originalMME: currentMME,
            reducedMME: Math.round(reducedMME * 100) / 100,
            reductionPercent: reductionPercent,
            helper: targetDrug.helper,
            drugInfo: targetDrug.drugInfo
        };
    }

    /**
     * Find nearest allowed dose for drugs with specific dosing options
     * @param {number} calculatedDose - Calculated dose
     * @param {Array} allowedDoses - Array of allowed doses
     * @returns {number} Nearest allowed dose
     */
    findNearestAllowedDose(calculatedDose, allowedDoses) {
        return allowedDoses.reduce((prev, curr) => {
            return Math.abs(curr - calculatedDose) < Math.abs(prev - calculatedDose) ? curr : prev;
        });
    }

    /**
     * Calculate TDD from IV rate
     * @param {number} drugAmount - Drug amount in solution
     * @param {number} fluidVolume - Fluid volume
     * @param {number} rate - Infusion rate (ml/hr)
     * @returns {number} Total daily dose
     */
    calculateTDDFromRate(drugAmount, fluidVolume, rate) {
        if (!drugAmount || !fluidVolume || !rate) return 0;

        const concentration = drugAmount / fluidVolume;
        const hourlyDose = concentration * rate;
        const dailyDose = hourlyDose * 24;

        return Math.round(dailyDose * 100) / 100;
    }

    /**
     * Calculate CSCI parameters
     * @param {string} drugKey - Drug key
     * @param {number} totalDose - Total daily dose
     * @param {number} syringeSize - Syringe size in ml
     * @param {number} totalVolume - Total volume in ml
     * @returns {Object} CSCI calculation result
     */
    calculateCSCI(drugKey, totalDose, syringeSize, totalVolume) {
        const drug = ROTATION_DRUGS[drugKey];
        if (!drug || !drug.drugInfo) return null;

        const { concentration } = drug.drugInfo;
        const drugVolume = totalDose / concentration;
        const diluentVolume = totalVolume - drugVolume;

        if (diluentVolume < 0) {
            return {
                error: 'Drug volume exceeds total volume',
                drugVolume: Math.round(drugVolume * 100) / 100
            };
        }

        const rateMlHr = totalVolume / 24;
        const syringeLength = SYRINGE_DATA.BD[syringeSize]?.length || 0;
        const rateMmHr = syringeLength / 24;

        return {
            drugVolume: Math.round(drugVolume * 100) / 100,
            diluentVolume: Math.round(diluentVolume * 100) / 100,
            rateMlHr: Math.round(rateMlHr * 100) / 100,
            rateMmHr: Math.round(rateMmHr * 100) / 100,
            concentration: concentration,
            totalVolume: totalVolume,
            syringeSize: syringeSize,
            orderText: this.generateCSCIOrderText(drug.drugInfo.name, totalDose, drugVolume, diluentVolume, rateMlHr)
        };
    }

    /**
     * Calculate IV infusion parameters
     * @param {string} drugKey - Drug key
     * @param {number} totalDose - Total daily dose
     * @param {number} fluidVolume - Fluid volume in ml
     * @returns {Object} IV infusion calculation result
     */
    calculateIVInfusion(drugKey, totalDose, fluidVolume) {
        const drug = ROTATION_DRUGS[drugKey];
        if (!drug || !drug.drugInfo) return null;

        const { concentration, unit } = drug.drugInfo;
        const drugVolume = totalDose / concentration;
        const finalConcentration = totalDose / fluidVolume;
        const dosePerHour = totalDose / 24;

        return {
            drugVolume: Math.round(drugVolume * 100) / 100,
            concentration: Math.round(finalConcentration * 100) / 100,
            concentrationUnit: unit.replace('ml', 'ml in ' + fluidVolume + 'ml'),
            dosePerHour: Math.round(dosePerHour * 100) / 100,
            doseUnit: unit.replace('/ml', '/hr'),
            fluidVolume: fluidVolume,
            orderText: this.generateIVOrderText(drug.drugInfo.name, totalDose, drugVolume, fluidVolume, finalConcentration, unit)
        };
    }

    /**
     * Apply percentage adjustment to medications
     * @param {number} percentage - Adjustment percentage
     * @returns {Array} Adjusted medications
     */
    applyPercentageAdjustment(percentage) {
        this.percentAdjustment = percentage;
        
        return this.medications.map(med => {
            if (med.key && med.dose && !this.lockedDrugs.includes(med.key)) {
                const adjustedDose = med.dose * (1 + percentage / 100);
                const drug = DRUG_CONFIG[med.key];
                
                let finalDose = adjustedDose;
                if (drug.step) {
                    finalDose = Math.round(adjustedDose / drug.step) * drug.step;
                } else {
                    finalDose = Math.round(adjustedDose * 100) / 100;
                }

                return { ...med, dose: finalDose };
            }
            return med;
        });
    }

    /**
     * Apply balance adjustment between two drugs
     * @param {string} decreaseKey - Drug key to decrease
     * @param {string} increaseKey - Drug key to increase
     * @param {number} percentage - Adjustment percentage
     * @returns {Array} Adjusted medications
     */
    applyBalanceAdjustment(decreaseKey, increaseKey, percentage) {
        this.balancePair = { decreaseKey, increaseKey };
        
        return this.medications.map(med => {
            if (med.key === decreaseKey && med.dose) {
                const adjustedDose = med.dose * (1 - Math.abs(percentage) / 100);
                const drug = DRUG_CONFIG[med.key];
                
                let finalDose = adjustedDose;
                if (drug.step) {
                    finalDose = Math.round(adjustedDose / drug.step) * drug.step;
                } else {
                    finalDose = Math.round(adjustedDose * 100) / 100;
                }

                return { ...med, dose: finalDose };
            } else if (med.key === increaseKey && med.dose) {
                const adjustedDose = med.dose * (1 + Math.abs(percentage) / 100);
                const drug = DRUG_CONFIG[med.key];
                
                let finalDose = adjustedDose;
                if (drug.step) {
                    finalDose = Math.round(adjustedDose / drug.step) * drug.step;
                } else {
                    finalDose = Math.round(adjustedDose * 100) / 100;
                }

                return { ...med, dose: finalDose };
            }
            return med;
        });
    }

    /**
     * Generate CSCI order text
     * @param {string} drugName - Drug name
     * @param {number} totalDose - Total dose
     * @param {number} drugVolume - Drug volume
     * @param {number} diluentVolume - Diluent volume
     * @param {number} rate - Rate in ml/hr
     * @returns {string} Order text
     */
    generateCSCIOrderText(drugName, totalDose, drugVolume, diluentVolume, rate) {
        return `${drugName} ${totalDose}mg + NSS ${diluentVolume}ml in ${drugVolume + diluentVolume}ml syringe, infuse at ${rate}ml/hr via CSCI pump`;
    }

    /**
     * Generate IV order text
     * @param {string} drugName - Drug name
     * @param {number} totalDose - Total dose
     * @param {number} drugVolume - Drug volume
     * @param {number} fluidVolume - Fluid volume
     * @param {number} concentration - Final concentration
     * @param {string} unit - Unit
     * @returns {string} Order text
     */
    generateIVOrderText(drugName, totalDose, drugVolume, fluidVolume, concentration, unit) {
        return `${drugName} ${totalDose}${unit.replace('/ml', '')} in ${fluidVolume}ml NSS (concentration: ${concentration}${unit}), infuse continuously`;
    }

    /**
     * Validate drug compatibility and safety
     * @param {Array} medications - Array of medications
     * @returns {Object} Validation result
     */
    validateSafety(medications) {
        const warnings = [];
        const errors = [];

        // Check for duplicate drug types
        const drugTypes = medications.map(med => DRUG_CONFIG[med.key]?.type).filter(Boolean);
        const duplicateTypes = drugTypes.filter((type, index) => drugTypes.indexOf(type) !== index);
        
        if (duplicateTypes.length > 0) {
            warnings.push('มียาประเภทเดียวกันมากกว่า 1 ชนิด');
        }

        // Check for high MME values
        const totalMME = this.calculateTotalMME().total;
        if (totalMME > 200) {
            warnings.push('Total MME สูงมาก (> 200mg) ควรระมัดระวังเป็นพิเศษ');
        }

        // Check for high breakthrough ratio
        const breakthroughRatio = this.calculateTotalMME().breakthroughRatio;
        if (breakthroughRatio > 20) {
            warnings.push('PRN ratio สูงเกินไป (> 20%) ควรพิจารณาเพิ่มยา Basal');
        }

        return {
            isValid: errors.length === 0,
            warnings: warnings,
            errors: errors
        };
    }
}