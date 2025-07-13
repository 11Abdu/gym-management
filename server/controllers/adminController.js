import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      where: { isActive: true },
      include: { createdBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admins', error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Create Admin Request Body:', req.body);
    const { name, email, password, role } = req.body;
    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }
    // Check if trying to create super admin when one already exists
    if (role === 'super_admin') {
      const existingSuperAdmin = await prisma.admin.findFirst({ where: { role: 'super_admin', isActive: true } });
      if (existingSuperAdmin) {
        return res.status(400).json({ success: false, message: 'Only one Super Admin is allowed in the system' });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        createdBy: req.admin?.id || null
      },
      include: { createdBy: { select: { name: true, email: true } } }
    });
    res.status(201).json({ success: true, message: 'Admin created successfully', data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create admin', error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: Number(req.params.id) } });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    // Prevent non-super admins from updating other admins
    if (req.admin.role !== 'super_admin' && req.admin.id !== admin.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }
    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== admin.email) {
      const existingAdmin = await prisma.admin.findUnique({ where: { email: req.body.email } });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
      }
    }
    // Prevent role changes for non-super admins
    if (req.body.role && req.admin.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can change roles' });
    }
    const data = { ...req.body };
    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete data.password;
    }
    const updated = await prisma.admin.update({ where: { id: admin.id }, data });
    res.status(200).json({ success: true, message: 'Admin updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update admin', error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: Number(req.params.id) } });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    // Prevent self-deletion
    if (req.admin.id === admin.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    // Prevent deletion of super admin by regular admin
    if (admin.role === 'super_admin' && req.admin.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin account' });
    }
    // Soft delete by setting isActive to false
    await prisma.admin.update({ where: { id: admin.id }, data: { isActive: false } });
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete admin', error: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [total, superAdmins, regularAdmins] = await Promise.all([
      prisma.admin.count({ where: { isActive: true } }),
      prisma.admin.count({ where: { role: 'super_admin', isActive: true } }),
      prisma.admin.count({ where: { role: 'admin', isActive: true } })
    ]);
    const result = { total, superAdmins, regularAdmins };
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};