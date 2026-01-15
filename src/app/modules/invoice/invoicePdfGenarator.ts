import PDFDocument from 'pdfkit';
import streamifier from 'streamifier';
import { IInvoice } from './invoice.interface';
import { cloudinaryUploads } from '../../config/cloudinary.config';

export const generateInvoicePDF = async (
  invoice: IInvoice,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);

        const uploadStream = cloudinaryUploads.uploader.upload_stream(
          {
            folder: 'invoices',
            resource_type: 'image',
            type: 'upload',
            public_id: invoice.invoiceNo,
            format: 'pdf',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url as string);
          },
        );

        streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
      });

      /* ===== COLORS ===== */
      const DARK_BLUE = '#0B3A67';
      const LIGHT_BLUE = '#EAF4F8';
      const ROW_BLUE = '#DCEFF6';
      const TEXT_BLUE = '#0A2F55';
      const SOFT_GRAY = '#F4F6F8';

      /* ===== HEADER ===== */
      doc
        .fontSize(16)
        .fillColor(TEXT_BLUE)
        .text('AMINUL ', 50, 50, { continued: true })
        .fillColor('red')
        .text('ISLAM');

      doc.fontSize(10).fillColor(TEXT_BLUE).text('Web developer', 50, 70);
      doc.fontSize(38).fillColor(TEXT_BLUE).text('INVOICE', 50, 120);

      doc
        .fontSize(11)
        .text(`Invoice No: ${invoice.invoiceNo}`, 360, 130, {
          width: 180,
          align: 'right',
          lineBreak: false,
        })
        .text(
          `Date: ${new Date(invoice.invoiceDate).toDateString()}`,
          360,
          150,
          { width: 180, align: 'right', lineBreak: false },
        );

      /* ===== PAYABLE TO ===== */
      doc.fontSize(13).text('PAYABLE TO', 50, 200);
      doc
        .fontSize(11)
        .text(invoice.payableTo.name, 50, 225)
        .text(invoice.payableTo.address || '', 50, 242)
        .text(`Phone: ${invoice.payableTo.phone || ''}`, 50, 260);

      /* ===== TABLE ===== */
      const tableTop = 300;
      const rowHeight = 34;

      doc.rect(50, tableTop, 495, rowHeight).fill(DARK_BLUE);

      doc
        .fillColor('white')
        .fontSize(11)
        .text('ITEM DESCRIPTION', 55, tableTop + 10)
        .text('QUANTITY', 255, tableTop + 10)
        .text('PRICE', 345, tableTop + 10)
        .text('TOTAL', 435, tableTop + 10);

      let y = tableTop + rowHeight;

      invoice.items.forEach((item, index) => {
        doc
          .rect(50, y, 495, rowHeight)
          .fill(index % 2 === 0 ? LIGHT_BLUE : ROW_BLUE);

        doc
          .fillColor(TEXT_BLUE)
          .fontSize(10)
          .text(item.itemName, 55, y + 10, { width: 180 })
          .text(item.quantity, 255, y + 10)
          .text(item.price.toLocaleString(), 345, y + 10, {
            width: 70,
            align: 'right',
            lineBreak: false,
          })
          .text(item.total.toLocaleString(), 435, y + 10, {
            width: 70,
            align: 'right',
            lineBreak: false,
          });

        y += rowHeight;
      });

      /* ===== TOTALS (SHIFTED LEFT, A4 SAFE) ===== */
      const MIN_TOTAL_Y = 480;
      const totalY = Math.max(y + 40, MIN_TOTAL_Y);

      const totalBoxX = 270;
      const totalBoxWidth = 230;

      // light box
      doc.rect(totalBoxX, totalY, totalBoxWidth, 95).fill(SOFT_GRAY);

      doc
        .fillColor(TEXT_BLUE)
        .fontSize(11)
        .text('SUB TOTAL', totalBoxX + 10, totalY + 18)
        .text('DISCOUNT', totalBoxX + 10, totalY + 48);

      doc.text(
        invoice.subTotal.toLocaleString(),
        totalBoxX + 160,
        totalY + 18,
        {
          width: 60,
          align: 'right',
          lineBreak: false,
        },
      );

      doc.text(
        invoice.discount.toLocaleString(),
        totalBoxX + 160,
        totalY + 48,
        {
          width: 60,
          align: 'right',
          lineBreak: false,
        },
      );

      // dark bar
      doc.rect(totalBoxX, totalY + 95, totalBoxWidth, 65).fill(DARK_BLUE);

      doc
        .fillColor('white')
        .fontSize(11)
        .text('TAX BDT', totalBoxX + 10, totalY + 115)
        .text('GRAND TOTAL BDT', totalBoxX, totalY + 140);

      doc.text(
        (invoice.tax || 0).toFixed(2) + ' tk',
        totalBoxX + 160,
        totalY + 115,
        {
          width: 60,
          align: 'right',
          lineBreak: false,
        },
      );

      doc.text(
        `${invoice.grandTotal.toLocaleString()} tk`,
        totalBoxX + 160,
        totalY + 140,
        {
          width: 80,
          align: 'right',
          lineBreak: false,
        },
      );

      /* ===== FOOTER (NO BLUE BAR) ===== */
      const footerY = doc.page.height - 90;

      doc
        .fillColor(TEXT_BLUE)
        .fontSize(10)
        .text('www.aminuldev.site', 50, footerY)
        .text('01781082064', 400, footerY);

      if (invoice.note) {
        doc.fontSize(9).text(invoice.note, 50, footerY + 20, { width: 495 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
