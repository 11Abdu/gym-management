import { addMonths, format, differenceInDays, parseISO } from 'date-fns';
import { Member } from '@/types';

export const calculateEndDate = (startDate: string, durationMonths: number): string => {
  const start = parseISO(startDate);
  const end = addMonths(start, durationMonths);
  return format(end, 'yyyy-MM-dd');
};

export const getMembershipStatus = (member: Member): 'active' | 'expiring' | 'expired' => {
  const today = new Date();
  const endDate = parseISO(member.endDate);
  const daysUntilExpiry = differenceInDays(endDate, today);

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'active';
};

export const getDaysUntilExpiry = (member: Member): number => {
  const today = new Date();
  const endDate = parseISO(member.endDate);
  return differenceInDays(endDate, today);
};

export const formatMembershipDuration = (months: number): string => {
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  if (months === 12) return '1 year';
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ${months % 12 > 0 ? `${months % 12} month${months % 12 > 1 ? 's' : ''}` : ''}`.trim();
};