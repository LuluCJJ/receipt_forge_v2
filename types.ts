
export enum FormatterType {
  NONE = 'None',
  DIGIT_TO_CHINESE = 'DigitToChinese',
  DATE_FORMAT = 'DateFormat',
  DATE_TO_CHINESE = 'DateToChinese',
  AUTO_LINE_BREAK = 'AutoLineBreak',
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export interface FieldConfig {
  id: string; // Internal unique ID for the canvas object
  fieldKey: string; // The data key (e.g., 'payment_amt') or '__REMARK__'
  customValue?: string; // Static text if fieldKey is '__REMARK__'
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontWeight: string | number;
  textAlign: TextAlign;
  formatter: FormatterType;
}

export interface MaskConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Template {
  id: string;
  name: string;
  backgroundImage: string;
  fields: FieldConfig[];
  masks: MaskConfig[]; // New: Masking layer
  width: number;
  height: number;
  updatedAt: number;
}

export interface BillData {
  id: number | string;
  [key: string]: any;
}

// Extend Window interface for Fabric
declare global {
  interface Window {
    fabric: any;
  }
}
