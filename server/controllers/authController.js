import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gym_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await prisma.admin.findFirst({ where: { email, isActive: true } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Generate token
    const token = generateToken(admin.id);

    // Remove password from response
    const { password: _, ...adminData } = admin;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminData,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update basic info
    const data = {
      name: name || admin.name,
      email: email || admin.email
    };

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data
    });

    const { password: _, ...adminData } = updated;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: adminData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};