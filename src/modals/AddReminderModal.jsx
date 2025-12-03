import React, { useState } from 'react';
import Modal from './Modal';
import modalStyles from './modals.module.css';

const AddReminderModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    datetime: '',
    timezone: 'America/New_York'
  });
  const [error, setError] = useState('');

  const validateDateTime = (datetime) => {
    if (!datetime) return false;
    
    const selectedDate = new Date(datetime);
    const now = new Date();
    
    if (selectedDate <= now) {
      setError('Reminder time must be in the future.');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateDateTime(formData.datetime)) {
      return;
    }
    
    onSave(formData);
    setFormData({ title: '', datetime: '', timezone: 'America/New_York' });
    setError('');
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user changes datetime
    if (name === 'datetime' && error) {
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Add New Reminder</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reminder-title">Reminder Title:</label>
          <input
            type="text"
            id="reminder-title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., Call Mom"
          />
        </div>

        <div>
          <label htmlFor="reminder-datetime">Date & Time:</label>
          <input
            type="datetime-local"
            id="reminder-datetime"
            name="datetime"
            value={formData.datetime}
            onChange={handleInputChange}
            required
          />
          {error && <div style={{ color: 'red', fontSize: '0.9em', marginTop: '0.25em' }}>{error}</div>}
        </div>

        <div>
          <label htmlFor="reminder-timezone">Time Zone:</label>
          <select
            id="reminder-timezone"
            name="timezone"
            value={formData.timezone}
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

        <div className={modalStyles.modalButtons}>
          <button type="button" className={modalStyles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Add Reminder</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddReminderModal;