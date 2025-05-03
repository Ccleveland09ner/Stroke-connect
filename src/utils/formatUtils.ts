import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateString;
  }
};

export const formatNIHSSScore = (score: number): { text: string; color: string } => {
  if (score <= 4) {
    return { text: 'Minor Stroke', color: 'text-success-600' };
  } else if (score <= 15) {
    return { text: 'Moderate Stroke', color: 'text-warning-600' };
  } else {
    return { text: 'Severe Stroke', color: 'text-error-600' };
  }
};

export const formatStatus = (status: string): { text: string; color: string } => {
  switch (status) {
    case 'waiting':
      return { text: 'Waiting for Assessment', color: 'bg-warning-100 text-warning-800' };
    case 'diagnosed':
      return { text: 'Diagnosed', color: 'bg-primary-100 text-primary-800' };
    case 'treatment-pending':
      return { text: 'Treatment Pending', color: 'bg-accent-100 text-accent-800' };
    case 'treatment-approved':
      return { text: 'Treatment Approved', color: 'bg-success-100 text-success-800' };
    case 'treatment-denied':
      return { text: 'Treatment Denied', color: 'bg-error-100 text-error-800' };
    case 'discharged':
      return { text: 'Discharged', color: 'bg-secondary-100 text-secondary-800' };
    default:
      return { text: status, color: 'bg-gray-100 text-gray-800' };
  }
};