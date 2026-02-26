const Parent = require('../models/Parent');

const getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate({
        path: 'children',
        select: 'name admissionNo grade sectionName fatherName fatherOccupation fatherEmail fatherPhone motherName motherOccupation motherEmail motherPhone',
      })
      .populate({
        path: 'userId',
        select: 'status email name',
      });

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const fullName = `${parent.firstName || ''} ${parent.lastName || ''}`.trim();

    res.json({
      ...parent.toObject(),
      status: parent.userId?.status || 'UNKNOWN',
      fullName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listParents = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const q = String(req.query.q || '').trim();
    const status = String(req.query.status || '').trim().toUpperCase();

    const parentMatch = {};
    if (q) {
      parentMatch.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const pipeline = [
      { $match: parentMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'studentprofiles',
          localField: 'children',
          foreignField: '_id',
          as: 'childrenInfo',
        },
      },
      {
        $addFields: {
          status: { $ifNull: ['$user.status', 'UNKNOWN'] },
          fullName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ['$firstName', ''] },
                  ' ',
                  { $ifNull: ['$lastName', ''] },
                ],
              },
            },
          },
          childrenCount: { $size: { $ifNull: ['$children', []] } },
        },
      },
    ];

    if (status && status !== 'ALL') {
      pipeline.push({ $match: { status } });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          items: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                userId: 1,
                firstName: 1,
                lastName: 1,
                fullName: 1,
                email: 1,
                phone: 1,
                relation: 1,
                occupation: 1,
                emergencyContact: 1,
                children: 1,
                childrenCount: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                childrenInfo: {
                  $map: {
                    input: '$childrenInfo',
                    as: 'child',
                    in: {
                      _id: '$$child._id',
                      name: '$$child.name',
                      admissionNo: '$$child.admissionNo',
                      grade: '$$child.grade',
                      sectionName: '$$child.sectionName',
                      fatherName: '$$child.fatherName',
                      fatherOccupation: '$$child.fatherOccupation',
                      fatherEmail: '$$child.fatherEmail',
                      fatherPhone: '$$child.fatherPhone',
                      motherName: '$$child.motherName',
                      motherOccupation: '$$child.motherOccupation',
                      motherEmail: '$$child.motherEmail',
                      motherPhone: '$$child.motherPhone',
                    },
                  },
                },
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      }
    );

    const result = await Parent.aggregate(pipeline);
    const items = result?.[0]?.items || [];
    const total = result?.[0]?.total?.[0]?.count || 0;

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listParents,
  getParentById,
};
