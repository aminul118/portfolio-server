export interface IInvoiceItem {
  itemName: string;
  quantity: string;
  price: number;
  total: number;
}

export interface IPayableTo {
  name: string;
  address?: string;
  phone?: string;
}

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
  status: 'PAID' | 'UNPAID' | 'PENDING';
}
