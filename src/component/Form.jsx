import React, { useState } from 'react';

const Form = () => {
  // State for form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  // State for field errors and loading indicators
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState({
    name: false,
    email: false,
    password: false,
  });

  // Validation functions
  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Email is invalid';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  // Handle change in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle individual field submission with loading
  const handleBlur = async (field) => {
    let error = '';
    setLoading((prev) => ({ ...prev, [field]: true }));

    switch (field) {
      case 'name':
        error = validateName(form.name);
        break;
      case 'email':
        error = validateEmail(form.email);
        break;
      case 'password':
        error = validatePassword(form.password);
        break;
      default:
        return;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));

    // Simulate async submission process
    if (!error) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
      alert(`${field} submitted successfully: ${form[field]}`);
    }

    setLoading((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <div>
      <h2>Individual Field Form with Auto Submission</h2>

      {/* Name Field */}
      <div>
        <label>
          Name:
          <input
            type='text'
            name='name'
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
          />
        </label>
        {loading.name ? (
          <span style={{ color: 'blue' }}>Validating...</span>
        ) : (
          errors.name && <span style={{ color: 'red' }}>{errors.name}</span>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label>
          Email:
          <input
            type='email'
            name='email'
            value={form.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
          />
        </label>
        {loading.email ? (
          <span style={{ color: 'blue' }}>Validating...</span>
        ) : (
          errors.email && <span style={{ color: 'red' }}>{errors.email}</span>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label>
          Password:
          <input
            type='password'
            name='password'
            value={form.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
          />
        </label>
        {loading.password ? (
          <span style={{ color: 'blue' }}>Validating...</span>
        ) : (
          errors.password && (
            <span style={{ color: 'red' }}>{errors.password}</span>
          )
        )}
      </div>
    </div>
  );
};

export default Form;
