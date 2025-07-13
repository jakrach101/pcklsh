/**
 * Medication Input Component
 * Handles the medication input rows and stepper controls
 */

import { DRUG_CONFIG } from '../config/drug-config.js';
import { modalsComponent } from './modals.js';
import { stateManager } from '../services/state-manager.js';

export class MedicationInput {
    constructor() {
        this.medicationRows = [];
        this.init();
    }

    init() {
        this.createMedicationRows();
        this.attachEventListeners();
    }

    createMedicationRows() {
        const container = document.getElementById('medication-section');
        if (!container) return;

        container.innerHTML = '';
        
        // Create initial medication rows
        for (let i = 0; i < 3; i++) {
            this.addMedicationRow();
        }
    }

    addMedicationRow(data = { key: '', dose: '' }) {
        const container = document.getElementById('medication-section');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'medication-row py-4';
        
        // Create drug dropdown options
        const basalDrugs = Object.entries(DRUG_CONFIG).filter(([key, drug]) => drug.isBasal);
        let drugOptions = '<option value="">เลือกยา</option>';
        basalDrugs.forEach(([key, drug]) => {
            const selected = key === data.key ? 'selected' : '';
            drugOptions += `<option value="${key}" ${selected}>${drug.name}</option>`;
        });

        row.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <!-- Drug Selection -->
                <div class="lg:col-span-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">ยา</label>
                    <select class="select-field drug-select w-full" data-row-id="${this.medicationRows.length}">
                        ${drugOptions}
                    </select>
                </div>

                <!-- Dose Input with Stepper -->
                <div class="lg:col-span-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">ขนาดยา</label>
                    <div class="input-stepper">
                        <button class="btn stepper-btn minus" type="button" data-action="decrease">-</button>
                        <input type="number" inputmode="decimal" class="input-field dose-input" 
                               placeholder="ขนาดยา" value="${data.dose}" data-row-id="${this.medicationRows.length}">
                        <button class="btn stepper-btn plus" type="button" data-action="increase">+</button>
                    </div>
                </div>

                <!-- Unit Display -->
                <div class="lg:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
                    <div class="input-field unit-display bg-gray-100 flex items-center justify-center">
                        <span class="text-gray-500 unit-text">-</span>
                    </div>
                </div>

                <!-- MME Display -->
                <div class="lg:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">MME</label>
                    <div class="input-field mme-display bg-blue-50 flex items-center justify-center">
                        <span class="text-blue-700 font-semibold mme-value">0</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="lg:col-span-1 flex justify-end gap-1">
                    <button class="btn btn-icon info-btn" title="ข้อมูลยา" data-drug-key="" style="display: none;">
                        <i class="fas fa-info-circle text-blue-500"></i>
                    </button>
                    <button class="btn btn-icon pin-btn" title="ปักหมุด" data-drug-key="" style="display: none;">
                        <i class="fas fa-thumbtack text-gray-400"></i>
                    </button>
                    <button class="btn btn-icon lock-btn" title="ล็อค" data-drug-key="" style="display: none;">
                        <i class="fas fa-lock text-gray-400"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(row);
        this.medicationRows.push(row);
        this.attachRowEventListeners(row);
        
        return row;
    }

    attachEventListeners() {
        // Global event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('stepper-btn')) {
                this.handleStepperClick(e);
            }
        });
    }

    attachRowEventListeners(row) {
        // Drug selection change
        const drugSelect = row.querySelector('.drug-select');
        if (drugSelect) {
            drugSelect.addEventListener('change', (e) => {
                this.handleDrugChange(e.target);
            });
        }

        // Dose input change
        const doseInput = row.querySelector('.dose-input');
        if (doseInput) {
            doseInput.addEventListener('input', (e) => {
                this.handleDoseChange(e.target);
            });
        }

        // Info button click
        const infoBtn = row.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                const drugKey = e.target.closest('.info-btn').dataset.drugKey;
                if (drugKey) {
                    modalsComponent.openDrugInfoModal(drugKey);
                }
            });
        }

        // Pin button click
        const pinBtn = row.querySelector('.pin-btn');
        if (pinBtn) {
            pinBtn.addEventListener('click', (e) => {
                const drugKey = e.target.closest('.pin-btn').dataset.drugKey;
                this.handlePinClick(drugKey, pinBtn);
            });
        }

        // Lock button click
        const lockBtn = row.querySelector('.lock-btn');
        if (lockBtn) {
            lockBtn.addEventListener('click', (e) => {
                const drugKey = e.target.closest('.lock-btn').dataset.drugKey;
                this.handleLockClick(drugKey, lockBtn);
            });
        }
    }

    handleDrugChange(select) {
        const row = select.closest('.medication-row');
        const drugKey = select.value;
        const drug = DRUG_CONFIG[drugKey];
        
        // Update unit display
        const unitDisplay = row.querySelector('.unit-text');
        if (unitDisplay) {
            unitDisplay.textContent = drug ? drug.unit : '-';
        }

        // Update action buttons
        const infoBtn = row.querySelector('.info-btn');
        const pinBtn = row.querySelector('.pin-btn');
        const lockBtn = row.querySelector('.lock-btn');

        if (drugKey && drug) {
            infoBtn.style.display = 'flex';
            pinBtn.style.display = 'flex';
            lockBtn.style.display = 'flex';
            
            infoBtn.dataset.drugKey = drugKey;
            pinBtn.dataset.drugKey = drugKey;
            lockBtn.dataset.drugKey = drugKey;
        } else {
            infoBtn.style.display = 'none';
            pinBtn.style.display = 'none';
            lockBtn.style.display = 'none';
        }

        // Update dose input placeholder and step
        const doseInput = row.querySelector('.dose-input');
        if (doseInput && drug) {
            doseInput.placeholder = `ขนาดยา (${drug.unit})`;
            doseInput.step = drug.step || 0.1;
        }

        // Trigger MME calculation
        this.handleDoseChange(doseInput);
        this.notifyChange();
    }

    handleDoseChange(input) {
        const row = input.closest('.medication-row');
        const drugSelect = row.querySelector('.drug-select');
        const drugKey = drugSelect.value;
        const dose = parseFloat(input.value) || 0;
        
        // Calculate and display MME
        const mme = this.calculateMME(drugKey, dose);
        const mmeDisplay = row.querySelector('.mme-value');
        if (mmeDisplay) {
            mmeDisplay.textContent = mme.toFixed(1);
        }
        
        this.notifyChange();
    }

    handleStepperClick(e) {
        const button = e.target;
        const action = button.dataset.action;
        const row = button.closest('.medication-row');
        const doseInput = row.querySelector('.dose-input');
        const drugSelect = row.querySelector('.drug-select');
        const drugKey = drugSelect.value;
        const drug = DRUG_CONFIG[drugKey];
        
        if (!drug) return;
        
        const currentValue = parseFloat(doseInput.value) || 0;
        const step = drug.step || 1;
        
        let newValue;
        if (action === 'increase') {
            newValue = currentValue + step;
        } else {
            newValue = Math.max(0, currentValue - step);
        }
        
        doseInput.value = newValue;
        this.handleDoseChange(doseInput);
    }

    handlePinClick(drugKey, pinBtn) {
        const currentPinned = stateManager.getState().pinnedDrugKey;
        
        if (currentPinned === drugKey) {
            // Unpin
            stateManager.setPinnedDrug(null);
            pinBtn.classList.remove('pinned');
            pinBtn.title = 'ปักหมุด';
        } else {
            // Pin this drug and unpin others
            stateManager.setPinnedDrug(drugKey);
            
            // Update all pin buttons
            document.querySelectorAll('.pin-btn').forEach(btn => {
                if (btn.dataset.drugKey === drugKey) {
                    btn.classList.add('pinned');
                    btn.title = 'ยกเลิกปักหมุด';
                } else {
                    btn.classList.remove('pinned');
                    btn.title = 'ปักหมุด';
                }
            });
        }
    }

    handleLockClick(drugKey, lockBtn) {
        const isLocked = stateManager.isDrugLocked(drugKey);
        
        stateManager.toggleDrugLock(drugKey);
        
        if (isLocked) {
            lockBtn.classList.remove('locked');
            lockBtn.title = 'ล็อค';
        } else {
            lockBtn.classList.add('locked');
            lockBtn.title = 'ปลดล็อค';
        }
    }

    calculateMME(drugKey, dose) {
        const drug = DRUG_CONFIG[drugKey];
        if (!drug || !dose) return 0;

        let mme = 0;
        if (drug.strength) {
            mme = (dose * drug.strength) / drug.factor;
        } else {
            mme = dose / drug.factor;
        }

        return Math.round(mme * 100) / 100;
    }

    getMedicationData() {
        const medications = [];
        
        this.medicationRows.forEach(row => {
            const drugSelect = row.querySelector('.drug-select');
            const doseInput = row.querySelector('.dose-input');
            
            if (drugSelect && doseInput) {
                medications.push({
                    key: drugSelect.value,
                    dose: parseFloat(doseInput.value) || 0
                });
            }
        });
        
        return medications;
    }

    loadMedicationData(medications) {
        // Clear existing rows
        const container = document.getElementById('medication-section');
        if (container) {
            container.innerHTML = '';
            this.medicationRows = [];
        }

        // Create rows with data
        medications.forEach(medication => {
            this.addMedicationRow(medication);
        });

        // Ensure minimum 3 rows
        while (this.medicationRows.length < 3) {
            this.addMedicationRow();
        }
    }

    notifyChange() {
        // Dispatch custom event for main app to handle
        const event = new CustomEvent('medicationChange', {
            detail: {
                medications: this.getMedicationData()
            }
        });
        document.dispatchEvent(event);
    }

    updateFromState(state) {
        // Update UI based on state changes
        const { pinnedDrugKey, lockedDrugs } = state;
        
        // Update pin buttons
        document.querySelectorAll('.pin-btn').forEach(btn => {
            const drugKey = btn.dataset.drugKey;
            if (drugKey === pinnedDrugKey) {
                btn.classList.add('pinned');
                btn.title = 'ยกเลิกปักหมุด';
            } else {
                btn.classList.remove('pinned');
                btn.title = 'ปักหมุด';
            }
        });

        // Update lock buttons
        document.querySelectorAll('.lock-btn').forEach(btn => {
            const drugKey = btn.dataset.drugKey;
            if (lockedDrugs.includes(drugKey)) {
                btn.classList.add('locked');
                btn.title = 'ปลดล็อค';
            } else {
                btn.classList.remove('locked');
                btn.title = 'ล็อค';
            }
        });
    }
}

// Export singleton instance
export const medicationInput = new MedicationInput();