import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import axios from "axios";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setEmail(e?.target?.value);
    if (error) {
      setError('');
    }
    if (formError) {
      setFormError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormError('');
  setSuccessMessage('');

  if (!validateEmail()) return;

  setIsLoading(true);

  try {
    const res = await axios.post("http://localhost:5000/forgot-password", {
      email: email
    });

    setSuccessMessage("Password reset link has been sent to your email address.");
    setEmail("");

  } catch (err) {
    if (err.response && err.response.status === 404) {
      setFormError("No account found with this email address.");
    } else {
      setFormError("Something went wrong. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {successMessage && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
            <Icon name="CheckCircle" size={20} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-success font-medium mb-1">Email Sent Successfully</p>
              <p className="text-sm text-success/80">{successMessage}</p>
            </div>
          </div>
        )}

        {formError && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
            <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-error font-medium mb-1">Email Not Found</p>
              <p className="text-sm text-error/80">{formError}</p>
            </div>
          </div>
        )}

        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="Enter your registered email"
          value={email}
          onChange={handleChange}
          error={error}
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="Send"
          iconPosition="right"
          iconSize={20}
        >
          {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </Button>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;