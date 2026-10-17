import React, { useState } from 'react';
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Store,
  DollarSign,
  QrCode,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_SETTINGS } from '../data/initialData';

export default function Settings({
  settings,
  setSettings,
  products,
  setProducts,
  sales,
  setSales,
  movements,
  setMovements,
  lang
}) {
  const isKh = lang === 'km';
  const [formData, setFormData] = useState({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Export all data to JSON
  const handleExportData = () => {
    const backup = {
      app: 'SmartStok',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: formData,
      products,
      sales,
      movements
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartStok-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          if (data.sales) setSales(data.sales);
          if (data.settings) {
            setSettings(data.settings);
            setFormData(data.settings);
          }
          if (data.movements) setMovements(data.movements);
          alert(isKh ? 'បញ្ចូលទិន្នន័យបម្រុងទុកជោគជ័យ!' : 'Data imported successfully!');
        } else {
          alert(isKh ? 'ឯកសារ JSON មិនត្រឹមត្រូវ!' : 'Invalid backup JSON file!');
        }
      } catch (err) {
        alert(isKh ? 'មានបញ្ហាក្នុងការអានឯកសារ!' : 'Error reading JSON file!');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default sample data
  const handleResetSampleData = () => {
    if (window.confirm(isKh ? 'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូដើមឡើងវិញមែនទេ? ទិន្នន័យថ្មីនឹងត្រូវបាត់បង់!' : 'Reset all data back to factory demo defaults?')) {
      setProducts(INITIAL_PRODUCTS);
      setSales(INITIAL_SALES);
      setSettings(INITIAL_SETTINGS);
      setFormData(INITIAL_SETTINGS);
      setMovements([]);
      alert(isKh ? 'បានកំណត់ទិន្នន័យគំរូរួចរាល់!' : 'Sample data restored!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {/* Vercel Deployment Guide Box */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ background: '#000000', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                ▲ <b>VERCEL READY</b>
              </div>
              <span className="badge-tag success">{isKh ? 'រៀបចំរួចរាល់ 100%' : '100% Configured'}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              {isKh ? 'របៀប Upload ដាក់ដំណើរការលើ Vercel' : 'How to Deploy to Vercel'}
            </h3>
            <p style={{ fontSize: '0.86rem', opacity: 0.85, lineHeight: 1.6 }}>
              {isKh
                ? 'គេហទំព័រនេះត្រូវបានបង្កើតឡើងជាមួយឯកសារ vercel.json និង Vite React រួចជាស្រេច។ លោកអ្នកគ្រាន់តែ Push ទៅកាន់ GitHub ហើយ Import ចូល Vercel ឬប្រើ Vercel CLI ដើម្បីដាក់ឱ្យប្រើប្រាស់ជាផ្លូវការទូទាំងពិភពលោក។'
                : 'Configured with vercel.json SPA rewrites. Simply push to GitHub and import into Vercel or run vercel in the terminal for instant deployment.'}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            1. git init && git add . && git commit -m "init SmartStok"
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            2. vercel --prod (ឬតាម GitHub)
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={22} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {isKh ? 'ព័ត៌មានហាង និងវិក្កយបត្រ' : 'Store & Receipt Information'}
              </h3>
            </div>

            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              <span>{isKh ? 'រក្សាទុកការកែប្រែ' : 'Save Changes'}</span>
            </button>
          </div>

          {isSaved && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-light)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{isKh ? 'ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!' : 'Settings successfully saved!'}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">{isKh ? 'ឈ្មោះហាង (ភាសាខ្មែរ)*' : 'Store Name (Khmer)*'}</label>
              <input
                type="text"
                className="input-field"
                value={formData.storeNameKh}
                onChange={(e) => setFormData({ ...formData, storeNameKh: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">{isKh ? 'ឈ្មោះហាង (English)' : 'Store Name (English)'}</label>
              <input
                type="text"
                className="input-field"
                value={formData.storeNameEn}
                onChange={(e) => setFormData({ ...formData, storeNameEn: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">{isKh ? 'លេខទូរស័ព្ទទាក់ទង' : 'Phone Numbers'}</label>
              <input
                type="text"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{isKh ? 'អត្រាប្តូរប្រាក់ 1 ដុល្លារ ($) ជាប្រាក់រៀល (៛)*' : 'Exchange Rate (1 USD to KHR)*'}</label>
              <input
                type="number"
                className="input-field"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: parseInt(e.target.value, 10) || 4100 })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{isKh ? 'អាសយដ្ឋានហាង' : 'Store Address'}</label>
            <input
              type="text"
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
            <div className="input-group">
              <label className="input-label">{isKh ? 'ឈ្មោះគណនី KHQR Bakong' : 'KHQR Merchant Name'}</label>
              <input
                type="text"
                className="input-field"
                value={formData.khqrMerchantName}
                onChange={(e) => setFormData({ ...formData, khqrMerchantName: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{isKh ? 'លេខសម្គាល់ Bakong ID' : 'Bakong Account ID'}</label>
              <input
                type="text"
                className="input-field"
                value={formData.khqrBakongId}
                onChange={(e) => setFormData({ ...formData, khqrBakongId: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{isKh ? 'សារអរគុណបាតវិក្កយបត្រ (ខ្មែរ)' : 'Receipt Footer Message (Khmer)'}</label>
            <input
              type="text"
              className="input-field"
              value={formData.receiptFooterKh}
              onChange={(e) => setFormData({ ...formData, receiptFooterKh: e.target.value })}
            />
          </div>
        </div>
      </form>

      {/* Data Backup & Management */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShieldCheck size={22} style={{ color: 'var(--success)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {isKh ? 'គ្រប់គ្រងទិន្នន័យ និងបម្រុងទុក (Data Backup & Restore)' : 'Data Backup & Restore'}
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          {isKh
            ? 'ទាញយកទិន្នន័យទំនិញ និងប្រវត្តិការលក់ទាំងអស់ទុកជាឯកសារ JSON ឬបញ្ចូលទិន្នន័យពីឯកសារចាស់មកវិញ។'
            : 'Export and download complete database to JSON backup or restore anytime.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
          {/* Export */}
          <button className="btn btn-secondary" onClick={handleExportData}>
            <Download size={18} />
            <span>{isKh ? 'ទាញយកឯកសារបម្រុងទុក (Export JSON)' : 'Export JSON Backup'}</span>
          </button>

          {/* Import */}
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={18} />
            <span>{isKh ? 'បញ្ចូលឯកសារទិន្នន័យ (Import JSON)' : 'Import JSON Backup'}</span>
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
          </label>

          {/* Reset */}
          <button className="btn btn-danger" onClick={handleResetSampleData} style={{ marginLeft: 'auto' }}>
            <RotateCcw size={18} />
            <span>{isKh ? 'កំណត់ទិន្នន័យគំរូដើមឡើងវិញ' : 'Restore Demo Defaults'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
