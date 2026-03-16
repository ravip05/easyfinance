import React from 'react';

const LoanTimeline = ({ stages = [], currentStageId }) => {
  const currentIndex = stages.findIndex(s => s.id === currentStageId);

  return (
    <div className="loan-timeline" style={{ padding: '20px 0' }}>
      <div className="timeline-stepper" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        position: 'relative',
        padding: '0 10px'
      }}>
        {/* Connector Line */}
        <div style={{ 
          position: 'absolute', 
          top: '15px', 
          left: '0', 
          right: '0', 
          height: '2px', 
          background: 'var(--bg-lighter)',
          zIndex: 0
        }} />
        
        {/* Progress Line */}
        <div style={{ 
          position: 'absolute', 
          top: '15px', 
          left: '0', 
          width: `${(currentIndex / (stages.length - 1)) * 100}%`, 
          height: '2px', 
          background: 'var(--success-color)',
          transition: 'width 0.5s ease',
          zIndex: 1
        }} />

        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <div 
              key={stage.id} 
              style={{ 
                zIndex: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1
              }}
            >
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: isCompleted || isActive ? 'var(--success-color)' : 'var(--bg-lighter)',
                  color: isCompleted || isActive ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: isActive ? '4px solid #fff' : 'none',
                  boxShadow: isActive ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span 
                style={{ 
                  marginTop: '10px', 
                  fontSize: '11px', 
                  textAlign: 'center',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  maxWidth: '80px',
                  lineHeight: '1.2'
                }}
              >
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoanTimeline;
