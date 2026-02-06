/* eslint-disable @typescript-eslint/no-unused-vars */
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
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);

        const uploadStream = cloudinaryUploads.uploader.upload_stream(
          {
            folder: 'invoices',
            resource_type: 'image',
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

      /* =========================================================
         HELPERS & COLORS
      ========================================================= */
      const formatTk = (amount: number) => `${amount.toLocaleString()} tk`;

      const DARK_BLUE = '#0B3A67';
      const LIGHT_BLUE = '#EAF4F8';
      const ROW_BLUE = '#DCEFF6';
      const TEXT_COLOR = '#000000';
      const SOFT_GRAY = '#F4F6F8';

      /* =========================================================
         FOOTER (NOTE)
      ========================================================= */
      let drawingFooter = false;

      const drawFooter = (note?: string) => {
        if (drawingFooter) return;
        drawingFooter = true;

        const footerHeight = 48;
        const footerY = doc.page.height - footerHeight;

        // Footer background (always)
        doc.save();
        doc.rect(0, footerY, doc.page.width, footerHeight).fill(DARK_BLUE);
        doc.restore();

        // Footer text (only if note exists)
        if (note) {
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('white')
            .text(note, 50, footerY + 22, {
              width: doc.page.width - 100,
              align: 'left',
            });
        }

        drawingFooter = false;
      };

      doc.on('pageAdded', () => drawFooter(invoice.note));

      /* =========================================================
         HEADER
      ========================================================= */
      const drawHeader = () => {
        doc.rect(0, 0, doc.page.width, 90).fill(DARK_BLUE);

        doc
          .font('Helvetica-Bold')
          .fontSize(32)
          .fillColor('white')
          .text('INVOICE', 50, 30);

        doc
          .fontSize(10)
          .text('INVOICE NO', 350, 30)
          .text('ISSUE DATE', 350, 48);

        doc
          .font('Helvetica')
          .text(invoice.invoiceNo, 450, 30)
          .text(formatDate(invoice.invoiceDate), 450, 48);

        // FROM
        doc.font('Helvetica-Bold').fillColor(TEXT_COLOR).text('FROM', 50, 110);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text('Md. Aminul Islam', 50, 126)
          .text('Web Developer', 50, 140)
          .text('+880 1781-082064', 50, 154)
          .text('www.aminuldev.site', 50, 168);

        // BILL TO
        doc.font('Helvetica-Bold').text('BILL TO', 330, 110, {
          width: 215,
          align: 'right',
        });

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(invoice.payableTo.name, 330, 126, {
            width: 215,
            align: 'right',
          })
          .text(invoice.payableTo.phone || '', 330, 140, {
            width: 215,
            align: 'right',
          })
          .text(invoice.payableTo.address || '', 330, 154, {
            width: 215,
            align: 'right',
          });

        return 200;
      };

      /* =========================================================
         START
      ========================================================= */
      const startY = drawHeader();

      /* =========================================================
         ITEMS TABLE
      ========================================================= */
      const TABLE_X = 50;
      const TABLE_WIDTH = 495;
      const ROW_HEIGHT = 38;

      const COLUMNS = {
        description: { x: TABLE_X + 10, width: 235 },
        quantity: { x: TABLE_X + 255, width: 90 },
        price: { x: TABLE_X + 350, width: 65 },
        total: { x: TABLE_X + 420, width: 65 },
      };

      let y = startY + 40;

      doc.rect(TABLE_X, y, TABLE_WIDTH, ROW_HEIGHT).fill(DARK_BLUE);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('white');

      doc.text('ITEM DESCRIPTION', COLUMNS.description.x, y + 16);
      doc.text('QUANTITY', COLUMNS.quantity.x, y + 16, {
        width: COLUMNS.quantity.width,
        align: 'center',
      });
      doc.text('PRICE', COLUMNS.price.x, y + 16, {
        width: COLUMNS.price.width,
        align: 'center',
      });
      doc.text('TOTAL', COLUMNS.total.x, y + 16, {
        width: COLUMNS.total.width,
        align: 'center',
      });

      y += ROW_HEIGHT;

      invoice.items.forEach((item, index) => {
        doc
          .rect(TABLE_X, y, TABLE_WIDTH, ROW_HEIGHT)
          .fill(index % 2 === 0 ? LIGHT_BLUE : ROW_BLUE);

        doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR);

        doc.text(item.itemName, COLUMNS.description.x, y + 16);
        doc.text(String(item.quantity), COLUMNS.quantity.x, y + 16, {
          width: COLUMNS.quantity.width,
          align: 'center',
        });
        doc.text(formatTk(item.price), COLUMNS.price.x, y + 16, {
          width: COLUMNS.price.width,
          align: 'center',
        });
        doc.text(formatTk(item.total), COLUMNS.total.x, y + 16, {
          width: COLUMNS.total.width,
          align: 'center',
        });

        y += ROW_HEIGHT;
      });

      /* =========================================================
         TOTALS BOX
      ========================================================= */
      const totalBoxWidth = 230;
      const totalBoxX = TABLE_X + TABLE_WIDTH - totalBoxWidth;
      const totalBoxY = y + 20;

      doc.rect(totalBoxX, totalBoxY, totalBoxWidth, 120).fill(SOFT_GRAY);

      /* =========================================================
         STATUS SEAL
      ========================================================= */
      const drawSealLeftOfTotals = () => {
        const status = invoice.status;
        if (!status) return;

        const COLORS: Record<string, string> = {
          PAID: '#7DBA6D',
          PENDING: '#F0B429',
          UNPAID: '#D64545',
        };

        const text = status.toUpperCase();
        const color = COLORS[text] || '#999999';

        const sealCenterX = totalBoxX - 140;
        const sealCenterY = totalBoxY + 60;

        doc.save();
        doc.translate(sealCenterX, sealCenterY);
        doc.rotate(-20);
        doc.opacity(0.8);

        doc.font('Helvetica-Bold').fontSize(22);

        const textWidth = doc.widthOfString(text);
        const boxWidth = textWidth + 40;
        const boxHeight = 46;

        doc
          .lineWidth(3)
          .strokeColor(color)
          .roundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 6)
          .stroke();

        doc
          .lineWidth(1.5)
          .roundedRect(
            -boxWidth / 2 + 5,
            -boxHeight / 2 + 5,
            boxWidth - 10,
            boxHeight - 10,
            4,
          )
          .stroke();

        doc.fillColor(color).text(text, -boxWidth / 2, -7, {
          width: boxWidth,
          align: 'center',
        });

        doc.restore();
      };

      drawSealLeftOfTotals();

      /* =========================================================
         TOTAL TEXT
      ========================================================= */
      doc.font('Helvetica').fontSize(11).fillColor(TEXT_COLOR);

      doc.text('SUB TOTAL', totalBoxX + 10, totalBoxY + 15);
      doc.text(formatTk(invoice.subTotal), totalBoxX + 10, totalBoxY + 15, {
        width: 200,
        align: 'right',
      });

      doc.text('DISCOUNT', totalBoxX + 10, totalBoxY + 40);
      doc.text(formatTk(invoice.discount), totalBoxX + 10, totalBoxY + 40, {
        width: 200,
        align: 'right',
      });

      doc.text('Tax', totalBoxX + 10, totalBoxY + 65);
      doc.text(formatTk(invoice.tax), totalBoxX + 10, totalBoxY + 65, {
        width: 200,
        align: 'right',
      });

      doc.rect(totalBoxX, totalBoxY + 90, totalBoxWidth, 45).fill(DARK_BLUE);

      doc
        .font('Helvetica-Bold')
        .fillColor('white')
        .text('GRAND TOTAL', totalBoxX + 10, totalBoxY + 105)
        .text(formatTk(invoice.grandTotal), totalBoxX + 10, totalBoxY + 105, {
          width: 200,
          align: 'right',
        });

      /* =========================================================
         PAYMENT INFO (ADDED – SAFE)
      ========================================================= */
      const drawPaymentInfo = (startY: number) => {
        if (!invoice.paymentInfo) return startY;

        const boxX = 50;
        const boxWidth = 495;
        const boxHeight = 110;

        if (startY + boxHeight > doc.page.height - 80) {
          doc.addPage();
          startY = 100;
        }

        doc.rect(boxX, startY, boxWidth, boxHeight).fill(LIGHT_BLUE);

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(TEXT_COLOR)
          .text('PAYMENT INFORMATION', boxX + 10, startY + 10);

        doc
          .moveTo(boxX + boxWidth / 2, startY + 35)
          .lineTo(boxX + boxWidth / 2, startY + boxHeight - 10)
          .strokeColor('#B0CFE0')
          .stroke();

        // BKASH
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Bkash', boxX + 10, startY + 40);

        doc
          .font('Helvetica')
          .text('Number: 01781082064', boxX + 10, startY + 56)
          .text('Type: Personal', boxX + 10, startY + 70)
          .text(`Reference: ${invoice.invoiceNo}`, boxX + 10, startY + 84);

        // BANK
        const rightX = boxX + boxWidth / 2 + 50;

        doc.font('Helvetica-Bold').text('Bank', rightX, startY + 40);

        doc
          .font('Helvetica')
          .text('Bank Name: BRAC BANK PLC', rightX, startY + 56)
          .text('A/C Name: MD AMINUL ISLAM', rightX, startY + 70)
          .text('A/C No: 1054232850001', rightX, startY + 84);

        return startY + boxHeight + 20;
      };

      let nextY = totalBoxY + 150;
      nextY = drawPaymentInfo(nextY);

      /* =========================================================
         END
      ========================================================= */
      drawFooter(invoice.note);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
