import { Schema, model } from 'mongoose';
import { IInvoice } from './invoice.interface';

const invoiceItemSchema = new Schema(
  {
    itemName: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNo: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    payableTo: {
      name: { type: String, required: true },
      address: { type: String },
      phone: { type: String },
    },
    items: { type: [invoiceItemSchema], required: true },
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    pdfUrl: { type: String },
    note: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Invoice = model<IInvoice>('Invoice', invoiceSchema);

export { Invoice };
