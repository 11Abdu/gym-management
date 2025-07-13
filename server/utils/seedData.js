import Admin from '../models/Admin.js';
import Plan from '../models/Plan.js';
import Member from '../models/Member.js';
import { addMonths } from 'date-fns';

export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('📊 Database already seeded');
      return;
    }

    console.log('🌱 Seeding database...');

    // Create Super Admin
    const superAdmin = new Admin({
      name: 'Super Administrator',
      email: 'admin@gym.com',
      password: 'admin123',
      role: 'super_admin'
    });
    await superAdmin.save();

    // Create Plans
    const plans = [
      {
        name: 'Basic',
        duration: 1,
        price: 49,
        description: 'Perfect for beginners',
        isActive: true,
        features: [
          'Access to gym equipment',
          'Locker room access',
          'Basic fitness assessment',
          'Mobile app access'
        ],
        createdBy: superAdmin._id
      },
      {
        name: 'Premium',
        duration: 6,
        price: 249,
        description: 'Most popular choice',
        isPopular: true,
        isActive: true,
        features: [
          'All Basic features',
          'Group fitness classes',
          'Personal trainer consultation',
          'Nutrition guidance',
          'Priority booking',
          'Guest passes (2/month)'
        ],
        createdBy: superAdmin._id
      },
      {
        name: 'Elite',
        duration: 12,
        price: 449,
        description: 'Ultimate fitness experience',
        isActive: true,
        features: [
          'All Premium features',
          'Unlimited personal training',
          'Massage therapy sessions',
          'VIP locker room',
          'Meal planning service',
          'Guest passes (5/month)',
          '24/7 gym access'
        ],
        createdBy: superAdmin._id
      }
    ];

    const createdPlans = await Plan.insertMany(plans);

    // Create Demo Member
    const startDate = new Date('2024-01-01');
    const endDate = addMonths(startDate, 12);

    const demoMember = new Member({
      memberId: 'GYM001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-05-15'),
      membershipDuration: 12,
      membershipPlan: 'Elite',
      membershipPrice: 449,
      startDate,
      endDate,
      status: 'active',
      qrCode: 'GYM001',
      joinDate: startDate,
      lastCheckIn: new Date('2024-12-15T09:30:00Z'),
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relationship: 'Wife'
      },
      notes: 'Regular member, prefers morning workouts'
    });

    await demoMember.save();

    console.log('✅ Database seeded successfully');
    console.log('👤 Super Admin created: admin@gym.com / admin123');
    console.log(`📋 ${plans.length} plans created`);
    console.log('👥 Demo member created');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};