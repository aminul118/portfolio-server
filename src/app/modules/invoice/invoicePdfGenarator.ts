import PDFDocument from 'pdfkit';
import streamifier from 'streamifier';
import { IInvoice } from './invoice.interface';
import { cloudinaryUploads } from '../../config/cloudinary.config';
import { formatDate } from '../../utils/formatter';

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

      /* ===== HELPERS ===== */
      const formatTk = (amount: number) => `${amount.toLocaleString()} tk`;

      /* ===== CONSTANTS ===== */
      const TABLE_X = 50;
      const TABLE_WIDTH = 495;
      const ROW_HEIGHT = 40;

      /* ===== COLORS ===== */
      const DARK_BLUE = '#0B3A67';
      const LIGHT_BLUE = '#EAF4F8';
      const ROW_BLUE = '#DCEFF6';
      const TEXT_BLUE = '#0A2F55';
      const SOFT_GRAY = '#F4F6F8';

      /* ===== STATUS SEAL ===== */
      const drawStatusSeal = (status: IInvoice['status']) => {
        let color = '#999999';

        if (status === 'PAID') color = '#2ECC71';
        if (status === 'UNPAID') color = '#E74C3C';
        if (status === 'PENDING') color = '#F39C12';

        doc.save();

        doc
          .rotate(-25, { origin: [300, 250] })
          .fontSize(72)
          .fillColor(color)
          .opacity(0.18)
          .text(status, 140, 220, {
            align: 'center',
            width: 350,
          });

        doc.restore();
      };

      /* ===== TABLE COLUMNS ===== */
      const COLUMNS = {
        description: { x: TABLE_X + 10, width: 235 },
        quantity: { x: TABLE_X + 255, width: 90 },
        price: { x: TABLE_X + 350, width: 65 },
        total: { x: TABLE_X + 420, width: 50 },
      };

      /* ===== FOOTER ===== */
      let drawingFooter = false;

      const drawFooter = (note?: string) => {
        if (drawingFooter) return;
        drawingFooter = true;

        const footerHeight = 48;
        const footerY = doc.page.height - footerHeight;

        doc.save();
        doc.rect(0, footerY, doc.page.width, footerHeight).fill(DARK_BLUE);
        doc.restore();

        if (note) {
          doc
            .fillColor('white')
            .fontSize(10)
            .text(note, 50, footerY + 16, {
              width: doc.page.width - 100,
              align: 'center',
            });
        }

        drawingFooter = false;
      };

      doc.on('pageAdded', () => drawFooter(invoice.note));

      /* ===== INVOICE TITLE ===== */
      doc.fontSize(38).fillColor(TEXT_BLUE).text('INVOICE', 50, 60);

      // 🔥 STATUS SEAL
      drawStatusSeal(invoice.status || 'PENDING');

      doc
        .fontSize(12)
        .fillColor(TEXT_BLUE)
        .text(`Invoice No: ${invoice.invoiceNo}`, 250, 65, {
          width: 300,
          align: 'right',
        })
        .text(`Date: ${formatDate(invoice.invoiceDate)}`, 250, 90, {
          width: 300,
          align: 'right',
        });

      /* ===== COMPANY INFO (LEFT) ===== */
      doc
        .fontSize(18)
        .fillColor(TEXT_BLUE)
        .text('AMINUL ', 50, 130, { continued: true })
        .fillColor('red')
        .text('ISLAM');

      doc
        .fillColor(TEXT_BLUE)
        .fontSize(11)
        .text('Web Developer', 50, 158)
        .text('Website: www.aminuldev.site', 50, 176)
        .text('Phone: 01781-082064', 50, 194);

      /* ===== PAYABLE TO (RIGHT) ===== */
      doc.fontSize(18).fillColor(TEXT_BLUE).text('PAYABLE TO', 330, 130, {
        width: 215,
        align: 'right',
      });

      doc
        .fontSize(12)
        .text(invoice.payableTo.name, 330, 158, {
          width: 215,
          align: 'right',
        })
        .text(invoice.payableTo.address || '', 330, 178, {
          width: 215,
          align: 'right',
        })
        .text(`Phone: ${invoice.payableTo.phone || ''}`, 330, 198, {
          width: 215,
          align: 'right',
        });

      /* ===== TABLE HEADER ===== */
      let y = 310;

      doc.rect(TABLE_X, y, TABLE_WIDTH, ROW_HEIGHT).fill(DARK_BLUE);

      doc
        .fillColor('white')
        .fontSize(11)
        .text('ITEM DESCRIPTION', COLUMNS.description.x, y + 12)
        .text('QUANTITY', COLUMNS.quantity.x, y + 12, {
          width: COLUMNS.quantity.width,
          align: 'center',
        })
        .text('PRICE', COLUMNS.price.x, y + 12, {
          width: COLUMNS.price.width,
          align: 'center',
        })
        .text('TOTAL', COLUMNS.total.x, y + 12, {
          width: COLUMNS.total.width,
          align: 'center',
        });

      y += ROW_HEIGHT;

      /* ===== TABLE ROWS ===== */
      invoice.items.forEach((item, index) => {
        doc
          .rect(TABLE_X, y, TABLE_WIDTH, ROW_HEIGHT)
          .fill(index % 2 === 0 ? LIGHT_BLUE : ROW_BLUE);

        doc
          .fillColor(TEXT_BLUE)
          .fontSize(10)
          .text(item.itemName, COLUMNS.description.x, y + 12)
          .text(item.quantity, COLUMNS.quantity.x, y + 12, {
            width: COLUMNS.quantity.width,
            align: 'center',
          })
          .text(formatTk(item.price), COLUMNS.price.x, y + 12, {
            width: COLUMNS.price.width,
            align: 'right',
          })
          .text(formatTk(item.total), COLUMNS.total.x, y + 12, {
            width: COLUMNS.total.width,
            align: 'right',
          });

        y += ROW_HEIGHT;
      });

      /* ===== TOTALS ===== */
      const totalBoxWidth = 230;
      const totalBoxX = TABLE_X + TABLE_WIDTH - totalBoxWidth;
      const totalY = y + 30;

      const VALUE_X = totalBoxX + 100;
      const VALUE_WIDTH = 120;

      doc.rect(totalBoxX, totalY, totalBoxWidth, 95).fill(SOFT_GRAY);

      doc.fillColor(TEXT_BLUE).fontSize(11);
      doc.text('SUB TOTAL', totalBoxX + 10, totalY + 18);
      doc.text(formatTk(invoice.subTotal), VALUE_X, totalY + 18, {
        width: VALUE_WIDTH,
        align: 'right',
      });

      doc.text('DISCOUNT', totalBoxX + 10, totalY + 48);
      doc.text(formatTk(invoice.discount), VALUE_X, totalY + 48, {
        width: VALUE_WIDTH,
        align: 'right',
      });

      doc.rect(totalBoxX, totalY + 95, totalBoxWidth, 65).fill(DARK_BLUE);

      doc.fillColor('white');
      doc.text('TAX (15%)', totalBoxX + 10, totalY + 115);
      doc.text(formatTk(invoice.tax || 0), VALUE_X, totalY + 115, {
        width: VALUE_WIDTH,
        align: 'right',
      });

      doc.text('GRAND TOTAL', totalBoxX + 10, totalY + 140);
      doc.text(formatTk(invoice.grandTotal), VALUE_X, totalY + 140, {
        width: VALUE_WIDTH,
        align: 'right',
      });

      drawFooter(invoice.note);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
