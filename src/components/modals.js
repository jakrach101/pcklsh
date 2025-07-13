/**
 * Modals Component
 * Handles all modal dialogs including TDD Helper, CSCI Helper, IV Infusion, etc.
 */

import { DRUG_CONFIG, ROTATION_DRUGS, CLINICAL_PEARLS } from '../config/drug-config.js';
import { CalculationEngine } from '../services/calculation-engine.js';

export class ModalsComponent {
    constructor() {
        this.calculationEngine = new CalculationEngine();
        this.currentHelperData = {
            tdd: { targetKey: null, dose: 0 },
            csci: { drugKey: null, dose: 0 },
            iv: { drugKey: null, dose: 0 }
        };
        this.init();
    }

    init() {
        this.createModalsHTML();
        this.attachEventListeners();
    }

    createModalsHTML() {
        const modalsContainer = document.getElementById('modals-container');
        modalsContainer.innerHTML = `
            <!-- Drug Information Modal -->
            <div id="drug-info-modal" class="modal-overlay">
                <div class="modal-content space-y-3">
                    <button id="close-drug-info-modal-btn" class="btn btn-icon modal-close-btn">&times;</button>
                    <h3 id="drug-info-title" class="text-xl font-bold text-gray-800"></h3>
                    <div id="drug-info-content" class="text-sm text-gray-700 space-y-2"></div>
                </div>
            </div>

            <!-- TDD Helper Modal -->
            <div id="tdd-helper-modal" class="modal-overlay">
                <div class="modal-content space-y-4">
                    <button id="close-tdd-helper-modal-btn" class="btn btn-icon modal-close-btn">&times;</button>
                    <h3 class="text-lg font-bold text-gray-800">คำนวณ TDD จาก IV Rate</h3>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-sm font-medium text-gray-500">ยาที่คำนวณ</p>
                        <p id="tdd-helper-drug-name" class="text-lg font-bold text-sky-700"></p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label for="tdd-helper-drug-amount" class="block text-sm font-medium text-gray-700">Drug (<span id="tdd-helper-drug-unit">mg</span>)</label>
                            <input type="number" inputmode="decimal" id="tdd-helper-drug-amount" class="input-field mt-1 text-right" placeholder="100">
                        </div>
                        <div>
                            <label for="tdd-helper-fluid-volume" class="block text-sm font-medium text-gray-700">Volume (mL)</label>
                            <input type="number" inputmode="decimal" id="tdd-helper-fluid-volume" class="input-field mt-1 text-right" placeholder="100">
                        </div>
                        <div>
                            <label for="tdd-helper-rate" class="block text-sm font-medium text-gray-700">Rate (mL/hr)</label>
                            <input type="number" inputmode="decimal" id="tdd-helper-rate" class="input-field mt-1 text-right" placeholder="2">
                        </div>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                        <p class="text-sm font-medium text-gray-500">Calculated TDD</p>
                        <p id="tdd-helper-result-display" class="text-2xl font-bold text-blue-800">0</p>
                    </div>
                    <button id="confirm-tdd-helper-btn" class="btn btn-primary w-full">ยืนยัน</button>
                </div>
            </div>

            <!-- CSCI Helper Modal -->
            <div id="csci-modal" class="modal-overlay">
                <div class="modal-content space-y-4">
                    <button id="cancel-csci-modal-btn" class="btn btn-icon modal-close-btn">&times;</button>
                    <h3 class="text-lg font-bold text-gray-800">CSCI Helper</h3>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-sm font-medium text-gray-500">ยาที่คำนวณ</p>
                        <p id="csci-drug-name" class="text-lg font-bold text-sky-700 mb-2"></p>
                        <div class="flex justify-between items-center">
                            <label for="csci-total-dose-input" class="block text-sm font-medium text-gray-700">Dose/24hr (<span id="csci-dose-unit"></span>)</label>
                            <button id="csci-reset-dose-btn" class="btn btn-icon !w-7 !h-7" title="Reset Dose"><i class="fas fa-undo"></i></button>
                        </div>
                        <input type="number" inputmode="decimal" id="csci-total-dose-input" class="input-field mt-1 text-lg font-bold text-sky-700">
                        <p id="csci-new-mme" class="text-xs text-center text-gray-500 mt-1 h-4"></p>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label for="csci-syringe-size" class="block text-sm font-medium text-gray-700">Syringe Size</label>
                            <select id="csci-syringe-size" class="select-field mt-1">
                                <option value="30">30 ml</option>
                                <option value="20">20 ml</option>
                                <option value="50">50 ml</option>
                            </select>
                        </div>
                        <div>
                            <label for="csci-total-volume" class="block text-sm font-medium text-gray-700">Total Volume (ml)</label>
                            <input type="number" inputmode="decimal" id="csci-total-volume" class="input-field mt-1" placeholder="e.g. 22, 24, 48">
                        </div>
                    </div>
                    <div id="csci-result-wrapper">
                        <div id="csci-error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md hidden">
                            <p id="csci-error-text"></p>
                        </div>
                        <div id="csci-result" class="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2 hidden">
                            <p class="font-semibold">ผลการคำนวณ:</p>
                            <div class="grid grid-cols-3 gap-2 text-sm text-center">
                                <div><span class="font-medium block">Drug Vol.</span><strong id="csci-drug-volume" class="text-blue-800"></strong></div>
                                <div><span class="font-medium block">NSS Vol.</span><strong id="csci-diluent-volume" class="text-blue-800"></strong></div>
                                <div><span class="font-medium block">Rate (ml/hr)</span><strong id="csci-rate-ml" class="text-blue-800"></strong></div>
                            </div>
                            <div class="text-center mt-2"><span class="font-medium">Rate (mm/hr)</span><strong id="csci-rate-mm" class="text-blue-800 text-lg ml-2"></strong></div>
                            <div class="mt-2 pt-2 border-t border-blue-200">
                                <p class="font-semibold">ตัวอย่างการสั่งยา:</p>
                                <p id="csci-order-text" class="text-xs text-gray-700 bg-gray-100 p-2 rounded"></p>
                            </div>
                        </div>
                    </div>
                    <button id="close-csci-modal-btn" class="btn btn-primary w-full">ยืนยัน</button>
                </div>
            </div>

            <!-- IV Infusion Helper Modal -->
            <div id="iv-infusion-modal" class="modal-overlay">
                <div class="modal-content space-y-4">
                    <button id="cancel-iv-modal-btn" class="btn btn-icon modal-close-btn">&times;</button>
                    <h3 class="text-lg font-bold text-gray-800">IV Infusion Helper</h3>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-sm font-medium text-gray-500">ยาที่คำนวณ</p>
                        <p id="iv-drug-name" class="text-lg font-bold text-sky-700 mb-2"></p>
                        <div class="flex justify-between items-center">
                            <label for="iv-total-dose-input" class="block text-sm font-medium text-gray-700">Dose/24hr (<span id="iv-dose-unit"></span>)</label>
                            <button id="iv-reset-dose-btn" class="btn btn-icon !w-7 !h-7" title="Reset Dose"><i class="fas fa-undo"></i></button>
                        </div>
                        <input type="number" inputmode="decimal" id="iv-total-dose-input" class="input-field mt-1 text-lg font-bold text-sky-700">
                        <p id="iv-new-mme" class="text-xs text-center text-gray-500 mt-1 h-4"></p>
                    </div>
                    <div>
                        <label for="iv-fluid-volume" class="block text-sm font-medium text-gray-700">Fluid Volume (ml)</label>
                        <input type="number" inputmode="decimal" id="iv-fluid-volume" class="input-field mt-1" value="100">
                    </div>
                    <div id="iv-result-wrapper">
                        <div id="iv-error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md hidden">
                            <p id="iv-error-text"></p>
                        </div>
                        <div id="iv-result" class="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2 hidden">
                            <p class="font-semibold">ผลการคำนวณ:</p>
                            <div class="grid grid-cols-2 gap-2 text-sm text-center">
                                <div><span class="font-medium block">Concentration</span><strong id="iv-concentration" class="text-blue-800"></strong></div>
                                <div><span class="font-medium block">Dose/hr</span><strong id="iv-dose-hr" class="text-blue-800"></strong></div>
                            </div>
                            <div class="mt-2 pt-2 border-t border-blue-200">
                                <p class="font-semibold">ตัวอย่างการสั่งยา:</p>
                                <p id="iv-order-text" class="text-xs text-gray-700 bg-gray-100 p-2 rounded"></p>
                            </div>
                        </div>
                    </div>
                    <button id="close-iv-infusion-modal-btn" class="btn btn-primary w-full">ยืนยัน</button>
                </div>
            </div>

            <!-- Safety Checklist Modal -->
            <div id="safety-modal" class="modal-overlay">
                <div class="modal-content space-y-4">
                    <button id="close-safety-modal-btn" class="btn btn-icon modal-close-btn">&times;</button>
                    <h3 class="text-lg font-bold text-yellow-800 flex items-center gap-2">
                        <i class="fas fa-check-circle"></i> Clinical Pearls
                    </h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-700 text-sm">
                        <li><strong>การประเมินผู้ป่วย:</strong> อายุ, การทำงานของไตและตับ, ภาวะสับสน (Delirium), ประวัติการใช้ Opioids.</li>
                        <li><strong>ยาที่ใช้ร่วมกัน:</strong> โดยเฉพาะกลุ่ม Benzodiazepines หรือ Gabapentinoids.</li>
                        <li><strong>Incomplete Cross-Tolerance:</strong> พิจารณาลดยา 25-50% เมื่อทำการหมุนเวียนยา.</li>
                        <li><strong>เป้าหมายการรักษา:</strong> ตั้งเป้าหมาย (Goal of Care) ร่วมกับผู้ป่วยและครอบครัวเสมอ.</li>
                    </ul>
                    <div class="mt-4 pt-4 border-t border-yellow-200">
                        <h4 class="font-semibold text-yellow-900 mb-2">ตัวอย่างรายการยา (Formulary)</h4>
                        <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>MST (10mg, 30mg)</li>
                            <li>Kapanol (20mg)</li>
                            <li>Morphine injection 10mg/ampule</li>
                            <li>Fentanyl patch (25mcg/hr)</li>
                            <li>Fentanyl injection 100mcg/ampule</li>
                            <li>Morphine IR (10mg)</li>
                            <li>Morphine Syrup (2mg/ml)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Quick Reference Modal -->
            <div id="quick-ref-modal" class="modal-overlay">
                <div class="modal-content space-y-4">
                    <button id="close-quick-ref-modal-btn" class="btn btn-icon modal-close-btn">&times;</button>
                    <h3 id="quick-ref-title" class="text-lg font-bold text-gray-800">Quick Reference</h3>
                    <div class="bg-gray-50 p-3 rounded-lg text-center">
                        <p class="text-sm font-medium text-gray-500">MME/day</p>
                        <p id="quick-ref-mme-total" class="text-2xl font-bold text-sky-700"></p>
                    </div>
                    <div id="quick-ref-list" class="space-y-2"></div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Modal close listeners
        const modals = [
            { modal: '#drug-info-modal', closeBtn: '#close-drug-info-modal-btn' },
            { modal: '#tdd-helper-modal', closeBtn: '#close-tdd-helper-modal-btn' },
            { modal: '#csci-modal', closeBtn: '#cancel-csci-modal-btn' },
            { modal: '#iv-infusion-modal', closeBtn: '#cancel-iv-modal-btn' },
            { modal: '#safety-modal', closeBtn: '#close-safety-modal-btn' },
            { modal: '#quick-ref-modal', closeBtn: '#close-quick-ref-modal-btn' }
        ];

        modals.forEach(({ modal, closeBtn }) => {
            const modalElement = document.querySelector(modal);
            const closeElement = document.querySelector(closeBtn);

            if (modalElement && closeElement) {
                // Close on overlay click
                modalElement.addEventListener('click', (e) => {
                    if (e.target === modalElement) {
                        this.closeModal(modal);
                    }
                });

                // Close on button click
                closeElement.addEventListener('click', () => {
                    this.closeModal(modal);
                });
            }
        });

        // TDD Helper listeners
        const tddInputs = ['#tdd-helper-drug-amount', '#tdd-helper-fluid-volume', '#tdd-helper-rate'];
        tddInputs.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('input', () => this.calculateTDDFromRate());
            }
        });

        const confirmTddBtn = document.querySelector('#confirm-tdd-helper-btn');
        if (confirmTddBtn) {
            confirmTddBtn.addEventListener('click', () => this.applyTDDFromHelper());
        }

        // CSCI Helper listeners
        const csciInputs = ['#csci-total-dose-input', '#csci-total-volume', '#csci-syringe-size'];
        csciInputs.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('input', () => this.calculateCSCI());
                element.addEventListener('change', () => this.calculateCSCI());
            }
        });

        const csciResetBtn = document.querySelector('#csci-reset-dose-btn');
        if (csciResetBtn) {
            csciResetBtn.addEventListener('click', () => this.resetCSCIDose());
        }

        const closeCsciBtn = document.querySelector('#close-csci-modal-btn');
        if (closeCsciBtn) {
            closeCsciBtn.addEventListener('click', () => this.closeModal('#csci-modal'));
        }

        // IV Infusion listeners
        const ivInputs = ['#iv-total-dose-input', '#iv-fluid-volume'];
        ivInputs.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('input', () => this.calculateIVInfusion());
            }
        });

        const ivResetBtn = document.querySelector('#iv-reset-dose-btn');
        if (ivResetBtn) {
            ivResetBtn.addEventListener('click', () => this.resetIVDose());
        }

        const closeIvBtn = document.querySelector('#close-iv-infusion-modal-btn');
        if (closeIvBtn) {
            closeIvBtn.addEventListener('click', () => this.closeModal('#iv-infusion-modal'));
        }
    }

    openModal(modalSelector) {
        const modal = document.querySelector(modalSelector);
        if (modal) {
            modal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalSelector) {
        const modal = document.querySelector(modalSelector);
        if (modal) {
            modal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    openDrugInfoModal(drugKey) {
        const drug = DRUG_CONFIG[drugKey];
        if (!drug) return;

        document.getElementById('drug-info-title').textContent = drug.name;
        document.getElementById('drug-info-content').innerHTML = drug.info || 'ไม่มีข้อมูล';
        
        this.openModal('#drug-info-modal');
    }

    openTDDHelperModal(drugKey, targetKey) {
        const drug = ROTATION_DRUGS[drugKey];
        if (!drug || !drug.drugInfo) return;

        this.currentHelperData.tdd.targetKey = targetKey;
        
        document.getElementById('tdd-helper-drug-name').textContent = drug.name;
        document.getElementById('tdd-helper-drug-unit').textContent = drug.drugInfo.unit.replace('/ml', '');
        
        // Clear previous inputs
        document.getElementById('tdd-helper-drug-amount').value = '';
        document.getElementById('tdd-helper-fluid-volume').value = '';
        document.getElementById('tdd-helper-rate').value = '';
        document.getElementById('tdd-helper-result-display').textContent = '0';
        
        this.openModal('#tdd-helper-modal');
    }

    openCSCIModal(drugKey, dose) {
        const drug = ROTATION_DRUGS[drugKey];
        if (!drug || !drug.drugInfo) return;

        this.currentHelperData.csci = { drugKey, dose };
        
        document.getElementById('csci-drug-name').textContent = drug.name;
        document.getElementById('csci-dose-unit').textContent = drug.drugInfo.unit.replace('/ml', '');
        document.getElementById('csci-total-dose-input').value = Math.round(dose);
        
        // Clear previous results
        document.getElementById('csci-total-volume').value = '';
        document.getElementById('csci-error').classList.add('hidden');
        document.getElementById('csci-result').classList.add('hidden');
        
        this.openModal('#csci-modal');
    }

    openIVInfusionModal(drugKey, dose) {
        const drug = ROTATION_DRUGS[drugKey];
        if (!drug || !drug.drugInfo) return;

        this.currentHelperData.iv = { drugKey, dose };
        
        document.getElementById('iv-drug-name').textContent = drug.name;
        document.getElementById('iv-dose-unit').textContent = drug.drugInfo.unit.replace('/ml', '');
        document.getElementById('iv-total-dose-input').value = Math.round(dose);
        
        // Clear previous results
        document.getElementById('iv-error').classList.add('hidden');
        document.getElementById('iv-result').classList.add('hidden');
        
        this.openModal('#iv-infusion-modal');
    }

    openQuickReferenceModal(totalMME) {
        document.getElementById('quick-ref-mme-total').textContent = totalMME;
        
        const quickRefList = document.getElementById('quick-ref-list');
        quickRefList.innerHTML = '';
        
        // Generate quick reference calculations
        Object.entries(ROTATION_DRUGS).forEach(([key, drug]) => {
            if (key.includes('infusion') || key.includes('csci')) return;
            
            const equivalentDose = this.calculationEngine.calculateRotation(key, totalMME, 0);
            if (equivalentDose) {
                const item = document.createElement('div');
                item.className = 'flex justify-between items-center p-2 bg-white rounded border';
                item.innerHTML = `
                    <span class="font-medium">${drug.name}</span>
                    <span class="text-sky-700 font-bold">${equivalentDose.dose} ${equivalentDose.unit}</span>
                `;
                quickRefList.appendChild(item);
            }
        });
        
        this.openModal('#quick-ref-modal');
    }

    calculateTDDFromRate() {
        const drugAmount = parseFloat(document.getElementById('tdd-helper-drug-amount').value) || 0;
        const fluidVolume = parseFloat(document.getElementById('tdd-helper-fluid-volume').value) || 0;
        const rate = parseFloat(document.getElementById('tdd-helper-rate').value) || 0;
        
        const tdd = this.calculationEngine.calculateTDDFromRate(drugAmount, fluidVolume, rate);
        document.getElementById('tdd-helper-result-display').textContent = tdd;
        
        this.currentHelperData.tdd.dose = tdd;
    }

    applyTDDFromHelper() {
        const { targetKey, dose } = this.currentHelperData.tdd;
        if (targetKey && dose) {
            // Dispatch custom event to update the medication input
            const event = new CustomEvent('applyTDDHelper', {
                detail: { targetKey, dose }
            });
            document.dispatchEvent(event);
        }
        this.closeModal('#tdd-helper-modal');
    }

    calculateCSCI() {
        const { drugKey } = this.currentHelperData.csci;
        const totalDose = parseFloat(document.getElementById('csci-total-dose-input').value) || 0;
        const syringeSize = parseFloat(document.getElementById('csci-syringe-size').value) || 30;
        const totalVolume = parseFloat(document.getElementById('csci-total-volume').value) || 0;
        
        if (!drugKey || !totalDose || !totalVolume) {
            document.getElementById('csci-error').classList.add('hidden');
            document.getElementById('csci-result').classList.add('hidden');
            return;
        }
        
        const result = this.calculationEngine.calculateCSCI(drugKey, totalDose, syringeSize, totalVolume);
        
        if (result.error) {
            document.getElementById('csci-error-text').textContent = result.error;
            document.getElementById('csci-error').classList.remove('hidden');
            document.getElementById('csci-result').classList.add('hidden');
        } else {
            document.getElementById('csci-drug-volume').textContent = result.drugVolume + ' ml';
            document.getElementById('csci-diluent-volume').textContent = result.diluentVolume + ' ml';
            document.getElementById('csci-rate-ml').textContent = result.rateMlHr + ' ml/hr';
            document.getElementById('csci-rate-mm').textContent = result.rateMmHr + ' mm/hr';
            document.getElementById('csci-order-text').textContent = result.orderText;
            
            document.getElementById('csci-error').classList.add('hidden');
            document.getElementById('csci-result').classList.remove('hidden');
        }
        
        // Update MME display
        const newMME = this.calculationEngine.calculateMME(drugKey, totalDose);
        document.getElementById('csci-new-mme').textContent = `MME: ${newMME}`;
    }

    resetCSCIDose() {
        const { dose } = this.currentHelperData.csci;
        if (dose) {
            document.getElementById('csci-total-dose-input').value = Math.round(dose);
            this.calculateCSCI();
        }
    }

    calculateIVInfusion() {
        const { drugKey } = this.currentHelperData.iv;
        const totalDose = parseFloat(document.getElementById('iv-total-dose-input').value) || 0;
        const fluidVolume = parseFloat(document.getElementById('iv-fluid-volume').value) || 100;
        
        if (!drugKey || !totalDose || !fluidVolume) {
            document.getElementById('iv-error').classList.add('hidden');
            document.getElementById('iv-result').classList.add('hidden');
            return;
        }
        
        const result = this.calculationEngine.calculateIVInfusion(drugKey, totalDose, fluidVolume);
        
        if (result.error) {
            document.getElementById('iv-error-text').textContent = result.error;
            document.getElementById('iv-error').classList.remove('hidden');
            document.getElementById('iv-result').classList.add('hidden');
        } else {
            document.getElementById('iv-concentration').textContent = result.concentration + ' ' + result.concentrationUnit;
            document.getElementById('iv-dose-hr').textContent = result.dosePerHour + ' ' + result.doseUnit;
            document.getElementById('iv-order-text').textContent = result.orderText;
            
            document.getElementById('iv-error').classList.add('hidden');
            document.getElementById('iv-result').classList.remove('hidden');
        }
        
        // Update MME display
        const newMME = this.calculationEngine.calculateMME(drugKey, totalDose);
        document.getElementById('iv-new-mme').textContent = `MME: ${newMME}`;
    }

    resetIVDose() {
        const { dose } = this.currentHelperData.iv;
        if (dose) {
            document.getElementById('iv-total-dose-input').value = Math.round(dose);
            this.calculateIVInfusion();
        }
    }
}

// Export singleton instance
export const modalsComponent = new ModalsComponent();