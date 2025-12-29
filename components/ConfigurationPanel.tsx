
import React from 'react';
import { FieldConfig, FormatterType, TextAlign, Template, MaskConfig } from '../types';
import { DATA_FIELDS } from '../constants';
import { Settings, AlignLeft, AlignCenter, AlignRight, Type, Bold, Trash2, Save, Plus, Layers, Copy, ShieldOff } from 'lucide-react';

interface ConfigurationPanelProps {
  templates: Template[];
  currentTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onCreateTemplate: () => void;
  onDuplicateTemplate: (template: Template) => void;
  onDeleteTemplate: (id: string) => void;
  onDragStart: (e: React.DragEvent, key: string) => void;
  selectedField: FieldConfig | undefined;
  selectedMask: MaskConfig | undefined;
  onUpdateField: (id: string, updates: Partial<FieldConfig>) => void;
  onDeleteField: (id: string) => void;
  onDeleteMask: (id: string) => void;
  onAddMask: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  template: Template;
  onUpdateTemplate: (updates: Partial<Template>) => void;
  onSaveTemplate: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  templates,
  currentTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onDragStart,
  selectedField,
  selectedMask,
  onUpdateField,
  onDeleteField,
  onDeleteMask,
  onAddMask,
  onImageUpload,
  template,
  onUpdateTemplate,
  onSaveTemplate
}) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-lg z-20">
      
      <div className="p-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Layers size={16} className="text-blue-600" /> Templates
            </h3>
            <button onClick={onCreateTemplate} className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"><Plus size={14} /></button>
        </div>
        <div className="max-h-24 overflow-y-auto space-y-1 mb-2 pr-1 custom-scrollbar">
            {templates.map(t => (
                <div key={t.id} className={`group flex items-center justify-between p-1.5 rounded-md border text-xs cursor-pointer ${t.id === currentTemplateId ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`} onClick={() => onSelectTemplate(t.id)}>
                    <span className="truncate">{t.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={(e) => { e.stopPropagation(); onDuplicateTemplate(t); }} className="p-1 text-blue-600"><Copy size={10} /></button></div>
                </div>
            ))}
        </div>
      </div>

      <div className="p-4 border-b border-slate-100">
        <button onClick={onAddMask} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 py-2 rounded-md font-bold text-xs transition-all mb-3">
          <ShieldOff size={14} /> Add Security Mask (打码)
        </button>
        <div className="space-y-2">
          <input type="text" value={template.name} onChange={(e) => onUpdateTemplate({ name: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded outline-none" placeholder="Template Name" />
          <input type="file" accept="image/*" onChange={onImageUpload} className="block w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-700" />
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 flex-1 overflow-y-auto">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm"><Type size={16} className="text-indigo-600" /> Data Mapping</h3>
        <div className="grid grid-cols-1 gap-1.5">
          <div draggable onDragStart={(e) => onDragStart(e, '__REMARK__')} className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg cursor-grab hover:bg-indigo-100 text-[11px] font-bold text-indigo-700 flex items-center gap-2">
             <Plus size={12} /> Custom Remark (备注)
          </div>
          {DATA_FIELDS.map((field) => (
            <div key={field.key} draggable onDragStart={(e) => onDragStart(e, field.key)} className="p-2 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-300 text-[11px] flex items-center justify-between group">
              <span className="font-medium text-slate-700">{field.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 min-h-[220px]">
        {selectedField ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center"><h3 className="font-bold text-xs text-slate-800">Field Properties</h3><button onClick={() => onDeleteField(selectedField.id)} className="text-red-500"><Trash2 size={14} /></button></div>
            
            {selectedField.fieldKey === '__REMARK__' ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fixed Remark Text</label>
                <textarea 
                  value={selectedField.customValue || ''} 
                  onChange={(e) => onUpdateField(selectedField.id, { customValue: e.target.value })}
                  className="w-full p-2 text-xs border rounded h-16 resize-none outline-none focus:ring-1 ring-indigo-300"
                  placeholder="Type static text here..."
                />
              </div>
            ) : (
              <div className="bg-white p-2 rounded border border-slate-200"><span className="text-[10px] font-bold text-slate-400 uppercase block">Linked Data Key</span><span className="font-mono text-[10px] text-blue-600">{selectedField.fieldKey}</span></div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500">Font Size: {selectedField.fontSize}px</label>
                <input type="range" min="8" max="48" value={selectedField.fontSize} onChange={(e) => onUpdateField(selectedField.id, { fontSize: Number(e.target.value) })} className="w-full h-1 accent-blue-600" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Weight</label>
                <button onClick={() => onUpdateField(selectedField.id, { fontWeight: selectedField.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`w-full py-1 border rounded text-[10px] ${selectedField.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Bold</button>
              </div>
            </div>

            <div className="flex gap-1">
              {[TextAlign.LEFT, TextAlign.CENTER, TextAlign.RIGHT].map(align => (
                <button key={align} onClick={() => onUpdateField(selectedField.id, { textAlign: align })} className={`flex-1 py-1 flex justify-center rounded border ${selectedField.textAlign === align ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  {align === TextAlign.LEFT ? <AlignLeft size={12} /> : align === TextAlign.CENTER ? <AlignCenter size={12} /> : <AlignRight size={12} />}
                </button>
              ))}
            </div>

            {selectedField.fieldKey !== '__REMARK__' && (
              <select value={selectedField.formatter} onChange={(e) => onUpdateField(selectedField.id, { formatter: e.target.value as FormatterType })} className="w-full border text-[10px] p-1 rounded outline-none">
                <option value={FormatterType.NONE}>No Formatter</option>
                <option value={FormatterType.DIGIT_TO_CHINESE}>Amount (CN Uppercase)</option>
                <option value={FormatterType.DATE_FORMAT}>Date (Formatted)</option>
                <option value={FormatterType.DATE_TO_CHINESE}>Date (CN Uppercase)</option>
              </select>
            )}
          </div>
        ) : selectedMask ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-xs text-slate-800">Mask Properties</h3><button onClick={() => onDeleteMask(selectedMask.id)} className="text-red-500"><Trash2 size={14} /></button></div>
            <p className="text-[10px] text-slate-500">Use this to cover fixed text on the bill.</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-slate-400">Width:</span> {selectedMask.width}px</div>
              <div><span className="text-slate-400">Height:</span> {selectedMask.height}px</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl py-8">
            <Settings size={20} className="mb-2 opacity-20" />
            <p className="text-[10px]">Select an item to edit</p>
          </div>
        )}
      </div>
      <button onClick={onSaveTemplate} className="m-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-2 rounded font-bold text-xs shadow-lg transition-transform active:scale-95"><Save size={14} /> Save Template</button>
    </div>
  );
};

export default ConfigurationPanel;
