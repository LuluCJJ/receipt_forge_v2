
import React, { useEffect, useRef, useState } from 'react';
import { FieldConfig, MaskConfig, FormatterType, TextAlign } from '../types';
import { DATA_FIELDS } from '../constants';

interface CanvasEditorProps {
  backgroundImage: string;
  fields: FieldConfig[];
  masks: MaskConfig[];
  onFieldsChange: (fields: FieldConfig[]) => void;
  onMasksChange: (masks: MaskConfig[]) => void;
  selectedFieldId: string | null;
  selectedMaskId: string | null;
  onSelectField: (id: string | null) => void;
  onSelectMask: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<FieldConfig>) => void;
  onUpdateMask: (id: string, updates: Partial<MaskConfig>) => void;
  onAddField: (fieldKey: string, x: number, y: number) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  backgroundImage,
  fields,
  masks = [],
  onFieldsChange,
  onMasksChange,
  selectedFieldId,
  selectedMaskId,
  onSelectField,
  onSelectMask,
  onUpdateField,
  onUpdateMask,
  onAddField
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const onSelectFieldRef = useRef(onSelectField);
  const onSelectMaskRef = useRef(onSelectMask);
  const onUpdateFieldRef = useRef(onUpdateField);
  const onUpdateMaskRef = useRef(onUpdateMask);

  useEffect(() => { onSelectFieldRef.current = onSelectField; }, [onSelectField]);
  useEffect(() => { onSelectMaskRef.current = onSelectMask; }, [onSelectMask]);
  useEffect(() => { onUpdateFieldRef.current = onUpdateField; }, [onUpdateField]);
  useEffect(() => { onUpdateMaskRef.current = onUpdateMask; }, [onUpdateMask]);

  useEffect(() => {
    if (!canvasRef.current || !window.fabric) return;

    const canvas = new window.fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 400,
      backgroundColor: '#f3f4f6',
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Custom rendering for identification labels
    canvas.on('after:render', (opt: any) => {
      const ctx = opt.ctx;
      canvas.getObjects().forEach((obj: any) => {
        if (!obj.data) return;
        
        const isField = obj.data.type === 'field';
        const isMask = obj.data.type === 'mask';
        if (!isField && !isMask) return;

        const isActive = canvas.getActiveObject() === obj;
        const label = obj.data.label || 'Unknown';
        
        // Draw Label Tag
        ctx.save();
        const bound = obj.getBoundingRect();
        const padding = 4;
        ctx.font = '10px sans-serif';
        const textWidth = ctx.measureText(label).width;
        
        // Background for label
        ctx.fillStyle = isActive ? (isField ? '#2563eb' : '#ef4444') : 'rgba(0,0,0,0.5)';
        ctx.fillRect(bound.left, bound.top - 18, textWidth + (padding * 2), 16);
        
        // Text for label
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, bound.left + padding, bound.top - 6);
        
        // Enhanced border for selection
        if (isActive) {
            ctx.strokeStyle = isField ? '#2563eb' : '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(bound.left, bound.top, bound.width, bound.height);
        }
        
        ctx.restore();
      });
    });

    canvas.on('selection:created', (e: any) => {
      const obj = e.selected?.[0];
      if (obj?.data?.type === 'field') {
        onSelectFieldRef.current(obj.data.id);
        onSelectMaskRef.current(null);
      } else if (obj?.data?.type === 'mask') {
        onSelectMaskRef.current(obj.data.id);
        onSelectFieldRef.current(null);
      }
    });

    canvas.on('selection:updated', (e: any) => {
      const obj = e.selected?.[0];
      if (obj?.data?.type === 'field') {
        onSelectFieldRef.current(obj.data.id);
        onSelectMaskRef.current(null);
      } else if (obj?.data?.type === 'mask') {
        onSelectMaskRef.current(obj.data.id);
        onSelectFieldRef.current(null);
      }
    });

    canvas.on('selection:cleared', () => {
      onSelectFieldRef.current(null);
      onSelectMaskRef.current(null);
    });

    canvas.on('object:modified', (e: any) => {
      const obj = e.target;
      if (!obj || !obj.data?.id) return;
      
      if (obj.data.type === 'field') {
        onUpdateFieldRef.current(obj.data.id, {
          x: Math.round(obj.left),
          y: Math.round(obj.top),
          width: Math.round(obj.getScaledWidth()),
        });
      } else if (obj.data.type === 'mask') {
        onUpdateMaskRef.current(obj.data.id, {
          x: Math.round(obj.left),
          y: Math.round(obj.top),
          width: Math.round(obj.getScaledWidth()),
          height: Math.round(obj.getScaledHeight()),
        });
      }
    });

    setIsReady(true);
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    if (!fabricRef.current || !backgroundImage) return;
    window.fabric.Image.fromURL(backgroundImage, (img: any) => {
      if (!img) return;
      img.scaleToWidth(800);
      fabricRef.current.setBackgroundImage(img, fabricRef.current.renderAll.bind(fabricRef.current));
    }, { crossOrigin: 'anonymous' });
  }, [backgroundImage]);

  useEffect(() => {
    if (!fabricRef.current || !isReady) return;
    const canvas = fabricRef.current;
    const activeObject = canvas.getActiveObject();

    // 1. Manage Masks
    const currentMaskObjects = canvas.getObjects().filter((o: any) => o.data?.type === 'mask');
    currentMaskObjects.forEach((obj: any) => {
      if (!masks.find(m => m.id === obj.data.id)) canvas.remove(obj);
    });

    masks.forEach(mask => {
      let obj = canvas.getObjects().find((o: any) => o.data?.id === mask.id);
      if (obj) {
        if (activeObject !== obj) {
          obj.set({ left: mask.x, top: mask.y, width: mask.width, height: mask.height, scaleX: 1, scaleY: 1 });
          obj.setCoords();
        }
        obj.set({ data: { ...obj.data, label: 'SECURITY MASK' } });
      } else {
        const rect = new window.fabric.Rect({
          left: mask.x,
          top: mask.y,
          width: mask.width,
          height: mask.height,
          fill: 'rgba(255, 255, 255, 0.5)',
          stroke: '#ef4444',
          strokeDashArray: [5, 5],
          data: { id: mask.id, type: 'mask', label: 'SECURITY MASK' }
        });
        canvas.add(rect);
      }
    });

    // 2. Manage Fields
    const currentFieldObjects = canvas.getObjects().filter((o: any) => o.data?.type === 'field');
    currentFieldObjects.forEach((obj: any) => {
      if (!fields.find(f => f.id === obj.data.id)) canvas.remove(obj);
    });

    fields.forEach(field => {
      let obj = canvas.getObjects().find((o: any) => o.data?.id === field.id);
      const fieldLabel = field.fieldKey === '__REMARK__' ? (field.customValue || 'REMARK') : (DATA_FIELDS.find(df => df.key === field.fieldKey)?.label || field.fieldKey);
      const text = field.fieldKey === '__REMARK__' ? fieldLabel : `{${fieldLabel}}`;

      if (obj) {
        if (activeObject !== obj) {
          obj.set({ left: field.x, top: field.y, width: field.width, scaleX: 1, scaleY: 1 });
        }
        obj.set({ fontSize: field.fontSize, fontWeight: field.fontWeight, textAlign: field.textAlign, text: text });
        obj.set({ data: { ...obj.data, label: fieldLabel } });
        obj.setCoords();
      } else {
        const textbox = new window.fabric.Textbox(text, {
          left: field.x,
          top: field.y,
          width: field.width,
          fontSize: field.fontSize,
          fontWeight: field.fontWeight,
          textAlign: field.textAlign,
          fill: '#333',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: '#2563eb',
          data: { id: field.id, type: 'field', label: fieldLabel },
          splitByGrapheme: true,
        });
        canvas.add(textbox);
      }
    });

    canvas.requestRenderAll();
  }, [fields, masks, isReady]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldKey = e.dataTransfer.getData('fieldKey');
    if (!fieldKey || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    onAddField(fieldKey, x, y);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex justify-center items-center bg-gray-300 overflow-auto p-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="shadow-2xl bg-white border-4 border-white pointer-events-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default CanvasEditor;
