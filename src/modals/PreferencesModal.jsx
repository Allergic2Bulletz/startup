import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import modalStyles from './modals.module.css';

const PreferencesModal = ({ isOpen, onClose, preferences, onSave, onReset }) => {
  const [formData, setFormData] = useState({
    theme: 'light',
    timeFormat: '12',
    showSeconds: false,
    defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: true,
    reminderSound: true
  });

  // Update form data when preferences change or modal opens
  useEffect(() => {
    if (isOpen && preferences) {
      setFormData(preferences);
    }
  }, [isOpen, preferences]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Preferences</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="theme">Theme:</label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleInputChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label htmlFor="timeFormat">Time Format:</label>
          <select
            id="timeFormat"
            name="timeFormat"
            value={formData.timeFormat}
            onChange={handleInputChange}
          >
            <option value="12">12-Hour</option>
            <option value="24">24-Hour</option>
          </select>
        </div>

        <div>
          <label htmlFor="showSeconds">
            <input
              type="checkbox"
              id="showSeconds"
              name="showSeconds"
              checked={formData.showSeconds}
              onChange={handleInputChange}
            />
            Show Seconds
          </label>
        </div>

        <div>
          <label htmlFor="defaultTimezone">Default Time Zone:</label>
          <select
            id="defaultTimezone"
            name="defaultTimezone"
            value={formData.defaultTimezone}
            onChange={handleInputChange}
          >
            <option value="America/New_York">Eastern Time (New York)</option>
            <option value="America/Chicago">Central Time (Chicago)</option>
            <option value="America/Denver">Mountain Time (Denver)</option>
            <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
            <option value="Europe/London">GMT (London)</option>
            <option value="Europe/Paris">CET (Paris)</option>
            <option value="Asia/Tokyo">JST (Tokyo)</option>
            <option value="Asia/Shanghai">CST (Shanghai)</option>
            <option value="Australia/Sydney">AEST (Sydney)</option>
          </select>
        </div>

        <div>
          <label htmlFor="notifications">
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={formData.notifications}
              onChange={handleInputChange}
            />
            Enable Notifications
          </label>
        </div>

        <div>
          <label htmlFor="reminderSound">
            <input
              type="checkbox"
              id="reminderSound"
              name="reminderSound"
              checked={formData.reminderSound}
              onChange={handleInputChange}
            />
            Reminder Sound
          </label>
        </div>

        <div className={modalStyles.modalButtons}>
          <button type="button" className={modalStyles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={modalStyles.importBtn} onClick={handleReset}>
            Reset to Defaults
          </button>
          <button type="submit">Save Preferences</button>
        </div>
      </form>
    </Modal>
  );
};

export default PreferencesModal;