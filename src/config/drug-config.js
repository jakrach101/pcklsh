/**
 * Drug Configuration Data
 * Contains all drug definitions with their conversion factors and clinical information
 */

export const DRUG_CONFIG = {
    'fentanyl_patch': { 
        name: 'Fentanyl Patch', 
        factor: 2.4, unit: 'mcg/hr', type: 'patch', isBasal: true, step: 12.5,
        info: `<p><strong>Onset:</strong> 12-24 ชั่วโมง, ออกฤทธิ์เต็มที่ 72 ชั่วโมง</p><p><strong>ข้อควรระวัง:</strong></p><ul class="list-disc list-inside pl-4"><li>ไม่เหมาะสำหรับแก้ปวดเฉียบพลัน (Acute Pain) หรือในผู้ป่วยที่ยังปรับยาไม่คงที่</li><li>ไข้สูง (Fever > 40°C) อาจเพิ่มการดูดซึมยาได้ถึง 1/3</li><li>แนะนำให้ทิ้งแผ่นแปะที่ใช้แล้วอย่างถูกวิธี (พับด้านกาวเข้าหากัน)</li><li>เป็นตัวเลือกที่ดีในผู้ป่วยไตวายรุนแรง (Severe Renal Impairment)</li></ul>`
    },
    'mst_10': { 
        name: 'MST 10mg', 
        factor: 1, unit: 'เม็ด/day', type: 'oral', isBasal: true, strength: 10, step: 1,
        info: `<p><strong>Onset:</strong> ~1 ชั่วโมง, ออกฤทธิ์นาน 8-12 ชั่วโมง</p><p><strong>ข้อควรระวัง:</strong></p><ul class="list-disc list-inside pl-4"><li>ห้ามหัก แบ่ง หรือเคี้ยวยาเม็ด</li><li>ควรระวังการใช้ในผู้ป่วยไตวาย (eGFR < 30 ml/min) เนื่องจาก Metabolites (M3G, M6G) อาจสะสมและเกิดพิษได้</li></ul>`
    },
    'mst_30': { 
        name: 'MST 30mg', 
        factor: 1, unit: 'เม็ด/day', type: 'oral', isBasal: true, strength: 30, step: 1,
        info: `<p><strong>Onset:</strong> ~1 ชั่วโมง, ออกฤทธิ์นาน 8-12 ชั่วโมง</p><p><strong>ข้อควรระวัง:</strong></p><ul class="list-disc list-inside pl-4"><li>ห้ามหัก แบ่ง หรือเคี้ยวยาเม็ด</li><li>ควรระวังการใช้ในผู้ป่วยไตวาย (eGFR < 30 ml/min) เนื่องจาก Metabolites (M3G, M6G) อาจสะสมและเกิดพิษได้</li></ul>`
    },
    'kapanol_20': { 
        name: 'Kapanol 20mg', 
        factor: 1, unit: 'แคปซูล/day', type: 'oral', isBasal: true, strength: 20, step: 1,
        info: `<p><strong>Onset:</strong> ~1 ชั่วโมง, ออกฤทธิ์นาน 12-24 ชั่วโมง</p><p><strong>ข้อควรระวัง:</strong></p><ul class="list-disc list-inside pl-4"><li>ห้ามเคี้ยวเม็ด Granules ข้างใน แต่สามารถเปิดแคปซูลแล้วโรยบนอาหารเหลวได้ (สำหรับผู้ป่วยมีปัญหาการกลืน)</li><li>ควรระวังการใช้ในผู้ป่วยไตวาย (eGFR < 30 ml/min) เช่นเดียวกับ MST</li></ul>`
    },
    'morphine_iv_sc': { 
        name: 'Morphine IV/SC', 
        factor: 3, unit: 'mg/day', type: 'injectable', isBasal: true, isBreakthrough: true,
        info: `<p><strong>Onset:</strong> IV ~5 นาที, SC ~15-30 นาที</p><p><strong>ข้อควรระวัง:</strong></p><ul class="list-disc list-inside pl-4"><li>ใช้สำหรับผู้ป่วยที่มีอาการปวดรุนแรง หรือไม่สามารถรับประทานยาได้</li><li>ต้องปรับลดขนาดยาในผู้ป่วยไตวาย (eGFR < 30 ml/min) และติดตามอาการข้างเคียงอย่างใกล้ชิด</li></ul>`
    },
    'fentanyl_iv_sc': { 
        name: 'Fentanyl IV/SC', 
        factor: 0.3, unit: 'mcg/day', type: 'injectable', isBasal: true, isBreakthrough: true,
        info: `<p><strong>Onset:</strong> IV ~1-2 นาที, ออกฤทธิ์สั้น (30-60 นาที)</p><p><strong>ข้อดี:</strong></p><ul class="list-disc list-inside pl-4"><li>เป็นตัวเลือกที่ปลอดภัยในผู้ป่วยไตวายรุนแรง (Severe Renal Impairment)</li><li>เหมาะสำหรับ Titrate อาการปวดที่รุนแรงและต้องการการตอบสนองที่รวดเร็ว</li></ul>`
    },
    'morphine_ir_tab_10': { 
        name: 'Morphine IR 10mg', 
        factor: 1, unit: 'เม็ด/day', type: 'oral', isBreakthrough: true, strength: 10, step: 1,
        info: `<p><strong>Onset:</strong> 30-60 นาที, ออกฤทธิ์นาน 4-6 ชั่วโมง</p><p><strong>การใช้งาน:</strong></p><ul class="list-disc list-inside pl-4"><li>ใช้สำหรับบรรเทาอาการปวดกำเริบ (Breakthrough Pain)</li><li>ขนาดยาที่ใช้通常คิดเป็น 10-15% ของขนาดยาหลักต่อวัน (Total Daily Dose)</li></ul>`
    },
    'morphine_syrup': { 
        name: 'Morphine Syrup 2mg/ml', 
        factor: 1, unit: 'mL/day', type: 'oral', isBreakthrough: true, strength: 2,
        info: `<p><strong>Onset:</strong> 30-60 นาที, ออกฤทธิ์นาน 4-6 ชั่วโมง</p><p><strong>การใช้งาน:</strong></p><ul class="list-disc list-inside pl-4"><li>ใช้สำหรับบรรเทาอาการปวดกำเริบ (Breakthrough Pain) โดยเฉพาะในผู้ป่วยที่มีปัญหาการกลืน</li><li>ง่ายต่อการปรับขนาดยา (Titration) ทีละน้อย</li></ul>`
    },
};

export const ROTATION_DRUGS = {
    'fentanyl_patch': { name: 'Fentanyl Patch', factor: 2.4, unit: 'mcg/hr', allowedDoses: [12.5, 25, 50, 75, 100] },
    'morphine_sr': { 
        name: 'Morphine SR', factor: 1, unit: 'mg/day',
        prescriptionHelper: {
            strengths: [
                { name: 'MST 30mg', value: 30, unit: 'เม็ด' },
                { name: 'Kapanol 20mg', value: 20, unit: 'แคปซูล' },
                { name: 'MST 10mg', value: 10, unit: 'เม็ด' }
            ]
        }
    },
    'morphine_iv_infusion': { name: 'Morphine (IV Infusion)', factor: 3, unit: 'mg/day', helper: 'iv_infusion', drugInfo: { name: 'Morphine', concentration: 10, unit: 'mg/ml' } },
    'fentanyl_iv_infusion': { name: 'Fentanyl (IV Infusion)', factor: 0.3, unit: 'mcg/day', helper: 'iv_infusion', drugInfo: { name: 'Fentanyl', concentration: 50, unit: 'mcg/ml' } },
    'morphine_csci': { name: 'Morphine (CSCI)', factor: 3, unit: 'mg/day', helper: 'csci', drugInfo: { name: 'Morphine', concentration: 10, unit: 'mg/ml' } },
    'fentanyl_csci': { name: 'Fentanyl (CSCI)', factor: 0.3, unit: 'mcg/day', helper: 'csci', drugInfo: { name: 'Fentanyl', concentration: 50, unit: 'mcg/ml' } },
};

export const SYRINGE_DATA = { 
    'BD': { 
        20: { length: 88.0 }, 
        30: { length: 87.5 }, 
        50: { length: 123.0 } 
    } 
};

export const LOCAL_STORAGE_KEY = 'opioidCalculatorData_v10';
export const THEME_KEY = 'opioidCalculatorTheme_v10';

// Clinical safety and reference data
export const CLINICAL_PEARLS = {
    prnRecommendation: {
        minPercent: 10,
        maxPercent: 15,
        defaultPercent: 10
    },
    rotationReduction: {
        standard: 0.25, // 25% reduction
        conservative: 0.5 // 50% reduction
    },
    monitoringIntervals: {
        standard: '24-48 ชั่วโมง',
        intensive: '4-6 ชั่วโมง'
    }
};

// Quick reference MME equivalents
export const MME_REFERENCE = {
    morphine: { oral: 1, iv: 3, sc: 3 },
    fentanyl: { patch: 2.4, iv: 0.3, sc: 0.3 },
    oxycodone: { oral: 1.5 },
    hydromorphone: { oral: 4, iv: 20 },
    methadone: { oral: 'variable' }
};