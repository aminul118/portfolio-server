import { Schema, model } from 'mongoose';
import { IInvoice } from './invoice.interface';

/* =========================================================
   ITEM SCHEMA
========================================================= */
const invoiceItemSchema = new Schema(
  {
    itemName: { type: String, required: true },
    quantity: { type: String, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

/* =========================================================
   PAYMENT INFO SCHEMA (OPTIONAL, EMBEDDED)
========================================================= */
const paymentInfoSchema = new Schema(
  {
    bkash: {
      number: { type: String },
      type: { type: String, default: 'Personal' },
    },
    bank: {
      bankName: { type: String },
      accountName: { type: String },
      accountNumber: { type: String },
    },
  },
  { _id: false },
);

/* =========================================================
   INVOICE SCHEMA
========================================================= */
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

    /* ================= PAYMENT ================= */
    paymentInfo: { type: Boolean, default: false },

    paymentMethod: {
      type: String,
      enum: ['Bank', 'Bkash', 'Cash'],
    },

    paymentDetails: paymentInfoSchema,

    /* ================= STATUS ================= */
    status: {
      type: String,
      enum: ['PAID', 'UNPAID', 'PENDING'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Invoice = model<IInvoice>('Invoice', invoiceSchema);

export { Invoice };
