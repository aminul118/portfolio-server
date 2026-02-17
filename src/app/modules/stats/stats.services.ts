import { Blog } from '../blog/blog.model';
import { Invoice } from '../invoice/invoice.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';
import { IsActive } from '../user/user.interface';

const getAdminStats = async () => {
  const [
    userCount,
    projectCount,
    blogCount,
    invoiceCount,
    totalEarningsAgg,
    totalDueAgg,
    statusCountsAgg,
    userStatusAgg,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
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
        $group: { _id: '$status', count: { $sum: 1 } },
      },
    ]),

    // user status distribution
    User.aggregate([
      {
        $facet: {
          statusCounts: [
            {
              $match: { isDeleted: false },
            },
            {
              $group: {
                _id: '$isActive',
                count: { $sum: 1 },
              },
            },
          ],
          deletedCount: [
            {
              $match: { isDeleted: true },
            },
            {
              $count: 'count',
            },
          ],
        },
      },
    ]),
  ]);

  // Format status counts into a cleaner object
  const statusDistribution = statusCountsAgg.reduce(
    (acc: Record<string, number>, curr: { _id: string; count: number }) => {
      acc[curr._id] = curr.count;
      return acc;
    },
    { PAID: 0, UNPAID: 0, PENDING: 0 },
  );

  // Format user status counts
  const userStats = userStatusAgg[0];
  const userStatusDistribution = userStats.statusCounts.reduce(
    (acc: Record<string, number>, curr: { _id: IsActive; count: number }) => {
      acc[curr._id] = curr.count;
      return acc;
    },
    { ACTIVE: 0, INACTIVE: 0, BLOCKED: 0 },
  );

  const data = {
    user: {
      totalCount: userCount,
      activeCount: userStatusDistribution.ACTIVE,
      inactiveCount: userStatusDistribution.INACTIVE,
      blockedCount: userStatusDistribution.BLOCKED,
      deletedCount: userStats.deletedCount[0]?.count || 0,
    },
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
