/* =========================================================
   INVOICE ITEM
========================================================= */
export interface IInvoiceItem {
  itemName: string;
  quantity: string;
  price: number;
  total: number;
}

/* =========================================================
   PAYABLE TO
========================================================= */
export interface IPayableTo {
  name: string;
  address?: string;
  phone?: string;
}

/* =========================================================
   PAYMENT DETAILS (OPTIONAL, STRUCTURED)
========================================================= */
export interface IBkashInfo {
  number?: string;
  type?: 'Personal' | 'Agent' | 'Merchant';
}

export interface IBankInfo {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface IPaymentDetails {
  bkash?: IBkashInfo;
  bank?: IBankInfo;
}

/* =========================================================
   INVOICE
========================================================= */
export interface IInvoice {
  invoiceNo: string;
  invoiceDate: Date;
  payableTo: IPayableTo;
  items: IInvoiceItem[];
  subTotal: number;
  discount: number;
  tax: number;
  grandTotal: number;

  pdfUrl?: string;
  note?: string;

  /* ================= PAYMENT ================= */
  paymentInfo?: boolean;

  paymentMethod?: 'Bank' | 'Bkash' | 'Cash';

  paymentDetails?: IPaymentDetails;

  /* ================= STATUS ================= */
  status: 'PAID' | 'UNPAID' | 'PENDING';
}
