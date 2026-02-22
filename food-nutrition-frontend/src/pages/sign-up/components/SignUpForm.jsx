  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Input from '../../../components/ui/Input';
  import Button from '../../../components/ui/Button';
  import { Checkbox } from '../../../components/ui/Checkbox';
  import Icon from '../../../components/AppIcon';
  import PasswordStrengthIndicator from './PasswordStrengthIndicator';
  import axios from "axios";

  const SignUpForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [signUpError, setSignUpError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const calculatePasswordStrength = (password) => {
      let strength = 0;
      if (password?.length >= 8) strength++;
      if (password?.length >= 12) strength++;
      if (/[a-z]/?.test(password) && /[A-Z]/?.test(password)) strength++;
      if (/[0-9]/?.test(password)) strength++;
      if (/[^a-zA-Z0-9]/?.test(password)) strength++;
      return Math.min(strength, 5);
    };

    const validateForm = () => {
      const newErrors = {};

      if (!formData?.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData?.fullName?.trim()?.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }

      if (!formData?.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData?.password) {
        newErrors.password = 'Password is required';
      } else if (formData?.password?.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength < 3) {
        newErrors.password = 'Please choose a stronger password';
      }

      if (!formData?.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData?.password !== formData?.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData?.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the terms and conditions';
      }

      setErrors(newErrors);
      return Object.keys(newErrors)?.length === 0;
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e?.target;
      const fieldValue = type === 'checkbox' ? checked : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: fieldValue
      }));

      if (name === 'password') {
        setPasswordStrength(calculatePasswordStrength(value));
      }

      if (errors?.[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      if (signUpError) {
        setSignUpError('');
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/signup", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      console.log(res.data);

      navigate('/image-upload');

    } catch (err) {
      console.log(err);
      setSignUpError('Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };


    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {signUpError && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
              <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-error font-medium mb-1">Registration Failed</p>
                <p className="text-sm text-error/80 whitespace-pre-line">{signUpError}</p>
              </div>
            </div>
          )}

          <Input
            type="text"
            name="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData?.fullName}
            onChange={handleChange}
            error={errors?.fullName}
            required
            disabled={isLoading}
          />

          <Input
            type="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData?.email}
            onChange={handleChange}
            error={errors?.email}
            required
            disabled={isLoading}
          />

          <div>
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Create a strong password"
              value={formData?.password}
              onChange={handleChange}
              error={errors?.password}
              required
              disabled={isLoading}
            />
            {formData?.password && (
              <PasswordStrengthIndicator strength={passwordStrength} />
            )}
          </div>

          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={formData?.confirmPassword}
            onChange={handleChange}
            error={errors?.confirmPassword}
            required
            disabled={isLoading}
          />

          <div>
            <Checkbox
              name="termsAccepted"
              checked={formData?.termsAccepted}
              onChange={handleChange}
              disabled={isLoading}
              label={
                <span className="text-sm">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                </span>
              }
              error={errors?.termsAccepted}
              required
            />
          </div>

          <Button
            type="submit"
            variant="default"
            fullWidth
            loading={isLoading}
            iconName="UserPlus"
            iconPosition="right"
            iconSize={20}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  };

  export default SignUpForm;