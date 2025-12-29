
import { FormatterType } from '../types';

const CHINESE_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];

/**
 * Converts a number to Chinese currency uppercase.
 */
export const digitToChineseCurrency = (n: number): string => {
  if (n === undefined || n === null) return '';
  
  const fraction = ['角', '分'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];

  const head = n < 0 ? '欠' : '';
  n = Math.abs(n);

  let s = '';

  for (let i = 0; i < fraction.length; i++) {
    s += (
      CHINESE_DIGITS[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]
    ).replace(/零./, '');
  }
  s = s || '整';
  n = Math.floor(n);

  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = CHINESE_DIGITS[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return (
    head +
    s
      .replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整')
  );
};

/**
 * Converts YYYY-MM-DD to Chinese uppercase date.
 * Financial style: 2023 -> 贰零贰叁, 10 -> 壹拾, 01 -> 零壹
 */
export const dateToChinese = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const year = d.getFullYear().toString();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Year: Digit by digit
  const yearCn = year.split('').map(digit => CHINESE_DIGITS[parseInt(digit)]).join('');

  // Month: 1-9 prefixed with 零, 10 is 壹拾
  let monthCn = '';
  if (month < 10) monthCn = '零' + CHINESE_DIGITS[month];
  else if (month === 10) monthCn = '壹拾';
  else monthCn = '壹拾' + CHINESE_DIGITS[month % 10];

  // Day: 1-9 prefixed with 零, 10, 20, 30 prefixed with 零 or 壹拾/贰拾/叁拾
  let dayCn = '';
  if (day < 10) dayCn = '零' + CHINESE_DIGITS[day];
  else if (day === 10) dayCn = '壹拾';
  else if (day === 20) dayCn = '贰拾';
  else if (day === 30) dayCn = '叁拾';
  else {
    const tens = Math.floor(day / 10);
    const units = day % 10;
    dayCn = (tens === 1 ? '壹拾' : CHINESE_DIGITS[tens] + '拾') + CHINESE_DIGITS[units];
  }

  return `${yearCn}年${monthCn}月${dayCn}日`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${(d.getMonth() + 1).toString().padStart(2, '0')}月${d.getDate().toString().padStart(2, '0')}日`;
};

export const applyFormatter = (value: any, formatter: FormatterType): string => {
  switch (formatter) {
    case FormatterType.DIGIT_TO_CHINESE:
      return digitToChineseCurrency(Number(value));
    case FormatterType.DATE_FORMAT:
      return formatDate(String(value));
    case FormatterType.DATE_TO_CHINESE:
      return dateToChinese(String(value));
    case FormatterType.AUTO_LINE_BREAK:
      return String(value);
    case FormatterType.NONE:
    default:
      return String(value);
  }
};

export const generateCheckTemplateBase64 = (width = 800, height = 400): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#fffdf5';
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = '#f3e5cf';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for(let i=0; i<width; i+=15) { ctx.moveTo(i,0); ctx.lineTo(i,height); }
  ctx.stroke();

  const pad = 20;
  const primaryColor = '#d66';
  
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, width - pad*2, height - pad*2);
  
  ctx.lineWidth = 1;
  ctx.strokeRect(pad + 5, pad + 5, width - pad*2 - 10, height - pad*2 - 10);

  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 32px serif';
  ctx.textAlign = 'center';
  ctx.fillText('支    票', width / 2, 70);
  
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#333';
  ctx.fillText('No. 00000000', 40, 60);

  ctx.fillStyle = primaryColor;
  ctx.font = '16px serif';
  ctx.fillText('出票日期:', 500, 70);
  
  ctx.beginPath();
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1;
  ctx.moveTo(580, 70); ctx.lineTo(620, 70); ctx.fillText('年', 625, 70);
  ctx.moveTo(650, 70); ctx.lineTo(680, 70); ctx.fillText('月', 685, 70);
  ctx.moveTo(710, 70); ctx.lineTo(740, 70); ctx.fillText('日', 745, 70);
  ctx.stroke();

  const startX = 60;
  const labelWidth = 110;
  const lineStart = startX + labelWidth;
  const lineEnd = width - 60;
  
  const yPayee = 140;
  ctx.textAlign = 'left';
  ctx.fillText('收款人全称:', startX, yPayee);
  ctx.beginPath();
  ctx.moveTo(lineStart, yPayee);
  ctx.lineTo(lineEnd, yPayee);
  ctx.stroke();

  const yAmountWords = 210;
  ctx.fillText('人民币(大写):', startX, yAmountWords);
  ctx.beginPath();
  ctx.moveTo(lineStart + 10, yAmountWords);
  ctx.lineTo(lineEnd, yAmountWords);
  ctx.stroke();
  
  const yRow3 = 280;
  ctx.fillText('用        途:', startX, yRow3);
  ctx.beginPath();
  ctx.moveTo(lineStart, yRow3);
  ctx.lineTo(450, yRow3);
  ctx.stroke();

  ctx.fillText('人民币(小写):', 480, yRow3);
  ctx.fillText('¥', 600, yRow3);
  ctx.strokeRect(620, yRow3 - 22, 120, 30);
  
  const yFooter = 340;
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('出票人账号: ____________________________', startX, yFooter);
  ctx.fillText('付款行名称: ____________________________', 450, yFooter);

  return canvas.toDataURL('image/png');
};
