
import { BillData } from './types';

export const DEFAULT_MOCK_DATA: BillData[] = [
  { 
    id: 1, 
    payee_name: "Hangzhou Future Tech Co., Ltd.", 
    payment_amt: 12500.50, 
    date: "2023-10-27",
    date_year: "2023",
    date_month: "10",
    date_day: "27",
    cash_amt: 10000.00,
    purchase_amt: 2500.50,
    other_amt: 0.00,
    bank_account: "6222 0000 1234 5678",
    usage: "Consulting Fee"
  },
  { 
    id: 2, 
    payee_name: "Shanghai Global Trade House", 
    payment_amt: 500000.00, 
    date: "2023-11-15",
    date_year: "2023",
    date_month: "11",
    date_day: "15",
    cash_amt: 450000.00,
    purchase_amt: 50000.00,
    other_amt: 0.00,
    bank_account: "9558 8000 8888 1111",
    usage: "Procurement Payment"
  }
];

export const DATA_FIELDS = [
  { label: 'Payee Name (收款人)', key: 'payee_name' },
  { label: 'Amount (总金额)', key: 'payment_amt' },
  { label: 'Date (日期-全)', key: 'date' },
  { label: 'Date Year (年)', key: 'date_year' },
  { label: 'Date Month (月)', key: 'date_month' },
  { label: 'Date Day (日)', key: 'date_day' },
  { label: 'Cash Amt (现汇金额)', key: 'cash_amt' },
  { label: 'Purchase Amt (购汇金额)', key: 'purchase_amt' },
  { label: 'Other Amt (其他金额)', key: 'other_amt' },
  { label: 'Account No. (账号)', key: 'bank_account' },
  { label: 'Usage (用途)', key: 'usage' },
];
