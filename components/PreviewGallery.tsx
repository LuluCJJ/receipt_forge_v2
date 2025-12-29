
import React, { useState, useRef, useEffect } from 'react';
import { BillData, Template } from '../types';
import { applyFormatter } from '../services/utils';
import { Download, LayoutPanelLeft } from 'lucide-react';

interface PreviewGalleryProps {
  templates: Template[];
  data: BillData[];
}

const PreviewCard: React.FC<{ template: Template; item: BillData; index: number }> = ({ template, item, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setScale(width / 800);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 flex flex-col">
      <div className="p-3 border-b border-slate-100 bg-white flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Record #{index + 1}</span>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{item.payee_name || 'No Name'}</span>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
          <Download size={16} />
        </button>
      </div>
      
      <div ref={containerRef} className="relative bg-white w-full overflow-hidden" style={{ aspectRatio: '800 / 400' }}>
        {/* Background Layer */}
        <img 
          src={template.backgroundImage} 
          alt="Bill" 
          className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />

        {/* Scaled Content Layer - EXACTLY 800x400 scaled down */}
        <div 
          className="absolute top-0 left-0 origin-top-left pointer-events-none" 
          style={{ width: '800px', height: '400px', transform: `scale(${scale})` }}
        >
          {/* Masking Layer (Solid White) */}
          {(template.masks || []).map(mask => (
            <div 
              key={mask.id}
              className="absolute bg-white"
              style={{
                left: mask.x,
                top: mask.y,
                width: mask.width,
                height: mask.height
              }}
            />
          ))}

          {/* Data Fields Layer */}
          {template.fields.map(field => {
            const rawValue = field.fieldKey === '__REMARK__' ? field.customValue : item[field.fieldKey];
            const displayValue = field.fieldKey === '__REMARK__' ? (field.customValue || '') : applyFormatter(rawValue, field.formatter);
            
            return (
              <div
                key={field.id}
                className="absolute"
                style={{
                  left: field.x,
                  top: field.y,
                  width: field.width,
                  fontSize: `${field.fontSize}px`,
                  fontWeight: field.fontWeight,
                  textAlign: field.textAlign as any,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.1,
                  color: '#111',
                  fontFamily: 'serif'
                }}
              >
                {displayValue}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PreviewGallery: React.FC<PreviewGalleryProps> = ({ templates, data }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  if (!activeTemplate) return <div className="p-12 text-center text-slate-400">No templates available.</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <LayoutPanelLeft className="text-purple-600" size={18} />
          <h2 className="font-bold text-slate-800 text-sm">Batch Review</h2>
          <select 
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="text-xs border rounded p-1 outline-none bg-slate-50"
          >
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase">{data.length} Records</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((item, idx) => (
            <PreviewCard key={item.id || idx} template={activeTemplate} item={item} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewGallery;
