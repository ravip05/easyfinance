import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Geolocation } from '@capacitor/geolocation';

// Office Coordinates (Using a static fallback for demo, ideally fetched from settings)
const OFFICE_COORDS = { lat: 19.0760, lng: 72.8777 }; // Example: Mumbai
const ALLOWED_RADIUS_METERS = 200;

export default function MyAttendance() {
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  const [attendance, setAttendance] = useState(null); // Today's record

  // Calculate distance between two coordinates in meters
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleAction = async (type) => { // 'check-in' or 'check-out'
    setCheckingIn(true);
    setErrorMSG('');

    try {
      // 1. Get exact location
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const currentLat = position.coords.latitude;
      const currentLng = position.coords.longitude;

      // 2. Verify geofencing map logic
      const distance = getDistance(currentLat, currentLng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      
      if (distance > ALLOWED_RADIUS_METERS && type === 'check-in') {
        setErrorMSG(`You are ${Math.round(distance)}m away from the office. Must be within ${ALLOWED_RADIUS_METERS}m to check in.`);
        setCheckingIn(false);
        return;
      }

      // 3. Send to API (API not yet built, simulation for now)
      alert(`Simulation: Successfully sent ${type} with location: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`);
      
      // MOCK UPDATE
      if(type === 'check-in') setAttendance({ check_in_at: new Date().toLocaleTimeString(), status: 'present' });
      else setAttendance(prev => ({ ...prev, check_out_at: new Date().toLocaleTimeString() }));
      
    } catch (err) {
      setErrorMSG('Requires location permissions to calculate distance.');
      console.error(err);
    }
    
    setCheckingIn(false);
  };

  return (
    <div id="page-myattendance" className="page active fade-in" style={{ paddingBottom: '80px' }}>
      <header className="page-header mb-4">
        <h1 className="page-title">My Attendance</h1>
        <p className="text-muted">Geofenced daily roll-call.</p>
      </header>

      {errorMSG && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMSG}
        </div>
      )}

      <div className="card shadow-sm border-0 text-center py-5">
        <div className="card-body">
          <div style={{ fontSize: '48px', marginBottom: '1rem', color: 'var(--primary)' }}>
            <i className="bi bi-geo-alt-fill"></i>
          </div>

          {!attendance ? (
            <>
              <h3 className="h4 mb-3">Not Checked In</h3>
              <p className="text-muted mb-4">You must be within {ALLOWED_RADIUS_METERS} meters of the office to check in.</p>
              <button 
                className="btn btn-primary px-5 py-2 fw-bold" 
                onClick={() => handleAction('check-in')}
                disabled={checkingIn}
              >
                {checkingIn ? 'Verifying Location...' : 'Tap to Check-In'}
              </button>
            </>
          ) : (
            <>
              <h3 className="h4 mb-3 text-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                Checked In
              </h3>
              <div className="d-flex justify-content-center gap-4 mb-4 text-muted">
                <div>
                  <small className="d-block">Check-in Time</small>
                  <strong>{attendance.check_in_at}</strong>
                </div>
                {attendance.check_out_at && (
                  <div>
                    <small className="d-block">Check-out Time</small>
                    <strong>{attendance.check_out_at}</strong>
                  </div>
                )}
              </div>
              
              {!attendance.check_out_at && (
                <button 
                  className="btn btn-outline-danger px-5 py-2 fw-bold mt-2" 
                  onClick={() => handleAction('check-out')}
                  disabled={checkingIn}
                >
                  {checkingIn ? 'Verifying Location...' : 'Punch Out'}
                </button>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
