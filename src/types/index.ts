export interface Member {
  _id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  membershipDuration: number; // in months
  membershipPlan?: string; // Plan name
  membershipPrice?: number; // Plan price
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'suspended';
  qrCode: string;
  joinDate: string;
  lastCheckIn?: string;
  photo?: string; // Base64 encoded photo
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

export interface CheckIn {
  _id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
}

export interface Admin {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin';
  createdBy?: string;
  createdAt?: string;
}

export interface Plan {
  _id: string;
  name: string;
  duration: number; // in months
  price: number;
  features: string[];
  isPopular?: boolean;
  description: string;
  isActive: boolean;
}

export interface EmailTemplate {
  welcome: string;
  expiration: string;
}