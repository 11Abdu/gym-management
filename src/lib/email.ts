// This file demonstrates the structure for Nodemailer integration
// In a real server environment, this would use actual Nodemailer

import { Member } from '@/types';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Email templates
export const emailTemplates = {
  welcome: (member: Member): EmailData => ({
    to: member.email,
    subject: `Welcome to FitZone Gym, ${member.firstName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to FitZone Gym!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${member.firstName} ${member.lastName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Welcome to FitZone Gym! We're excited to have you as part of our fitness community.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1f2937; margin-top: 0;">Your Membership Details:</h3>
            <p><strong>Member ID:</strong> ${member.memberId}</p>
            <p><strong>Membership Duration:</strong> ${member.membershipDuration} months</p>
            <p><strong>Start Date:</strong> ${member.startDate}</p>
            <p><strong>End Date:</strong> ${member.endDate}</p>
          </div>
          <p style="color: #6b7280; line-height: 1.6;">
            Your QR code for gym access will be available in your member profile. 
            Please present it at the front desk during your visits.
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            If you have any questions, feel free to contact us. We look forward to helping you achieve your fitness goals!
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px;">
              FitZone Gym<br>
              Your Fitness Journey Starts Here
            </p>
          </div>
        </div>
      </div>
    `
  }),

  expiration: (member: Member, daysUntilExpiry: number): EmailData => ({
    to: member.email,
    subject: `Membership Expiration Reminder - FitZone Gym`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Membership Expiration Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${member.firstName} ${member.lastName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            This is a friendly reminder that your gym membership will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h3 style="color: #1f2937; margin-top: 0;">Membership Details:</h3>
            <p><strong>Member ID:</strong> ${member.memberId}</p>
            <p><strong>Expiration Date:</strong> ${member.endDate}</p>
            <p><strong>Current Status:</strong> ${daysUntilExpiry > 0 ? 'Active' : 'Expired'}</p>
          </div>
          <p style="color: #6b7280; line-height: 1.6;">
            To continue enjoying our facilities and services, please renew your membership before the expiration date.
            Visit our front desk or contact us to discuss renewal options.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Renew Membership
            </a>
          </div>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for being a valued member of FitZone Gym!
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px;">
              FitZone Gym<br>
              Your Fitness Journey Continues Here
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Simulated email sending function
// In production, this would use Nodemailer
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log email to console for demo purposes
    console.log('📧 Email sent:', {
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Function to send welcome email
export const sendWelcomeEmail = async (member: Member): Promise<boolean> => {
  const emailData = emailTemplates.welcome(member);
  return sendEmail(emailData);
};

// Function to send expiration reminder
export const sendExpirationReminder = async (member: Member, daysUntilExpiry: number): Promise<boolean> => {
  const emailData = emailTemplates.expiration(member, daysUntilExpiry);
  return sendEmail(emailData);
};

// Function to check and send expiration reminders for all members
export const checkAndSendExpirationReminders = async (members: Member[]): Promise<void> => {
  const today = new Date();
  
  for (const member of members) {
    const endDate = new Date(member.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Send reminder 30, 7, and 1 day before expiration
    if ([30, 7, 1].includes(daysUntilExpiry)) {
      await sendExpirationReminder(member, daysUntilExpiry);
    }
  }
};