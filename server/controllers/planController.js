import { prisma } from '../config/database.js';

export const getAllPlans = async (req, res) => {
  try {
    const { active } = req.query;
    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    const plans = await prisma.plan.findMany({
      where,
      include: { createdBy: { select: { name: true, email: true } }, features: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans', error: error.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: Number(req.params.id) },
      include: { createdBy: { select: { name: true, email: true } }, features: true }
    });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plan', error: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Create Plan Request Body:', req.body);
    const { name, duration, price, features, isPopular, description } = req.body;
    // Check if plan name already exists
    const existingPlan = await prisma.plan.findUnique({ where: { name } });
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'Plan with this name already exists' });
    }
    // Create plan
    const plan = await prisma.plan.create({
      data: {
        name,
        duration: Number(duration),
        price: Number(price),
        isPopular: !!isPopular,
        description,
        createdById: req.admin?.id || null,
        features: {
          create: Array.isArray(features) ? features.map(f => ({ name: f })) : []
        }
      },
      include: { createdBy: { select: { name: true, email: true } }, features: true }
    });
    res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create plan', error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: Number(req.params.id) }, include: { features: true } });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    if (req.body.name && req.body.name !== plan.name) {
      const existingPlan = await prisma.plan.findUnique({ where: { name: req.body.name } });
      if (existingPlan) {
        return res.status(400).json({ success: false, message: 'Plan with this name already exists' });
      }
    }
    // Update features if provided
    let featuresUpdate = {};
    if (Array.isArray(req.body.features)) {
      // Delete old features and add new
      await prisma.feature.deleteMany({ where: { planId: plan.id } });
      featuresUpdate = {
        features: {
          create: req.body.features.map(f => ({ name: f }))
        }
      };
    }
    const updated = await prisma.plan.update({
      where: { id: plan.id },
      data: {
        ...req.body,
        ...featuresUpdate
      },
      include: { createdBy: { select: { name: true, email: true } }, features: true }
    });
    res.status(200).json({ success: true, message: 'Plan updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update plan', error: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: Number(req.params.id) } });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    await prisma.plan.delete({ where: { id: plan.id } });
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete plan', error: error.message });
  }
};

export const togglePlanStatus = async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: Number(req.params.id) } });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    const updated = await prisma.plan.update({ where: { id: plan.id }, data: { isActive: !plan.isActive } });
    res.status(200).json({ success: true, message: `Plan ${updated.isActive ? 'activated' : 'deactivated'} successfully`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle plan status', error: error.message });
  }
};