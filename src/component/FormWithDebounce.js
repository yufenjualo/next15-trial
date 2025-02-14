import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

export default function AutoSaveForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState({});

  const saveField = async (field, value) => {
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus((prev) => ({
        ...prev,
        [field]: { type: 'success', message: 'Saved!' },
      }));
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, [field]: undefined }));
      }, 2000);
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        [field]: { type: 'error', message: 'Failed to save.' },
      }));
    }
  };

  const debouncedSave = useCallback(debounce(saveField, 300), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    debouncedSave(name, value);
  };

  return (
    <div className='p-4 max-w-md mx-auto'>
      <label className='block mb-2'>Name:</label>
      <input
        type='text'
        name='name'
        value={formData.name}
        onChange={handleChange}
        className='border p-2 w-full rounded'
      />
      {status.name && (
        <p
          className={`mt-1 text-sm ${
            status.name.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status.name.message}
        </p>
      )}

      <label className='block mt-4 mb-2'>Email:</label>
      <input
        type='email'
        name='email'
        value={formData.email}
        onChange={handleChange}
        className='border p-2 w-full rounded'
      />
      {status.email && (
        <p
          className={`mt-1 text-sm ${
            status.email.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status.email.message}
        </p>
      )}
    </div>
  );
}
