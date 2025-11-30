import React, { useState } from 'react';
import Modal from './Modal';
import modalStyles from './modals.module.css';

const AddBookmarkModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    timezone: 'America/New_York'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', timezone: 'America/New_York' });
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Add New Bookmark</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="bookmark-name">Bookmark Name:</label>
          <input
            type="text"
            id="bookmark-name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="e.g., Mom (Chicago)"
          />
        </div>

        <div>
          <label htmlFor="bookmark-timezone">Time Zone:</label>
          <select
            id="bookmark-timezone"
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
          <button type="submit">Add Bookmark</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBookmarkModal;