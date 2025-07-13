/**
 * State Manager Service
 * Handles application state persistence and management using localStorage with IndexedDB fallback
 */

import { LOCAL_STORAGE_KEY, THEME_KEY } from '../config/drug-config.js';

export class StateManager {
    constructor() {
        this.state = {
            medications: [],
            breakthroughMedications: [],
            rotationBasalMedications: [],
            pinnedDrugKey: null,
            rotationMME: null,
            titrationMode: 'prn',
            percentAdjustment: 0,
            balancePair: { decreaseKey: null, increaseKey: null },
            lockedDrugs: [],
            theme: 'theme-material',
            isTitrationToolCollapsed: false,
            breakthroughCalcPercent: 10,
            breakthroughCalcDrug: ''
        };
        
        this.listeners = {};
        this.initializeState();
    }

    /**
     * Initialize state from localStorage
     */
    initializeState() {
        try {
            // Load theme
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme) {
                this.state.theme = savedTheme;
            }

            // Load application state
            const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.state = { ...this.state, ...parsedState };
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
            this.initializeDefaultState();
        }
    }

    /**
     * Initialize default state
     */
    initializeDefaultState() {
        this.state.medications = [
            { key: '', dose: '' },
            { key: '', dose: '' },
            { key: '', dose: '' }
        ];
        
        this.state.breakthroughMedications = [
            { key: '', dose: '' }
        ];
        
        this.state.rotationBasalMedications = [];
        
        this.saveState();
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update state
     * @param {Object} updates - State updates
     */
    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            const stateToSave = {
                medications: this.state.medications,
                breakthroughMedications: this.state.breakthroughMedications,
                rotationBasalMedications: this.state.rotationBasalMedications,
                pinnedDrugKey: this.state.pinnedDrugKey,
                rotationMME: this.state.rotationMME,
                titrationMode: this.state.titrationMode,
                percentAdjustment: this.state.percentAdjustment,
                balancePair: this.state.balancePair,
                lockedDrugs: this.state.lockedDrugs,
                isTitrationToolCollapsed: this.state.isTitrationToolCollapsed,
                breakthroughCalcPercent: this.state.breakthroughCalcPercent,
                breakthroughCalcDrug: this.state.breakthroughCalcDrug
            };

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Failed to save state to localStorage:', error);
        }
    }

    /**
     * Save theme preference
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        this.state.theme = theme;
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error);
        }
        this.notifyListeners();
    }

    /**
     * Get theme
     * @returns {string} Current theme
     */
    getTheme() {
        return this.state.theme;
    }

    /**
     * Add medication
     * @param {Object} medication - Medication object
     */
    addMedication(medication) {
        this.state.medications.push(medication);
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Update medication
     * @param {number} index - Medication index
     * @param {Object} updates - Medication updates
     */
    updateMedication(index, updates) {
        if (this.state.medications[index]) {
            this.state.medications[index] = { ...this.state.medications[index], ...updates };
            this.saveState();
            this.notifyListeners();
        }
    }

    /**
     * Remove medication
     * @param {number} index - Medication index
     */
    removeMedication(index) {
        this.state.medications.splice(index, 1);
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Add breakthrough medication
     * @param {Object} medication - Breakthrough medication object
     */
    addBreakthroughMedication(medication) {
        this.state.breakthroughMedications.push(medication);
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Update breakthrough medication
     * @param {number} index - Medication index
     * @param {Object} updates - Medication updates
     */
    updateBreakthroughMedication(index, updates) {
        if (this.state.breakthroughMedications[index]) {
            this.state.breakthroughMedications[index] = { ...this.state.breakthroughMedications[index], ...updates };
            this.saveState();
            this.notifyListeners();
        }
    }

    /**
     * Remove breakthrough medication
     * @param {number} index - Medication index
     */
    removeBreakthroughMedication(index) {
        if (this.state.breakthroughMedications.length > 1) {
            this.state.breakthroughMedications.splice(index, 1);
        } else {
            this.state.breakthroughMedications[0] = { key: '', dose: '' };
        }
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Add rotation basal medication
     * @param {Object} medication - Rotation basal medication object
     */
    addRotationBasalMedication(medication) {
        this.state.rotationBasalMedications.push(medication);
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Update rotation basal medication
     * @param {number} index - Medication index
     * @param {Object} updates - Medication updates
     */
    updateRotationBasalMedication(index, updates) {
        if (this.state.rotationBasalMedications[index]) {
            this.state.rotationBasalMedications[index] = { ...this.state.rotationBasalMedications[index], ...updates };
            this.saveState();
            this.notifyListeners();
        }
    }

    /**
     * Remove rotation basal medication
     * @param {number} index - Medication index
     */
    removeRotationBasalMedication(index) {
        this.state.rotationBasalMedications.splice(index, 1);
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Set pinned drug
     * @param {string} drugKey - Drug key to pin
     */
    setPinnedDrug(drugKey) {
        this.state.pinnedDrugKey = drugKey;
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Toggle drug lock
     * @param {string} drugKey - Drug key to toggle lock
     */
    toggleDrugLock(drugKey) {
        const index = this.state.lockedDrugs.indexOf(drugKey);
        if (index > -1) {
            this.state.lockedDrugs.splice(index, 1);
        } else {
            this.state.lockedDrugs.push(drugKey);
        }
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Check if drug is locked
     * @param {string} drugKey - Drug key to check
     * @returns {boolean} True if locked
     */
    isDrugLocked(drugKey) {
        return this.state.lockedDrugs.includes(drugKey);
    }

    /**
     * Set titration mode
     * @param {string} mode - Titration mode ('prn', 'percent', 'balance')
     */
    setTitrationMode(mode) {
        this.state.titrationMode = mode;
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Set balance pair
     * @param {string} decreaseKey - Drug key to decrease
     * @param {string} increaseKey - Drug key to increase
     */
    setBalancePair(decreaseKey, increaseKey) {
        this.state.balancePair = { decreaseKey, increaseKey };
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Set rotation MME
     * @param {number} mme - MME value
     */
    setRotationMME(mme) {
        this.state.rotationMME = mme;
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Clear rotation MME
     */
    clearRotationMME() {
        this.state.rotationMME = null;
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Set percentage adjustment
     * @param {number} percentage - Percentage adjustment
     */
    setPercentageAdjustment(percentage) {
        this.state.percentAdjustment = percentage;
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Toggle titration tool collapse
     */
    toggleTitrationToolCollapse() {
        this.state.isTitrationToolCollapsed = !this.state.isTitrationToolCollapsed;
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Clear all data
     */
    clearAll() {
        this.initializeDefaultState();
        this.state.pinnedDrugKey = null;
        this.state.rotationMME = null;
        this.state.titrationMode = 'prn';
        this.state.percentAdjustment = 0;
        this.state.balancePair = { decreaseKey: null, increaseKey: null };
        this.state.lockedDrugs = [];
        this.state.breakthroughCalcPercent = 10;
        this.state.breakthroughCalcDrug = '';
        this.saveState();
        this.notifyListeners();
    }

    /**
     * Export state as JSON
     * @returns {string} State as JSON string
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state from JSON
     * @param {string} jsonString - JSON string to import
     * @returns {boolean} Success status
     */
    importState(jsonString) {
        try {
            const importedState = JSON.parse(jsonString);
            this.state = { ...this.state, ...importedState };
            this.saveState();
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }

    /**
     * Add state change listener
     * @param {string} key - Listener key
     * @param {Function} callback - Callback function
     */
    addListener(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    /**
     * Remove state change listener
     * @param {string} key - Listener key
     * @param {Function} callback - Callback function
     */
    removeListener(key, callback) {
        if (this.listeners[key]) {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        }
    }

    /**
     * Notify all listeners of state changes
     */
    notifyListeners() {
        Object.values(this.listeners).flat().forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }

    /**
     * Get state history (if implemented with more sophisticated storage)
     * @returns {Array} State history
     */
    getStateHistory() {
        // This could be implemented with IndexedDB for more sophisticated state management
        return [];
    }

    /**
     * Restore state from history
     * @param {number} index - History index
     */
    restoreFromHistory(index) {
        // This could be implemented with IndexedDB for more sophisticated state management
        console.warn('State history not implemented yet');
    }
}

// Create singleton instance
export const stateManager = new StateManager();