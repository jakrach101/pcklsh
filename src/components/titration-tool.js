/**
 * Titration Tool Component
 * Handles dose titration functionality including PRN, percentage, and balance modes
 */

import { DRUG_CONFIG } from '../config/drug-config.js';
import { stateManager } from '../services/state-manager.js';
import { debounce } from '../utils/helpers.js';

export class TitrationTool {
    constructor() {
        this.currentMode = 'prn';
        this.debouncedCalculate = debounce(this.calculateTitration.bind(this), 300);
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateModeDisplay();
    }

    attachEventListeners() {
        // Mode toggle buttons
        const modeToggle = document.getElementById('titration-mode-toggle');
        if (modeToggle) {
            modeToggle.addEventListener('click', (e) => {
                if (e.target.classList.contains('utility-btn')) {
                    this.setMode(e.target.dataset.mode);
                }
            });
        }

        // Percentage adjustment buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('percent-adjust-btn')) {
                const percent = parseFloat(e.target.dataset.percent);
                this.applyPercentageAdjustment(percent);
            }
            
            if (e.target.classList.contains('balance-adjust-btn')) {
                const percent = parseFloat(e.target.dataset.percent);
                this.applyBalanceAdjustment(percent);
            }
        });

        // Custom percentage input
        const customPercentInput = document.getElementById('custom-percent-input');
        if (customPercentInput) {
            customPercentInput.addEventListener('input', (e) => {
                const percent = parseFloat(e.target.value);
                if (!isNaN(percent)) {
                    this.applyPercentageAdjustment(percent);
                }
            });
        }

        // PRN row events
        const prnContainer = document.getElementById('breakthrough-rows-container');
        if (prnContainer) {
            prnContainer.addEventListener('input', (e) => {
                if (e.target.classList.contains('prn-dose-input')) {
                    this.debouncedCalculate();
                }
            });

            prnContainer.addEventListener('change', (e) => {
                if (e.target.classList.contains('prn-drug-select')) {
                    this.debouncedCalculate();
                }
            });
        }

        // Balance mode - drug selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pin-btn') && this.currentMode === 'balance') {
                this.handleBalanceDrugSelection(e.target);
            }
        });
    }

    /**
     * Set titration mode
     * @param {string} mode - Mode to set ('prn', 'percent', 'balance')
     */
    setMode(mode) {
        this.currentMode = mode;
        stateManager.setTitrationMode(mode);
        this.updateModeDisplay();
        this.showModeSection(mode);
    }

    /**
     * Update mode display
     */
    updateModeDisplay() {
        const modeButtons = document.querySelectorAll('#titration-mode-toggle .utility-btn');
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            }
        });

        this.updateTargetDisplay();
    }

    /**
     * Show appropriate mode section
     * @param {string} mode - Mode to show
     */
    showModeSection(mode) {
        const sections = {
            prn: document.getElementById('prn-titration-section'),
            percent: document.getElementById('percent-titration-section'),
            balance: document.getElementById('balance-titration-section')
        };

        Object.entries(sections).forEach(([key, section]) => {
            if (section) {
                section.classList.toggle('hidden', key !== mode);
            }
        });
    }

    /**
     * Update target display
     */
    updateTargetDisplay() {
        const targetDisplay = document.getElementById('titration-target-display');
        if (!targetDisplay) return;

        const state = stateManager.getState();
        let displayText = '';

        switch (this.currentMode) {
            case 'prn':
                displayText = 'PRN Based Titration';
                break;
            case 'percent':
                displayText = `${state.percentAdjustment}% Adjustment`;
                break;
            case 'balance':
                const { decreaseKey, increaseKey } = state.balancePair;
                if (decreaseKey && increaseKey) {
                    const decreaseDrug = DRUG_CONFIG[decreaseKey]?.name || 'Unknown';
                    const increaseDrug = DRUG_CONFIG[increaseKey]?.name || 'Unknown';
                    displayText = `Balance: ${decreaseDrug} ↓ ${increaseDrug} ↑`;
                } else {
                    displayText = 'Select drugs to balance';
                }
                break;
        }

        targetDisplay.textContent = displayText;
    }

    /**
     * Apply percentage adjustment
     * @param {number} percentage - Percentage to apply
     */
    applyPercentageAdjustment(percentage) {
        stateManager.setPercentageAdjustment(percentage);
        
        // Update button states
        const buttons = document.querySelectorAll('.percent-adjust-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.percent) === percentage) {
                btn.classList.add('active');
            }
        });

        // Update custom input
        const customInput = document.getElementById('custom-percent-input');
        if (customInput && customInput.value !== percentage.toString()) {
            customInput.value = percentage;
        }

        this.updateTargetDisplay();
        this.calculateTitration();
    }

    /**
     * Apply balance adjustment
     * @param {number} percentage - Percentage to apply
     */
    applyBalanceAdjustment(percentage) {
        const state = stateManager.getState();
        const { decreaseKey, increaseKey } = state.balancePair;

        if (!decreaseKey || !increaseKey) {
            alert('กรุณาเลือกยาที่ต้องการลดและเพิ่มก่อน');
            return;
        }

        // Update button states
        const buttons = document.querySelectorAll('.balance-adjust-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.percent) === percentage) {
                btn.classList.add('active');
            }
        });

        // Apply the adjustment
        this.calculateBalanceAdjustment(decreaseKey, increaseKey, percentage);
    }

    /**
     * Calculate balance adjustment
     * @param {string} decreaseKey - Drug to decrease
     * @param {string} increaseKey - Drug to increase
     * @param {number} percentage - Percentage to adjust
     */
    calculateBalanceAdjustment(decreaseKey, increaseKey, percentage) {
        const medications = this.getMedicationInputs();
        
        medications.forEach(({ input, drugSelect }) => {
            const drugKey = drugSelect.value;
            const currentDose = parseFloat(input.value) || 0;
            
            if (drugKey === decreaseKey) {
                const newDose = currentDose * (1 - Math.abs(percentage) / 100);
                input.value = this.roundToStep(newDose, DRUG_CONFIG[drugKey]?.step || 1);
            } else if (drugKey === increaseKey) {
                const newDose = currentDose * (1 + Math.abs(percentage) / 100);
                input.value = this.roundToStep(newDose, DRUG_CONFIG[drugKey]?.step || 1);
            }
        });

        // Trigger calculation update
        this.calculateTitration();
    }

    /**
     * Handle balance drug selection
     * @param {Element} button - Pin button that was clicked
     */
    handleBalanceDrugSelection(button) {
        const drugKey = button.dataset.drugKey;
        const state = stateManager.getState();
        const { decreaseKey, increaseKey } = state.balancePair;

        if (!decreaseKey) {
            // First selection - set as decrease
            stateManager.setBalancePair(drugKey, null);
            this.updateBalanceInstructions('เลือกยาที่ต้องการเพิ่ม');
            this.highlightBalanceDrug(drugKey, 'decrease');
        } else if (!increaseKey && drugKey !== decreaseKey) {
            // Second selection - set as increase
            stateManager.setBalancePair(decreaseKey, drugKey);
            this.updateBalanceInstructions('สามารถปรับขนาดยาได้แล้ว');
            this.highlightBalanceDrug(drugKey, 'increase');
        } else {
            // Reset selection
            stateManager.setBalancePair(null, null);
            this.updateBalanceInstructions('เลือกยาที่ต้องการลดและยาที่ต้องการเพิ่ม');
            this.clearBalanceHighlights();
        }

        this.updateTargetDisplay();
    }

    /**
     * Update balance instructions
     * @param {string} message - Instruction message
     */
    updateBalanceInstructions(message) {
        const instruction = document.getElementById('balance-instruction');
        if (instruction) {
            instruction.textContent = message;
        }
    }

    /**
     * Highlight balance drug
     * @param {string} drugKey - Drug key to highlight
     * @param {string} type - Type of highlight ('decrease' or 'increase')
     */
    highlightBalanceDrug(drugKey, type) {
        const pinBtns = document.querySelectorAll('.pin-btn');
        pinBtns.forEach(btn => {
            if (btn.dataset.drugKey === drugKey) {
                btn.classList.add(`balance-${type}`);
            }
        });
    }

    /**
     * Clear balance highlights
     */
    clearBalanceHighlights() {
        const pinBtns = document.querySelectorAll('.pin-btn');
        pinBtns.forEach(btn => {
            btn.classList.remove('balance-decrease', 'balance-increase');
        });
    }

    /**
     * Calculate titration based on current mode
     */
    calculateTitration() {
        switch (this.currentMode) {
            case 'prn':
                this.calculatePRNTitration();
                break;
            case 'percent':
                this.calculatePercentageTitration();
                break;
            case 'balance':
                this.calculateBalanceTitration();
                break;
        }

        // Dispatch event for main app to update
        document.dispatchEvent(new CustomEvent('titrationCalculated'));
    }

    /**
     * Calculate PRN-based titration
     */
    calculatePRNTitration() {
        const prnData = this.getPRNData();
        const totalPRNMME = prnData.reduce((sum, item) => sum + item.mme, 0);
        
        if (totalPRNMME > 0) {
            const recommendedIncrease = totalPRNMME * 0.5; // 50% of PRN MME
            this.applyBasalIncrease(recommendedIncrease);
        }
    }

    /**
     * Calculate percentage-based titration
     */
    calculatePercentageTitration() {
        const state = stateManager.getState();
        const percentage = state.percentAdjustment;
        
        if (percentage === 0) return;

        const medications = this.getMedicationInputs();
        medications.forEach(({ input, drugSelect }) => {
            const drugKey = drugSelect.value;
            if (drugKey && !stateManager.isDrugLocked(drugKey)) {
                const currentDose = parseFloat(input.value) || 0;
                const newDose = currentDose * (1 + percentage / 100);
                input.value = this.roundToStep(newDose, DRUG_CONFIG[drugKey]?.step || 1);
            }
        });
    }

    /**
     * Calculate balance titration
     */
    calculateBalanceTitration() {
        const state = stateManager.getState();
        const { decreaseKey, increaseKey } = state.balancePair;
        
        if (!decreaseKey || !increaseKey) return;

        // This is handled by the balance adjustment buttons
        // The actual calculation is done in calculateBalanceAdjustment
    }

    /**
     * Get PRN data from UI
     * @returns {Array} PRN medication data
     */
    getPRNData() {
        const prnRows = document.querySelectorAll('#breakthrough-rows-container .prn-row');
        const prnData = [];

        prnRows.forEach(row => {
            const drugSelect = row.querySelector('.prn-drug-select');
            const doseInput = row.querySelector('.prn-dose-input');
            
            if (drugSelect && doseInput && drugSelect.value) {
                const drugKey = drugSelect.value;
                const dose = parseFloat(doseInput.value) || 0;
                const drug = DRUG_CONFIG[drugKey];
                
                if (drug && dose > 0) {
                    const mme = drug.strength ? (dose * drug.strength) / drug.factor : dose / drug.factor;
                    prnData.push({
                        drugKey,
                        dose,
                        mme: Math.round(mme * 100) / 100
                    });
                }
            }
        });

        return prnData;
    }

    /**
     * Get medication inputs
     * @returns {Array} Medication input elements
     */
    getMedicationInputs() {
        const medications = [];
        const medicationRows = document.querySelectorAll('.medication-row');
        
        medicationRows.forEach(row => {
            const drugSelect = row.querySelector('.drug-select');
            const doseInput = row.querySelector('.dose-input');
            
            if (drugSelect && doseInput) {
                medications.push({
                    drugSelect,
                    input: doseInput
                });
            }
        });

        return medications;
    }

    /**
     * Apply basal increase based on PRN usage
     * @param {number} increaseMME - MME increase amount
     */
    applyBasalIncrease(increaseMME) {
        const state = stateManager.getState();
        const pinnedDrug = state.pinnedDrugKey;
        
        if (pinnedDrug) {
            // Apply increase to pinned drug
            this.increaseDrugDose(pinnedDrug, increaseMME);
        } else {
            // Distribute increase across all basal drugs
            const basalDrugs = this.getBasalDrugs();
            if (basalDrugs.length > 0) {
                const increasePerDrug = increaseMME / basalDrugs.length;
                basalDrugs.forEach(({ drugKey }) => {
                    this.increaseDrugDose(drugKey, increasePerDrug);
                });
            }
        }
    }

    /**
     * Increase drug dose by MME amount
     * @param {string} drugKey - Drug key
     * @param {number} mmeIncrease - MME increase amount
     */
    increaseDrugDose(drugKey, mmeIncrease) {
        const medications = this.getMedicationInputs();
        
        medications.forEach(({ input, drugSelect }) => {
            if (drugSelect.value === drugKey) {
                const drug = DRUG_CONFIG[drugKey];
                const currentDose = parseFloat(input.value) || 0;
                
                // Convert MME increase to drug units
                const doseIncrease = drug.strength ? 
                    (mmeIncrease * drug.factor) / drug.strength : 
                    mmeIncrease * drug.factor;
                
                const newDose = currentDose + doseIncrease;
                input.value = this.roundToStep(newDose, drug.step || 1);
            }
        });
    }

    /**
     * Get basal drugs currently in use
     * @returns {Array} Basal drug data
     */
    getBasalDrugs() {
        const basalDrugs = [];
        const medications = this.getMedicationInputs();
        
        medications.forEach(({ input, drugSelect }) => {
            const drugKey = drugSelect.value;
            const dose = parseFloat(input.value) || 0;
            
            if (drugKey && dose > 0 && DRUG_CONFIG[drugKey]?.isBasal) {
                basalDrugs.push({ drugKey, dose });
            }
        });

        return basalDrugs;
    }

    /**
     * Round to appropriate step
     * @param {number} value - Value to round
     * @param {number} step - Step size
     * @returns {number} Rounded value
     */
    roundToStep(value, step) {
        return Math.round(value / step) * step;
    }

    /**
     * Get current mode
     * @returns {string} Current mode
     */
    getMode() {
        return this.currentMode;
    }

    /**
     * Reset titration
     */
    reset() {
        stateManager.setPercentageAdjustment(0);
        stateManager.setBalancePair(null, null);
        this.updateTargetDisplay();
        this.clearBalanceHighlights();
        
        // Reset button states
        document.querySelectorAll('.percent-adjust-btn, .balance-adjust-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

// Export singleton instance
export const titrationTool = new TitrationTool();