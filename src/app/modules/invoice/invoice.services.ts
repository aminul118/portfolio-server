import { QueryBuilder } from '../../utils/QueryBuilder';
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
  const invoiceNo = generateInvoiceNo();
  const { subTotal, grandTotal } = calculateTotals(
    payload.items,
    payload.discount,
    payload.tax,
  );

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

const getAllInvoice = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Invoice.find(), query);

  const invoices = await queryBuilder
    .search(['invoiceNo', 'payableTo.name'])
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
  const result = await Invoice.findByIdAndDelete(id);
  return result;
};

export const InvoiceService = {
  createInvoice,
  getAllInvoice,
  getSingleInvoice,
  deleteSingleInvoice,
};
