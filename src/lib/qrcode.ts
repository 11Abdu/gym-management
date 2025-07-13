import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeUrl = await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const generateMemberQRCode = async (memberId: string): Promise<string> => {
  const qrData = JSON.stringify({
    type: 'gym_member',
    memberId: memberId,
    timestamp: new Date().toISOString()
  });
  return generateQRCode(qrData);
};