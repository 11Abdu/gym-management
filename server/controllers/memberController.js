import { prisma } from '../config/database.js';
import { addMonths, format } from 'date-fns';

export const getAllMembers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit)
      }),
      prisma.member.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { id: Number(req.params.id) } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch member', error: error.message });
  }
};

export const getMemberByMemberId = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { memberId: req.params.memberId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch member', error: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Create Member Request Body:', req.body);
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      membershipDuration,
      membershipPlan,
      membershipPrice,
      startDate,
      photo,
      notes
    } = req.body;

    // Check if email already exists
    const existingMember = await prisma.member.findUnique({ where: { email } });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'Member with this email already exists' });
    }

    // Generate unique member ID
    const generateMemberId = () => {
      const timestamp = Date.now().toString().slice(-6);
      return `GYM${timestamp}`;
    };
    let memberId = generateMemberId();
    let memberIdExists = await prisma.member.findUnique({ where: { memberId } });
    while (memberIdExists) {
      memberId = generateMemberId();
      memberIdExists = await prisma.member.findUnique({ where: { memberId } });
    }

    const start = new Date(startDate);
    const endDate = addMonths(start, membershipDuration);

    const member = await prisma.member.create({
      data: {
        memberId,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        membershipDuration,
        membershipPlan,
        membershipPrice,
        startDate: start,
        endDate,
        qrCode: memberId,
        joinDate: start,
        photo,
        notes
      }
    });
    // Log the created member for debugging
    console.log('Created Member:', member);

    res.status(201).json({ success: true, message: 'Member created successfully', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create member', error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { id: Number(req.params.id) } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    const data = { ...req.body };
    if (req.body.startDate || req.body.membershipDuration) {
      const start = new Date(req.body.startDate || member.startDate);
      data.endDate = addMonths(start, req.body.membershipDuration || member.membershipDuration);
    }
    const updated = await prisma.member.update({ where: { id: Number(req.params.id) }, data });
    res.status(200).json({ success: true, message: 'Member updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update member', error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { id: Number(req.params.id) } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    await prisma.member.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete member', error: error.message });
  }
};

export const getMemberStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const [total, active, expiring, expired] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'active', endDate: { gte: now } } }),
      prisma.member.count({ where: { status: 'active', endDate: { gte: now, lte: thirtyDaysFromNow } } }),
      prisma.member.count({ where: { endDate: { lt: now } } })
    ]);
    const result = { total, active, expiring, expired };
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch member stats', error: error.message });
  }
};