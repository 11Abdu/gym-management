import { Member, CheckIn, Admin, Plan } from '@/types';

// Local storage keys
const MEMBERS_KEY = 'gym_members';
const CHECKINS_KEY = 'gym_checkins';
const ADMIN_KEY = 'gym_admin';
const PLANS_KEY = 'gym_plans';

// Initialize with demo data
const initializeData = () => {
  if (!localStorage.getItem(ADMIN_KEY)) {
    const admins: Admin[] = [
      {
        _id: 'admin_1',
        email: 'admin@gym.com',
        password: 'admin123', // In production, this would be hashed
        name: 'Super Administrator',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admins));
  }

  if (!localStorage.getItem(PLANS_KEY)) {
    const plans: Plan[] = [
      {
        _id: 'plan_1',
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
        ]
      },
      {
        _id: 'plan_2',
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
        ]
      },
      {
        _id: 'plan_3',
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
        ]
      }
    ];
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  }

  if (!localStorage.getItem(MEMBERS_KEY)) {
    const demoMembers: Member[] = [
      {
        _id: 'member_1',
        memberId: 'GYM001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-05-15',
        membershipDuration: 12,
        membershipPlan: 'Elite',
        membershipPrice: 449,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        qrCode: 'GYM001',
        joinDate: '2024-01-01',
        lastCheckIn: '2024-12-15T09:30:00Z',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567891',
          relationship: 'Wife'
        },
        notes: 'Regular member, prefers morning workouts'
      }
    ];
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(demoMembers));
  }

  if (!localStorage.getItem(CHECKINS_KEY)) {
    localStorage.setItem(CHECKINS_KEY, JSON.stringify([]));
  }
};

// Database operations
export const database = {
  // Initialize data
  init: initializeData,

  // Members
  members: {
    getAll: (): Member[] => {
      const data = localStorage.getItem(MEMBERS_KEY);
      return data ? JSON.parse(data) : [];
    },

    getById: (id: string): Member | null => {
      const members = database.members.getAll();
      return members.find(member => member._id === id) || null;
    },

    getByMemberId: (memberId: string): Member | null => {
      const members = database.members.getAll();
      return members.find(member => member.memberId === memberId) || null;
    },

    create: (member: Omit<Member, '_id'>): Member => {
      const members = database.members.getAll();
      const newMember: Member = {
        ...member,
        _id: `member_${Date.now()}`
      };
      members.push(newMember);
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
      return newMember;
    },

    update: (id: string, updates: Partial<Member>): Member | null => {
      const members = database.members.getAll();
      const index = members.findIndex(member => member._id === id);
      if (index === -1) return null;

      members[index] = { ...members[index], ...updates };
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
      return members[index];
    },

    delete: (id: string): boolean => {
      const members = database.members.getAll();
      const filteredMembers = members.filter(member => member._id !== id);
      if (filteredMembers.length === members.length) return false;

      localStorage.setItem(MEMBERS_KEY, JSON.stringify(filteredMembers));
      return true;
    }
  },

  // Check-ins
  checkIns: {
    getAll: (): CheckIn[] => {
      const data = localStorage.getItem(CHECKINS_KEY);
      return data ? JSON.parse(data) : [];
    },

    getByDate: (date: string): CheckIn[] => {
      const checkIns = database.checkIns.getAll();
      return checkIns.filter(checkIn => checkIn.date === date);
    },

    getByMember: (memberId: string): CheckIn[] => {
      const checkIns = database.checkIns.getAll();
      return checkIns.filter(checkIn => checkIn.memberId === memberId);
    },

    create: (checkIn: Omit<CheckIn, '_id'>): CheckIn => {
      const checkIns = database.checkIns.getAll();
      const newCheckIn: CheckIn = {
        ...checkIn,
        _id: `checkin_${Date.now()}`
      };
      checkIns.push(newCheckIn);
      localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
      return newCheckIn;
    },

    update: (id: string, updates: Partial<CheckIn>): CheckIn | null => {
      const checkIns = database.checkIns.getAll();
      const index = checkIns.findIndex(checkIn => checkIn._id === id);
      if (index === -1) return null;

      checkIns[index] = { ...checkIns[index], ...updates };
      localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
      return checkIns[index];
    }
  },

  // Plans
  plans: {
    getAll: (): Plan[] => {
      const data = localStorage.getItem(PLANS_KEY);
      return data ? JSON.parse(data) : [];
    },

    getActive: (): Plan[] => {
      const plans = database.plans.getAll();
      return plans.filter(plan => plan.isActive);
    },

    getById: (id: string): Plan | null => {
      const plans = database.plans.getAll();
      return plans.find(plan => plan._id === id) || null;
    },

    create: (plan: Omit<Plan, '_id'>): Plan => {
      const plans = database.plans.getAll();
      const newPlan: Plan = {
        ...plan,
        _id: `plan_${Date.now()}`
      };
      plans.push(newPlan);
      localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
      return newPlan;
    },

    update: (id: string, updates: Partial<Plan>): Plan | null => {
      const plans = database.plans.getAll();
      const index = plans.findIndex(plan => plan._id === id);
      if (index === -1) return null;

      plans[index] = { ...plans[index], ...updates };
      localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
      return plans[index];
    },

    delete: (id: string): boolean => {
      const plans = database.plans.getAll();
      const filteredPlans = plans.filter(plan => plan._id !== id);
      if (filteredPlans.length === plans.length) return false;

      localStorage.setItem(PLANS_KEY, JSON.stringify(filteredPlans));
      return true;
    }
  },

  // Admin
  admin: {
    getAll: (): Admin[] => {
      const data = localStorage.getItem(ADMIN_KEY);
      return data ? JSON.parse(data) : [];
    },

    authenticate: (email: string, password: string): Admin | null => {
      const admins = database.admin.getAll();
      return admins.find(admin => admin.email === email && admin.password === password) || null;
    },

    create: (admin: Omit<Admin, '_id'>): Admin => {
      const admins = database.admin.getAll();
      const newAdmin: Admin = {
        ...admin,
        _id: `admin_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      admins.push(newAdmin);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admins));
      return newAdmin;
    },

    update: (id: string, updates: Partial<Admin>): Admin | null => {
      const admins = database.admin.getAll();
      const index = admins.findIndex(admin => admin._id === id);
      if (index === -1) return null;

      admins[index] = { ...admins[index], ...updates };
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admins));
      return admins[index];
    },

    delete: (id: string): boolean => {
      const admins = database.admin.getAll();
      const filteredAdmins = admins.filter(admin => admin._id !== id);
      if (filteredAdmins.length === admins.length) return false;

      localStorage.setItem(ADMIN_KEY, JSON.stringify(filteredAdmins));
      return true;
    }
  }
};