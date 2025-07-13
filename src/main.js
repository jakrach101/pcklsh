/**
 * Main Application Entry Point
 * Initializes the medical calculator application with all components
 */

import { DRUG_CONFIG, ROTATION_DRUGS, THEME_KEY } from './config/drug-config.js';
import { CalculationEngine } from './services/calculation-engine.js';
import { stateManager } from './services/state-manager.js';
import { modalsComponent } from './components/modals.js';
import { medicationInput } from './components/medication-input.js';

class MedicalCalculatorApp {
    constructor() {
        this.calculationEngine = new CalculationEngine();
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.applyTheme();
        this.populateDropdowns();
        this.attachEventListeners();
        this.loadSavedState();
        this.calculateAndRender();
    }

    cacheElements() {
        this.elements = {
            // Theme and utilities
            body: document.body,
            themeToggleBtn: document.getElementById('theme-toggle-btn'),
            safetyChecklistBtn: document.getElementById('safety-checklist-btn'),
            clearAllBtn: document.getElementById('clear-all-btn'),
            
            // Main sections
            medSection: document.getElementById('medication-section'),
            titrationToolContainer: document.getElementById('titration-tool-container'),
            titrationToolHeader: document.getElementById('titration-tool-header'),
            titrationToolContent: document.getElementById('titration-tool-content'),
            titrationToggleBtn: document.getElementById('titration-toggle-btn'),
            titrationToggleIcon: document.getElementById('titration-toggle-icon'),
            
            // Titration controls
            titrationModeToggle: document.getElementById('titration-mode-toggle'),
            titrationTargetDisplay: document.getElementById('titration-target-display'),
            prnTitrationSection: document.getElementById('prn-titration-section'),
            percentTitrationSection: document.getElementById('percent-titration-section'),
            balanceTitrationSection: document.getElementById('balance-titration-section'),
            balanceInstruction: document.getElementById('balance-instruction'),
            
            // Breakthrough section
            breakthroughRowsContainer: document.getElementById('breakthrough-rows-container'),
            addBreakthroughBtn: document.getElementById('add-breakthrough-btn'),
            breakthroughCalcDrug: document.getElementById('breakthrough-calc-drug'),
            breakthroughCalcPercent: document.getElementById('breakthrough-calc-percent'),
            breakthroughRecommendationText: document.getElementById('breakthrough-recommendation-text'),
            
            // Rotation section
            rotationBasalRowsContainer: document.getElementById('rotation-basal-rows-container'),
            addRotationBasalBtn: document.getElementById('add-rotation-basal-btn'),
            rotationTargetDrug: document.getElementById('rotation-target-drug'),
            rotateBtn: document.getElementById('rotate-btn'),
            cancelRotateBtn: document.getElementById('cancel-rotate-btn'),
            
            // MME displays
            totalMmeBox: document.getElementById('total-mme-box'),
            totalMmeNormalView: document.getElementById('total-mme-normal-view'),
            totalMmeRotationView: document.getElementById('total-mme-rotation-view'),
            totalMmeDisplay: document.getElementById('total-mme-display'),
            rotationResultDisplay: document.getElementById('rotation-result-display'),
            rotationResultUnit: document.getElementById('rotation-result-unit'),
            basalMmeDisplay: document.getElementById('basal-mme-display'),
            prnMmeDisplay: document.getElementById('prn-mme-display'),
            prnRatioDisplay: document.getElementById('prn-ratio-display'),
            
            // Custom percent input
            customPercentInput: document.getElementById('custom-percent-input'),
        };
    }

    applyTheme() {
        const theme = stateManager.getTheme();
        this.elements.body.className = `p-3 sm:p-4 md:p-6 ${theme}`;
    }

    populateDropdowns() {
        // Populate main medication dropdowns
        this.populateMedicationDropdowns();
        
        // Populate breakthrough dropdown
        this.populateBreakthroughDropdown();
        
        // Populate rotation dropdown
        this.populateRotationDropdown();
    }

    populateMedicationDropdowns() {
        const basalDrugs = Object.entries(DRUG_CONFIG).filter(([key, drug]) => drug.isBasal);
        
        basalDrugs.forEach(([key, drug]) => {
            // This will be populated when medication rows are created
        });
    }

    populateBreakthroughDropdown() {
        const breakthroughDrugs = Object.entries(DRUG_CONFIG).filter(([key, drug]) => drug.isBreakthrough);
        
        if (this.elements.breakthroughCalcDrug) {
            this.elements.breakthroughCalcDrug.innerHTML = '<option value="">เลือกยา</option>';
            breakthroughDrugs.forEach(([key, drug]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = drug.name;
                this.elements.breakthroughCalcDrug.appendChild(option);
            });
        }
    }

    populateRotationDropdown() {
        if (this.elements.rotationTargetDrug) {
            this.elements.rotationTargetDrug.innerHTML = '<option value="">เลือกยาที่ต้องการหมุนเวียน</option>';
            Object.entries(ROTATION_DRUGS).forEach(([key, drug]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = drug.name;
                this.elements.rotationTargetDrug.appendChild(option);
            });
        }
    }

    attachEventListeners() {
        // Theme toggle
        if (this.elements.themeToggleBtn) {
            this.elements.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Safety checklist
        if (this.elements.safetyChecklistBtn) {
            this.elements.safetyChecklistBtn.addEventListener('click', () => {
                modalsComponent.openModal('#safety-modal');
            });
        }

        // Clear all
        if (this.elements.clearAllBtn) {
            this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
        }

        // Titration tool toggle
        if (this.elements.titrationToggleBtn) {
            this.elements.titrationToggleBtn.addEventListener('click', () => this.toggleTitrationTool());
        }

        // Titration mode toggle
        if (this.elements.titrationModeToggle) {
            this.elements.titrationModeToggle.addEventListener('click', (e) => {
                if (e.target.classList.contains('utility-btn')) {
                    this.setTitrationMode(e.target.dataset.mode);
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

        // Custom percent input
        if (this.elements.customPercentInput) {
            this.elements.customPercentInput.addEventListener('input', (e) => {
                const percent = parseFloat(e.target.value);
                if (!isNaN(percent)) {
                    this.applyPercentageAdjustment(percent);
                }
            });
        }

        // Breakthrough section
        if (this.elements.addBreakthroughBtn) {
            this.elements.addBreakthroughBtn.addEventListener('click', () => this.addBreakthroughRow());
        }

        if (this.elements.breakthroughCalcDrug) {
            this.elements.breakthroughCalcDrug.addEventListener('change', () => this.calculateAndRender());
        }

        if (this.elements.breakthroughCalcPercent) {
            this.elements.breakthroughCalcPercent.addEventListener('change', () => this.calculateAndRender());
        }

        // Rotation section
        if (this.elements.addRotationBasalBtn) {
            this.elements.addRotationBasalBtn.addEventListener('click', () => this.addRotationBasalRow());
        }

        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => this.handleRotation());
        }

        if (this.elements.cancelRotateBtn) {
            this.elements.cancelRotateBtn.addEventListener('click', () => this.cancelRotation());
        }

        // MME display click for quick reference
        if (this.elements.totalMmeDisplay) {
            this.elements.totalMmeDisplay.addEventListener('click', () => {
                const totalMME = parseFloat(this.elements.totalMmeDisplay.textContent) || 0;
                if (totalMME > 0) {
                    modalsComponent.openQuickReferenceModal(totalMME);
                }
            });
        }

        // Custom events
        document.addEventListener('applyTDDHelper', (e) => {
            const { targetKey, dose } = e.detail;
            this.applyTDDHelper(targetKey, dose);
        });

        document.addEventListener('medicationChange', (e) => {
            this.calculateAndRender();
        });

        // State manager listeners
        stateManager.addListener('main', (state) => {
            this.onStateChange(state);
        });
    }

    toggleTheme() {
        const currentTheme = stateManager.getTheme();
        const newTheme = currentTheme === 'theme-material' ? 'theme-neumorphic' : 'theme-material';
        stateManager.saveTheme(newTheme);
        this.applyTheme();
    }

    toggleTitrationTool() {
        stateManager.toggleTitrationToolCollapse();
        const isCollapsed = stateManager.getState().isTitrationToolCollapsed;
        
        if (isCollapsed) {
            this.elements.titrationToolContent.style.display = 'none';
            this.elements.titrationToggleIcon.style.transform = 'rotate(0deg)';
        } else {
            this.elements.titrationToolContent.style.display = 'block';
            this.elements.titrationToggleIcon.style.transform = 'rotate(180deg)';
        }
    }

    setTitrationMode(mode) {
        stateManager.setTitrationMode(mode);
        
        // Update UI
        this.elements.titrationModeToggle.querySelectorAll('.utility-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.elements.titrationModeToggle.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Show/hide appropriate sections
        this.elements.prnTitrationSection.classList.toggle('hidden', mode !== 'prn');
        this.elements.percentTitrationSection.classList.toggle('hidden', mode !== 'percent');
        this.elements.balanceTitrationSection.classList.toggle('hidden', mode !== 'balance');
        
        this.updateTitrationTargetDisplay();
    }

    updateTitrationTargetDisplay() {
        const state = stateManager.getState();
        const mode = state.titrationMode;
        
        let displayText = '';
        if (mode === 'prn') {
            displayText = 'PRN Titration';
        } else if (mode === 'percent') {
            displayText = `${state.percentAdjustment}% Adjustment`;
        } else if (mode === 'balance') {
            const { decreaseKey, increaseKey } = state.balancePair;
            if (decreaseKey && increaseKey) {
                displayText = `Balance: ${DRUG_CONFIG[decreaseKey]?.name || ''} ↓ ${DRUG_CONFIG[increaseKey]?.name || ''} ↑`;
            } else {
                displayText = 'Select drugs to balance';
            }
        }
        
        this.elements.titrationTargetDisplay.textContent = displayText;
    }

    applyPercentageAdjustment(percentage) {
        stateManager.setPercentageAdjustment(percentage);
        
        // Update UI
        document.querySelectorAll('.percent-adjust-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[data-percent="${percentage}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        this.updateTitrationTargetDisplay();
        this.calculateAndRender();
    }

    applyBalanceAdjustment(percentage) {
        const state = stateManager.getState();
        const { decreaseKey, increaseKey } = state.balancePair;
        
        if (decreaseKey && increaseKey) {
            // Apply balance adjustment logic
            this.calculateAndRender();
        }
    }

    addBreakthroughRow(data = { key: '', dose: '' }) {
        const row = document.createElement('div');
        row.className = 'prn-row grid grid-cols-1 sm:grid-cols-2 gap-2';
        
        // Populate breakthrough drugs
        const breakthroughDrugs = Object.entries(DRUG_CONFIG).filter(([key, drug]) => drug.isBreakthrough);
        let options = '<option value="">เลือกยา</option>';
        breakthroughDrugs.forEach(([key, drug]) => {
            const selected = key === data.key ? 'selected' : '';
            options += `<option value="${key}" ${selected}>${drug.name}</option>`;
        });
        
        row.innerHTML = `
            <select class="select-field prn-drug-select">${options}</select>
            <div class="flex gap-2">
                <input type="number" inputmode="decimal" class="input-field prn-dose-input flex-1" placeholder="ขนาดยา" value="${data.dose}">
                <button class="btn btn-icon remove-prn-btn" title="ลบรายการ">
                    <i class="fas fa-times text-red-500"></i>
                </button>
            </div>
        `;
        
        this.elements.breakthroughRowsContainer.appendChild(row);
        
        // Add event listeners
        row.querySelector('.prn-drug-select').addEventListener('change', () => this.calculateAndRender());
        row.querySelector('.prn-dose-input').addEventListener('input', () => this.calculateAndRender());
        row.querySelector('.remove-prn-btn').addEventListener('click', () => this.removeBreakthroughRow(row));
    }

    removeBreakthroughRow(row) {
        if (this.elements.breakthroughRowsContainer.children.length > 1) {
            row.remove();
        } else {
            // Reset the last row instead of removing
            row.querySelector('.prn-drug-select').value = '';
            row.querySelector('.prn-dose-input').value = '';
        }
        this.calculateAndRender();
    }

    addRotationBasalRow(data = { key: '', dose: '' }) {
        const row = document.createElement('div');
        row.className = 'rotation-basal-row grid grid-cols-1 sm:grid-cols-2 gap-2';
        
        // Populate basal drugs
        const basalDrugs = Object.entries(DRUG_CONFIG).filter(([key, drug]) => drug.isBasal);
        let options = '<option value="">เลือกยา</option>';
        basalDrugs.forEach(([key, drug]) => {
            const selected = key === data.key ? 'selected' : '';
            options += `<option value="${key}" ${selected}>${drug.name}</option>`;
        });
        
        row.innerHTML = `
            <select class="select-field rotation-basal-drug-select">${options}</select>
            <div class="flex gap-2">
                <input type="number" inputmode="decimal" class="input-field rotation-basal-dose-input flex-1" placeholder="ขนาดยา" value="${data.dose}">
                <button class="btn btn-icon remove-rotation-basal-btn" title="ลบรายการ">
                    <i class="fas fa-times text-red-500"></i>
                </button>
            </div>
        `;
        
        this.elements.rotationBasalRowsContainer.appendChild(row);
        
        // Add event listeners
        row.querySelector('.rotation-basal-drug-select').addEventListener('change', () => this.calculateAndRender());
        row.querySelector('.rotation-basal-dose-input').addEventListener('input', () => this.calculateAndRender());
        row.querySelector('.remove-rotation-basal-btn').addEventListener('click', () => {
            row.remove();
            this.calculateAndRender();
        });
    }

    handleRotation() {
        const targetDrug = this.elements.rotationTargetDrug.value;
        if (!targetDrug) return;
        
        const totalMME = this.calculateTotalMME().total;
        const rotationResult = this.calculationEngine.calculateRotation(targetDrug, totalMME);
        
        if (rotationResult) {
            stateManager.setRotationMME(rotationResult.reducedMME);
            
            // Update UI
            this.elements.totalMmeNormalView.classList.add('hidden');
            this.elements.totalMmeRotationView.classList.remove('hidden');
            this.elements.rotationResultDisplay.textContent = rotationResult.dose;
            this.elements.rotationResultUnit.textContent = rotationResult.unit;
            
            // If rotation has helper, open appropriate modal
            if (rotationResult.helper === 'csci') {
                modalsComponent.openCSCIModal(targetDrug, rotationResult.dose);
            } else if (rotationResult.helper === 'iv_infusion') {
                modalsComponent.openIVInfusionModal(targetDrug, rotationResult.dose);
            }
        }
    }

    cancelRotation() {
        stateManager.clearRotationMME();
        
        // Update UI
        this.elements.totalMmeNormalView.classList.remove('hidden');
        this.elements.totalMmeRotationView.classList.add('hidden');
        this.elements.rotationTargetDrug.value = '';
    }

    calculateTotalMME() {
        // Get medications from DOM
        const medications = this.getMedicationsFromDOM();
        const breakthroughMedications = this.getBreakthroughMedicationsFromDOM();
        const rotationBasalMedications = this.getRotationBasalMedicationsFromDOM();
        
        // Update calculation engine
        this.calculationEngine.medications = medications;
        this.calculationEngine.breakthroughMedications = breakthroughMedications;
        this.calculationEngine.rotationBasalMedications = rotationBasalMedications;
        
        return this.calculationEngine.calculateTotalMME();
    }

    getMedicationsFromDOM() {
        return medicationInput.getMedicationData();
    }

    getBreakthroughMedicationsFromDOM() {
        const medications = [];
        const rows = this.elements.breakthroughRowsContainer.querySelectorAll('.prn-row');
        
        rows.forEach(row => {
            const drugSelect = row.querySelector('.prn-drug-select');
            const doseInput = row.querySelector('.prn-dose-input');
            
            if (drugSelect && doseInput) {
                medications.push({
                    key: drugSelect.value,
                    dose: parseFloat(doseInput.value) || 0
                });
            }
        });
        
        return medications;
    }

    getRotationBasalMedicationsFromDOM() {
        const medications = [];
        const rows = this.elements.rotationBasalRowsContainer.querySelectorAll('.rotation-basal-row');
        
        rows.forEach(row => {
            const drugSelect = row.querySelector('.rotation-basal-drug-select');
            const doseInput = row.querySelector('.rotation-basal-dose-input');
            
            if (drugSelect && doseInput) {
                medications.push({
                    key: drugSelect.value,
                    dose: parseFloat(doseInput.value) || 0
                });
            }
        });
        
        return medications;
    }

    calculateAndRender() {
        const mmeData = this.calculateTotalMME();
        
        // Update MME displays
        this.elements.totalMmeDisplay.textContent = mmeData.total;
        this.elements.basalMmeDisplay.textContent = mmeData.basal;
        this.elements.prnMmeDisplay.textContent = mmeData.breakthrough;
        this.elements.prnRatioDisplay.textContent = mmeData.breakthroughRatio + '%';
        
        // Update breakthrough recommendation
        this.updateBreakthroughRecommendation(mmeData.total);
        
        // Update titration target display
        this.updateTitrationTargetDisplay();
    }

    updateBreakthroughRecommendation(totalMME) {
        const drugKey = this.elements.breakthroughCalcDrug.value;
        const percentage = parseFloat(this.elements.breakthroughCalcPercent.value) || 10;
        
        if (drugKey && totalMME > 0) {
            const recommendation = this.calculationEngine.calculateBreakthroughRecommendation(totalMME, drugKey, percentage);
            if (recommendation) {
                this.elements.breakthroughRecommendationText.textContent = 
                    `${recommendation.drug}: ${recommendation.dose} ${recommendation.unit}`;
            }
        } else {
            this.elements.breakthroughRecommendationText.textContent = 'กรุณาเลือกยาและใส่ขนาดยา';
        }
    }

    applyTDDHelper(targetKey, dose) {
        // Find the target input and update it
        const inputs = document.querySelectorAll('.dose-input');
        inputs.forEach(input => {
            if (input.dataset.drugKey === targetKey) {
                input.value = dose;
                this.calculateAndRender();
            }
        });
    }

    loadSavedState() {
        const state = stateManager.getState();
        
        // Load medications
        this.loadMedicationRows(state.medications || []);
        
        // Load breakthrough medications
        this.loadBreakthroughRows(state.breakthroughMedications || []);
        
        // Load rotation basal medications
        this.loadRotationBasalRows(state.rotationBasalMedications || []);
        
        // Load titration mode
        this.setTitrationMode(state.titrationMode || 'prn');
        
        // Load breakthrough calc settings
        if (this.elements.breakthroughCalcDrug && state.breakthroughCalcDrug) {
            this.elements.breakthroughCalcDrug.value = state.breakthroughCalcDrug;
        }
        if (this.elements.breakthroughCalcPercent && state.breakthroughCalcPercent) {
            this.elements.breakthroughCalcPercent.value = state.breakthroughCalcPercent;
        }
    }

    loadMedicationRows(medications) {
        medicationInput.loadMedicationData(medications);
    }

    loadBreakthroughRows(breakthroughMedications) {
        // Clear existing rows
        this.elements.breakthroughRowsContainer.innerHTML = '';
        
        // Load saved rows or create default
        if (breakthroughMedications.length === 0) {
            this.addBreakthroughRow();
        } else {
            breakthroughMedications.forEach(med => this.addBreakthroughRow(med));
        }
    }

    loadRotationBasalRows(rotationBasalMedications) {
        // Clear existing rows
        this.elements.rotationBasalRowsContainer.innerHTML = '';
        
        // Load saved rows
        rotationBasalMedications.forEach(med => this.addRotationBasalRow(med));
    }

    clearAll() {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?')) {
            stateManager.clearAll();
            this.loadSavedState();
            this.calculateAndRender();
        }
    }

    onStateChange(state) {
        // Update medication input component
        medicationInput.updateFromState(state);
        
        // Handle theme changes
        if (state.theme !== this.elements.body.className.split(' ').find(cls => cls.includes('theme-'))) {
            this.applyTheme();
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MedicalCalculatorApp();
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}