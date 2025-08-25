// Zoom link generation utility
// For production, you'd use Zoom API with proper authentication

export function generateZoomLink(meetingId?: string): string {
  if (meetingId) {
    return `https://zoom.us/j/${meetingId}`;
  }
  
  // Generate a random meeting ID (10 digits)
  const randomId = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `https://zoom.us/j/${randomId}`;
}

export function generateGoogleMeetLink(): string {
  // Generate a random meeting code (3 letters + 4 numbers)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const code = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('') +
               Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
  
  return `https://meet.google.com/${code}`;
}

export function generateTeleLink(provider: 'zoom' | 'google-meet' | 'custom' = 'zoom', customUrl?: string): string {
  switch (provider) {
    case 'zoom':
      return generateZoomLink();
    case 'google-meet':
      return generateGoogleMeetLink();
    case 'custom':
      return customUrl || generateZoomLink();
    default:
      return generateZoomLink();
  }
}
