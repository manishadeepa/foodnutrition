import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email: formData.email,
        password: formData.password
      });

      console.log(res.data);

      localStorage.setItem('nutriscan_token', res.data.token);
      localStorage.setItem('nutriscan_user', JSON.stringify(res.data.user));

      navigate("/image-upload");

    } catch (err) {
      console.log(err);

      setLoginError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {loginError && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3 shadow-sm backdrop-blur-sm">
            <Icon
              name="AlertCircle"
              size={20}
              color="var(--color-error)"
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm text-error font-semibold mb-1">
                Authentication Failed
              </p>
              <p className="text-sm text-error/80 whitespace-pre-line leading-relaxed">
                {loginError}
              </p>
            </div>
          </div>
        )}

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

        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleChange}
          error={errors?.password}
          required
          disabled={isLoading}
        />

        <div className="flex justify-end -mt-2">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          iconName="LogIn"
          iconPosition="right"
          iconSize={20}
          className="h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center pt-4 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/sign-up')}
              className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>

      </form>
    </div>
  );
};

export default LoginForm;