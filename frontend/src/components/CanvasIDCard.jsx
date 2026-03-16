import React, { useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const CanvasIDCard = ({ userData }) => {
  const canvasRef = useRef(null);
  const isNative = Capacitor.isNativePlatform();

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set internal resolution (1012x638 - Standard ID proportions)
    canvas.width = 1012;
    canvas.height = 638;

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e3a5f'); // Dark Navy
    gradient.addColorStop(1, '#2563eb'); // Blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Decorative Elements (Subtle curves)
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.quadraticCurveTo(canvas.width * 0.7, canvas.height * 0.5, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();

    // 3. Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Inter, system-ui';
    ctx.fillText('EASYFINANCE CRM', 60, 100);
    
    ctx.font = '300 24px Inter, system-ui';
    ctx.fillText('DIGITAL ADVISOR IDENTITY', 60, 140);

    // 4. User Info
    ctx.font = 'bold 64px Inter, system-ui';
    ctx.fillText(userData.name.toUpperCase(), 60, 320);

    ctx.font = '32px Inter, system-ui';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`ROLE: ${userData.role.toUpperCase()}`, 60, 370);
    ctx.fillText(`ID: ${userData.employee_id || 'EF-2024-' + userData.id}`, 60, 420);
    ctx.fillText(`PHONE: ${userData.phone}`, 60, 470);

    // 5. Footer / Branding
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    
    ctx.fillStyle = '#1e3a5f';
    ctx.font = 'bold 24px Inter, system-ui';
    ctx.fillText('AUTHORIZED ADVISOR · EASYFINANCEWALE.IN', 60, canvas.height - 30);
  };

  useEffect(() => {
    drawCard();
  }, [userData]);

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    if (isNative) {
      try {
        const fileName = `EF_ID_${userData.name}.png`;
        const base64Data = dataUrl.split(',')[1];
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'My Virtual ID Card',
          text: 'Shared from EasyFinance CRM',
          url: savedFile.uri,
          dialogTitle: 'Share ID Card'
        });
      } catch (error) {
        console.error('Sharing failed', error);
      }
    } else {
      // Web Download fallback
      const link = document.createElement('a');
      link.download = `EF_ID_${userData.name}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="id-card-container">
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          height: 'auto', 
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }} 
      />
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleShare}
          className="btn-primary"
          style={{ padding: '12px 24px', borderRadius: '8px' }}
        >
          {isNative ? '📤 Share Card' : '💾 Download ID Card'}
        </button>
      </div>
    </div>
  );
};

export default CanvasIDCard;
