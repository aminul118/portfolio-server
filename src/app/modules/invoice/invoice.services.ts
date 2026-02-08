/* eslint-disable @typescript-eslint/no-explicit-any */
import { deleteFileFromCloudinary } from '../../config/cloudinary.config';
import { QueryBuilder } from '../../utils/QueryBuilder';
import sendEmail from '../../utils/sendEmail';
import { invoiceSearchableField } from './invoice.constant';
import { IInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';
import { generateInvoicePDF } from './invoicePdfGenarator';

const generateInvoiceNo = () => `INV-${Date.now()}`;

const calculateTotals = (items: IInvoice['items'], discount = 0, tax = 0) => {
  const subTotal = items.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const grandTotal = subTotal - (Number(discount) || 0) + (Number(tax) || 0);
  return { subTotal, grandTotal };
};

//  If any of these fields are in payload, regenerate PDF (safe + simple)
const shouldRegeneratePdf = (payload: Partial<IInvoice>) => {
  const keys: (keyof IInvoice)[] = [
    'payableTo',
    'items',
    'discount',
    'tax',
    'note',
    'paymentInfo',
    'paymentMethod',
    'paymentDetails',
    'status',
  ];

  return keys.some((k) => payload[k] !== undefined);
};

const createInvoice = async (payload: IInvoice) => {
  const { items, discount, tax } = payload;
  const invoiceNo = generateInvoiceNo();
  const { subTotal, grandTotal } = calculateTotals(items, discount, tax);

  const invoice = await Invoice.create({
    ...payload,
    invoiceNo,
    invoiceDate: new Date(),
    subTotal,
    grandTotal,
  });

  const pdfUrl = await generateInvoicePDF(invoice);
  invoice.pdfUrl = pdfUrl;
  await invoice.save();

  return invoice;
};

const updateInvoice = async (id: string, payload: Partial<IInvoice>) => {
  const existingInvoice = await Invoice.findById(id);
  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  //  Block these fields from client updates
  delete (payload as any).invoiceNo;
  delete (payload as any).pdfUrl;
  delete (payload as any).subTotal;
  delete (payload as any).grandTotal;

  // Decide whether PDF needs regeneration BEFORE we mutate too much
  const regeneratePdf = shouldRegeneratePdf(payload);

  //  If PAID: auto remove payment info + set date + clear note
  if (payload.status === 'PAID') {
    payload.paymentInfo = false;
    payload.paymentMethod = undefined;
    payload.paymentDetails = undefined;
    payload.invoiceDate = new Date();
  }

  // Recalculate totals if items/discount/tax changed (or keep existing)
  const nextItems = payload.items ?? existingInvoice.items;
  const nextDiscount =
    payload.discount !== undefined
      ? payload.discount
      : existingInvoice.discount;
  const nextTax = payload.tax !== undefined ? payload.tax : existingInvoice.tax;

  const { subTotal, grandTotal } = calculateTotals(
    nextItems,
    nextDiscount,
    nextTax,
  );

  // Apply payload
  Object.assign(existingInvoice, payload);

  // Always keep totals consistent
  existingInvoice.subTotal = subTotal;
  existingInvoice.grandTotal = grandTotal;

  await existingInvoice.save();

  //  Regenerate PDF if any important fields changed
  if (regeneratePdf) {
    if (existingInvoice.pdfUrl) {
      await deleteFileFromCloudinary(existingInvoice.pdfUrl);
    }

    const newPdfUrl = await generateInvoicePDF(existingInvoice);
    existingInvoice.pdfUrl = newPdfUrl;
    await existingInvoice.save();
  }

  return existingInvoice;
};

const sendInvoiceToUser = async (email: string, id: string) => {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (!invoice.pdfUrl) {
    throw new Error('Invoice PDF not generated');
  }

  const {
    invoiceNo,
    invoiceDate,
    payableTo,
    subTotal,
    discount,
    tax,
    grandTotal,
    pdfUrl,
  } = invoice;

  await sendEmail({
    to: email,
    subject: `Invoice ${invoiceNo}`,
    templateName: 'invoice-voucher',
    templateData: {
      invoiceNo,
      invoiceDate,
      payableTo,
      subTotal,
      discount,
      tax,
      grandTotal,
      pdfUrl,
    },
  });

  return invoice;
};

const getAllInvoice = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Invoice.find(), query);

  const invoices = await queryBuilder
    .search(invoiceSearchableField)
    .filter()
    .fields()
    .paginate()
    .sort();

  const [data, meta] = await Promise.all([
    invoices.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleInvoice = async (id: string) => {
  const result = await Invoice.findById(id);
  return result;
};

const deleteSingleInvoice = async (id: string) => {
  const exists = await Invoice.findById(id);

  if (exists?.pdfUrl) {
    await deleteFileFromCloudinary(exists.pdfUrl);
  }

  const result = await Invoice.findByIdAndDelete(id);
  return result;
};

export const InvoiceService = {
  createInvoice,
  getAllInvoice,
  getSingleInvoice,
  deleteSingleInvoice,
  sendInvoiceToUser,
  updateInvoice,
};
