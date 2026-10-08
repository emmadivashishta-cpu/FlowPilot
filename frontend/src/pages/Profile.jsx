import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Save, X, User, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: '',
    surname: '',
    personalEmail: user?.email || '',
    mobileNumber: '9100098958',
    whatsappSame: 'Yes',
    role: user?.role || 'Employee',
  });

  useEffect(() => {
    const nameParts = (user?.displayname || '').split(' ');
    const saved = localStorage.getItem('mockProfileData');
    const savedImage = localStorage.getItem('mockProfileImage');
    
    if (savedImage) {
      setProfileImage(savedImage);
    }
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up old college data if it existed in local storage
      setProfileData({
        firstName: parsed.firstName || '',
        surname: parsed.surname || '',
        personalEmail: parsed.personalEmail || '',
        mobileNumber: parsed.mobileNumber || '',
        whatsappSame: parsed.whatsappSame || 'Yes',
        role: parsed.role || user?.role || 'Employee',
      });
    } else {
      setProfileData({
        firstName: nameParts[0] || 'Emmadi',
        surname: nameParts.slice(1).join(' ') || 'Vashishta',
        personalEmail: user?.email || 'emmadivashishta@gmail.com',
        mobileNumber: '9100098958',
        whatsappSame: 'Yes',
        role: user?.role || 'Employee',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Call backend to update the role
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        role: profileData.role
      });
      if (response.data.success) {
        // Update user context with new role from token
        login(response.data.user, response.data.token);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }

    localStorage.setItem('mockProfileData', JSON.stringify(profileData));
    if (profileImage) {
      localStorage.setItem('mockProfileImage', profileImage);
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to="/dashboard" className="text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors flex items-center">
          <ArrowLeft className="w-6 h-6 mr-3" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl border border-gray-100 dark:border-dark-border p-6 sm:p-10 transition-colors">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Personal Details</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-4 py-2 rounded-lg transition flex items-center border border-transparent">
              <Edit className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline font-medium">Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button onClick={() => setIsEditing(false)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg transition flex items-center" title="Cancel">
                <X className="w-5 h-5" />
              </button>
              <button onClick={handleSave} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 px-4 py-2 rounded-lg transition flex items-center border border-green-200 dark:border-green-800" title="Save Changes">
                <Save className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Save</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4 group">
            {isEditing ? (
              <label className="cursor-pointer block relative">
                <div className="w-32 h-32 rounded-full border-4 border-primary-500/20 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm relative">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">
                  Change Picture
                </div>
                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-primary-500/20 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{profileData.firstName} {profileData.surname}</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{profileData.personalEmail}</p>
        </div>

        <div className="space-y-6 max-w-lg mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">First Name</label>
            {isEditing ? (
              <input type="text" name="firstName" value={profileData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm" />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{profileData.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Surname</label>
            {isEditing ? (
              <input type="text" name="surname" value={profileData.surname} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm" />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{profileData.surname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Personal Email</label>
            {isEditing ? (
              <input type="email" name="personalEmail" value={profileData.personalEmail} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm" />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{profileData.personalEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Registered Mobile Number</label>
            {isEditing ? (
              <input type="text" name="mobileNumber" value={profileData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm" />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{profileData.mobileNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Is this same as your WhatsApp Number?</label>
            {isEditing ? (
              <select name="whatsappSame" value={profileData.whatsappSame} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : (
              <div className="flex items-center">
                <p className="text-gray-900 dark:text-gray-100 font-medium text-base">{profileData.whatsappSame}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
            {isEditing ? (
              <select name="role" value={profileData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm">
                <option value="IT Admin">IT Admin</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 font-medium text-base">
                {user?.role || profileData.role || 'Employee'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
