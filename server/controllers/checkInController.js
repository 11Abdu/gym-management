import { prisma } from '../config/database.js';
import { format } from 'date-fns';

export const getAllCheckIns = async (req, res) => {
  try {
    const { page = 1, limit = 50, date, memberId } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (date) where.date = date;
    if (memberId) where.memberId = memberId;
    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit)
      }),
      prisma.checkIn.count({ where })
    ]);
    res.status(200).json({ success: true, data: checkIns, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch check-ins', error: error.message });
  }
};

export const getCheckInsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const checkIns = await prisma.checkIn.findMany({ where: { date }, orderBy: { checkInTime: 'desc' } });
    res.status(200).json({ success: true, data: checkIns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch check-ins for date', error: error.message });
  }
};

export const getCheckInsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({ where: { memberId }, orderBy: { createdAt: 'desc' }, skip: Number(skip), take: Number(limit) }),
      prisma.checkIn.count({ where: { memberId } })
    ]);
    res.status(200).json({ success: true, data: checkIns, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch member check-ins', error: error.message });
  }
};

export const createCheckIn = async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Create CheckIn Request Body:', req.body);
    const { memberId } = req.body;
    const member = await prisma.member.findUnique({ where: { memberId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    const now = new Date();
    if (member.endDate && member.endDate < now) {
      return res.status(400).json({ success: false, message: 'Membership has expired', data: { member } });
    }
    const today = format(now, 'yyyy-MM-dd');
    const existingCheckIn = await prisma.checkIn.findFirst({ where: { memberId, date: today, checkOutTime: null } });
    if (existingCheckIn) {
      // Check out the member
      const checkedOut = await prisma.checkIn.update({ where: { id: existingCheckIn.id }, data: { checkOutTime: now } });
      await prisma.member.update({ where: { id: member.id }, data: { lastCheckIn: now } });
      return res.status(200).json({ success: true, message: 'Member checked out successfully', data: checkedOut, action: 'checkout' });
    } else {
      // Check in the member
      const checkIn = await prisma.checkIn.create({
        data: {
          memberId,
          memberName: `${member.firstName} ${member.lastName}`,
          checkInTime: now,
          date: today
        }
      });
      await prisma.member.update({ where: { id: member.id }, data: { lastCheckIn: now } });
      res.status(201).json({ success: true, message: 'Member checked in successfully', data: checkIn, action: 'checkin' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process check-in', error: error.message });
  }
};

export const updateCheckIn = async (req, res) => {
  try {
    const checkIn = await prisma.checkIn.findUnique({ where: { id: Number(req.params.id) } });
    if (!checkIn) {
      return res.status(404).json({ success: false, message: 'Check-in not found' });
    }
    const updated = await prisma.checkIn.update({ where: { id: checkIn.id }, data: { ...req.body } });
    res.status(200).json({ success: true, message: 'Check-in updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update check-in', error: error.message });
  }
};

export const getCheckInStats = async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [todayTotal, todayActive, weeklyStats] = await Promise.all([
      prisma.checkIn.count({ where: { date: today } }),
      prisma.checkIn.count({ where: { date: today, checkOutTime: null } }),
      prisma.checkIn.groupBy({
        by: ['date'],
        _count: { _all: true },
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { date: 'asc' }
      })
    ]);
    res.status(200).json({ success: true, data: { todayTotal, todayActive, weeklyStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch check-in stats', error: error.message });
  }
};