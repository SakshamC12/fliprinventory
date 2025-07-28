import React, { useEffect, useState } from 'react';

export default function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Get staff data from sessionStorage
      const staffData = JSON.parse(sessionStorage.getItem('staffData'));
      if (staffData) {
        setProfile(staffData);
      } else {
        setError('Staff session not found');
      }
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>No profile data found</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="content-card" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#153A6B' }}>My Profile</h2>
        <div className="profile-info">
          <h3 style={{ marginBottom: '1rem', color: '#1a365d' }}>Staff Information</h3>
          <p><strong>Staff ID:</strong> {profile.staff_id}</p>
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Department:</strong> {profile.department}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      </div>
    </div>
  );
}