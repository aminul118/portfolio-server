import { Blog } from '../blog/blog.model';
import { Invoice } from '../invoice/invoice.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';

const getAdminStats = async () => {
  const [
    userCount,
    projectCount,
    blogCount,
    invoiceCount,
    totalEarningsAgg,
    totalDueAgg,
    statusCountsAgg,
  ] = await Promise.all([
    User.estimatedDocumentCount(),
    Project.estimatedDocumentCount(),
    Blog.estimatedDocumentCount(),
    Invoice.estimatedDocumentCount(),

    // total earnings (PAID invoices)
    Invoice.aggregate([
      {
        $match: { status: 'PAID' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' },
        },
      },
    ]),

    // total due (PENDING or UNPAID invoices)
    Invoice.aggregate([
      {
        $match: { status: { $in: ['PENDING', 'UNPAID'] } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' },
        },
      },
    ]),

    // status distribution
    Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Format status counts into a cleaner object
  const statusDistribution = statusCountsAgg.reduce(
    (acc: Record<string, number>, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    },
    { PAID: 0, UNPAID: 0, PENDING: 0 },
  );

  const data = {
    userCount,
    projectCount,
    blogCount,
    invoice: {
      totalCount: invoiceCount,
      totalEarnings: totalEarningsAgg[0]?.total || 0,
      totalDue: totalDueAgg[0]?.total || 0,
      statusDistribution,
    },
  };

  return data;
};

export const statsServices = {
  getAdminStats,
};
