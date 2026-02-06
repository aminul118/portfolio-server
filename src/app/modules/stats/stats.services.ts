import { Invoice } from '../invoice/invoice.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';

const getAdminStats = async () => {
  const [userCount, projectCount, invoiceCount, totalEarningsAgg, totalDueAgg] =
    await Promise.all([
      User.estimatedDocumentCount(),
      Project.estimatedDocumentCount(),
      Invoice.estimatedDocumentCount(),

      // total earnings (all invoices)
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$grandTotal' },
          },
        },
      ]),

      // total due (only PENDING invoices)
      Invoice.aggregate([
        {
          $match: { status: 'PENDING' },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$grandTotal' },
          },
        },
      ]),
    ]);

  const data = {
    userCount,
    projectCount,
    invoice: {
      invoiceCount,
      totalEarnings: totalEarningsAgg[0]?.total - totalDueAgg[0]?.total || 0,
      totalDue: totalDueAgg[0]?.total || 0,
    },
  };

  return data;
};

export const statsServices = {
  getAdminStats,
};
