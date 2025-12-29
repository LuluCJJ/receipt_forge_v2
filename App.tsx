
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layout, Printer, Database, Play, Save } from 'lucide-react';
import CanvasEditor from './components/CanvasEditor';
import ConfigurationPanel from './components/ConfigurationPanel';
import DataSimulator from './components/DataSimulator';
import PreviewGallery from './components/PreviewGallery';
import { Template, FieldConfig, BillData, MaskConfig, FormatterType, TextAlign } from './types';
import { DEFAULT_MOCK_DATA } from './constants';
import { generateCheckTemplateBase64 } from './services/utils';

enum Tab {
  CONFIG = 'config',
  DATA = 'data',
  PREVIEW = 'preview'
}

const STORAGE_KEY = 'billprint_templates_v2';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CONFIG);
  const defaultBg = useMemo(() => generateCheckTemplateBase64(800, 400), []);

  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return [{
      id: 'default-1',
      name: 'Check Template V1',
      backgroundImage: defaultBg,
      fields: [],
      masks: [],
      width: 800,
      height: 400,
      updatedAt: Date.now()
    }];
  });

  const [currentTemplateId, setCurrentTemplateId] = useState<string>(templates[0].id);
  const currentTemplate = useMemo(() => templates.find(t => t.id === currentTemplateId) || templates[0], [templates, currentTemplateId]);
  
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
  const [data, setData] = useState<BillData[]>(DEFAULT_MOCK_DATA);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const handleUpdateTemplate = useCallback((updates: Partial<Template>) => {
    setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { ...t, ...updates, updatedAt: Date.now() } : t));
  }, [currentTemplateId]);

  const handleUpdateField = useCallback((id: string, updates: Partial<FieldConfig>) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== currentTemplateId) return t;
      return { ...t, fields: t.fields.map(f => f.id === id ? { ...f, ...updates } : f) };
    }));
  }, [currentTemplateId]);

  const handleDeleteField = useCallback((id: string) => {
    setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { ...t, fields: t.fields.filter(f => f.id !== id) } : t));
    if (selectedFieldId === id) setSelectedFieldId(null);
  }, [currentTemplateId, selectedFieldId]);

  const handleUpdateMask = useCallback((id: string, updates: Partial<MaskConfig>) => {
    setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { ...t, masks: (t.masks || []).map(m => m.id === id ? { ...m, ...updates } : m) } : t));
  }, [currentTemplateId]);

  const handleAddMask = () => {
    const newMask: MaskConfig = { id: `mask-${Date.now()}`, x: 50, y: 50, width: 100, height: 40, color: '#fff' };
    setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { ...t, masks: [...(t.masks || []), newMask] } : t));
    setSelectedMaskId(newMask.id);
    setSelectedFieldId(null);
  };

  const handleDeleteMask = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { ...t, masks: (t.masks || []).filter(m => m.id !== id) } : t));
    if (selectedMaskId === id) setSelectedMaskId(null);
  };

  const handleAddField = useCallback((fieldKey: string, x: number, y: number) => {
    const newField: FieldConfig = {
      id: `f-${Date.now()}`,
      fieldKey,
      customValue: fieldKey === '__REMARK__' ? 'Remark Text' : '',
      x,
      y,
      width: 150,
      fontSize: 16,
      fontWeight: 'normal',
      textAlign: TextAlign.LEFT,
      formatter: FormatterType.NONE,
    };
    setTemplates(prev => prev.map(t => t.id === currentTemplateId ? { ...t, fields: [...t.fields, newField] } : t));
    setSelectedFieldId(newField.id);
    setSelectedMaskId(null);
  }, [currentTemplateId]);

  const handleDragStart = (e: React.DragEvent, key: string) => {
    e.dataTransfer.setData('fieldKey', key);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) handleUpdateTemplate({ backgroundImage: evt.target!.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentSelectedField = currentTemplate.fields.find(f => f.id === selectedFieldId);
  const currentSelectedMask = (currentTemplate.masks || []).find(m => m.id === selectedMaskId);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white"><Printer size={18} /></div>
          <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">BillPrint <span className="text-blue-600">Studio</span></h1>
        </div>

        <nav className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button onClick={() => setActiveTab(Tab.CONFIG)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === Tab.CONFIG ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Design</button>
          <button onClick={() => setActiveTab(Tab.DATA)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === Tab.DATA ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Data</button>
          <button onClick={() => setActiveTab(Tab.PREVIEW)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === Tab.PREVIEW ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}>Preview</button>
        </nav>

        <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">BP</div></div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 flex transition-all duration-300 ${activeTab === Tab.CONFIG ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
           <ConfigurationPanel 
              templates={templates} currentTemplateId={currentTemplateId} onSelectTemplate={setCurrentTemplateId}
              onCreateTemplate={() => {
                const newId = `t-${Date.now()}`;
                setTemplates([...templates, { id: newId, name: 'New Template', backgroundImage: defaultBg, fields: [], masks: [], width: 800, height: 400, updatedAt: Date.now() }]);
                setCurrentTemplateId(newId);
              }}
              onDuplicateTemplate={(t) => {
                const newId = `t-${Date.now()}`;
                setTemplates([...templates, { ...t, id: newId, name: `${t.name} (Copy)` }]);
                setCurrentTemplateId(newId);
              }}
              onDeleteTemplate={(id) => {
                if (templates.length <= 1) return;
                const filtered = templates.filter(t => t.id !== id);
                setTemplates(filtered);
                if (currentTemplateId === id) setCurrentTemplateId(filtered[0].id);
              }}
              onDragStart={handleDragStart} selectedField={currentSelectedField} selectedMask={currentSelectedMask}
              onUpdateField={handleUpdateField} onDeleteField={handleDeleteField} onDeleteMask={handleDeleteMask}
              onAddMask={handleAddMask} onImageUpload={handleImageUpload} template={currentTemplate}
              onUpdateTemplate={handleUpdateTemplate} onSaveTemplate={() => alert('Saved!')}
           />
           <div className="flex-1 relative bg-slate-300 overflow-hidden">
              <CanvasEditor 
                backgroundImage={currentTemplate.backgroundImage} fields={currentTemplate.fields} masks={currentTemplate.masks || []}
                onFieldsChange={(fields) => handleUpdateTemplate({ fields })} onMasksChange={(masks) => handleUpdateTemplate({ masks })}
                selectedFieldId={selectedFieldId} selectedMaskId={selectedMaskId} onSelectField={setSelectedFieldId} onSelectMask={setSelectedMaskId}
                onUpdateField={handleUpdateField} onUpdateMask={handleUpdateMask}
                onAddField={handleAddField}
              />
           </div>
        </div>

        <div className={`absolute inset-0 p-8 bg-slate-100 transition-all duration-300 ${activeTab === Tab.DATA ? 'translate-x-0 opacity-100' : activeTab === Tab.CONFIG ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'}`}>
           <div className="max-w-4xl mx-auto h-full"><DataSimulator data={data} onDataChange={setData} /></div>
        </div>

        <div className={`absolute inset-0 transition-all duration-300 ${activeTab === Tab.PREVIEW ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
           <PreviewGallery templates={templates} data={data} />
        </div>
      </main>
    </div>
  );
};

export default App;
