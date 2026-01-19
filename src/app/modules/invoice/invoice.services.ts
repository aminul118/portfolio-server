import { deleteFileFromCloudinary } from '../../config/cloudinary.config';
import { QueryBuilder } from '../../utils/QueryBuilder';
import sendEmail from '../../utils/sendEmail';
import { invoiceSearchableField } from './invoice.constant';
import { IInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';
import { generateInvoicePDF } from './invoicePdfGenarator';

const generateInvoiceNo = () => `INV-${Date.now()}`;

const calculateTotals = (items: IInvoice['items'], discount = 0, tax = 0) => {
  const subTotal = items.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = subTotal - discount + tax;
  return { subTotal, grandTotal };
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

  const statusChanged =
    payload.status && payload.status !== existingInvoice.status;

  // Update invoice first
  Object.assign(existingInvoice, payload);
  await existingInvoice.save();

  // If status changed → regenerate PDF
  if (statusChanged) {
    // 1delete old pdf
    if (existingInvoice.pdfUrl) {
      await deleteFileFromCloudinary(existingInvoice.pdfUrl);
    }

    //  generate new pdf with updated status
    const newPdfUrl = await generateInvoicePDF(existingInvoice);

    // save new pdf url
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
