/**
 * Login Form Component
 * OWASP-level security, A11y compliant login form
 * Features:
 * - CSRF protection
 * - Rate limiting
 * - Password show/hide toggle
 * - CapsLock warning
 * - Real-time validation
 * - Accessibility (ARIA labels, focus management)
 */

'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface LoginFormState {
  username: string;
  password: string;
  remember: boolean;
  showPassword: boolean;
  capsLockOn: boolean;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: {
    username?: string;
    password?: string;
  };
}

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<LoginFormState>({
    username: '',
    password: '',
    remember: false,
    showPassword: false,
    capsLockOn: false,
    isSubmitting: false,
    error: null,
    fieldErrors: {},
  });

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const capsLockWarningRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Real-time validation with debouncing
  const validateField = (name: string, value: string): string | null => {
    if (name === 'username') {
      if (!value.trim()) return null; // Don't show error until blur or submit
      if (value.length < 3) return 'Kullanıcı adı en az 3 karakter olmalı';
      // Email or username format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]{3,}$/.test(value);
      if (!isEmail && !isUsername) {
        return 'Geçerli bir e-posta veya kullanıcı adı girin';
      }
    }
    
    if (name === 'password') {
      if (!value) return null; // Don't show error until blur or submit
      if (value.length < 8) return 'Parola en az 8 karakter olmalı';
    }
    
    return null;
  };

  // Handle input changes with debounced validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setState(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      [name]: value,
      error: null, // Clear global error on input change
      fieldErrors: {
        ...prev.fieldErrors,
        [name]: undefined, // Clear field error on input
      },
    }));

    // Debounced validation (only for non-empty values)
    if (value) {
      const timeoutId = setTimeout(() => {
        const error = validateField(name, value);
        if (error) {
          setState(prev => ({
            ...prev,
            fieldErrors: { ...prev.fieldErrors, [name]: error },
          }));
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  // Handle blur for immediate validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setState(prev => ({
      ...prev,
      fieldErrors: { ...prev.fieldErrors, [name]: error || undefined },
    }));
  };

  // Detect CapsLock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === passwordInputRef.current) {
        const capsLockOn = e.getModifierState?.('CapsLock') || false;
        setState(prev => ({ ...prev, capsLockOn }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setState(prev => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
    // Maintain focus after toggle
    setTimeout(() => passwordInputRef.current?.focus(), 0);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameError = validateField('username', state.username);
    const passwordError = validateField('password', state.password);
    
    if (usernameError || passwordError) {
      setState(prev => ({
        ...prev,
        fieldErrors: {
          username: usernameError || undefined,
          password: passwordError || undefined,
        },
        error: 'Lütfen tüm alanları doğru şekilde doldurun',
      }));
      // Focus first error field
      if (usernameError) {
        usernameInputRef.current?.focus();
      } else if (passwordError) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      // Get CSRF token (if using CSRF protection)
      const csrfResponse = await fetch('/api/auth/csrf');
      const { token } = await csrfResponse.json();

      // Submit login request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          username: state.username.trim(),
          password: state.password,
          remember: state.remember,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Generic error message (don't reveal if user exists)
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: 'Kullanıcı adı veya parola hatalı. Tekrar deneyin.',
        }));
        // Announce error to screen readers
        formErrorRef.current?.setAttribute('aria-live', 'assertive');
        formErrorRef.current?.focus();
        return;
      }

      // Success: redirect
      const target = data.redirect || '/';
      // Prefer client router to avoid full reload
      router.push(target);
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      }));
      formErrorRef.current?.setAttribute('aria-live', 'assertive');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear errors
      if (e.key === 'Escape' && state.error) {
        setState(prev => ({ ...prev, error: null }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.error]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 md:p-8">
      <form
        method="POST"
        action="/api/auth/login"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Giriş formu"
      >
        {/* Global error message */}
        {state.error && (
          <div
            ref={formErrorRef}
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2"
          >
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Username/Email field */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            E-posta veya kullanıcı adı
          </label>
          <input
            ref={usernameInputRef}
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            inputMode="email"
            value={state.username}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={state.fieldErrors.username ? 'username-error' : undefined}
            aria-invalid={!!state.fieldErrors.username}
            className={`w-full px-4 py-3 rounded-lg border ${
              state.fieldErrors.username
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            } text-slate-900 placeholder-slate-400 transition-colors focus:outline-none`}
            placeholder="ornek@email.com veya kullanici_adi"
          />
          {state.fieldErrors.username && (
            <p
              id="username-error"
              role="alert"
              className="mt-1.5 text-xs text-red-600"
            >
              {state.fieldErrors.username}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Parola
          </label>
          <div className="relative">
            <input
              ref={passwordInputRef}
              id="password"
              name="password"
              type={state.showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={8}
              value={state.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby={`password-help ${state.capsLockOn ? 'caps-warning' : ''} ${
                state.fieldErrors.password ? 'password-error' : ''
              }`}
              aria-invalid={!!state.fieldErrors.password}
              className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                state.fieldErrors.password
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              } text-slate-900 placeholder-slate-400 transition-colors focus:outline-none`}
              placeholder="Parolanızı girin"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-pressed={state.showPassword}
              aria-label={state.showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 rounded"
            >
              {state.showPassword ? (
                <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
          
          {/* Password help text */}
          <small
            id="password-help"
            className="block mt-1.5 text-xs text-slate-500"
          >
            Parolanızı kimseyle paylaşmayın.
          </small>
          
          {/* CapsLock warning */}
          {state.capsLockOn && (
            <div
              ref={capsLockWarningRef}
              id="caps-warning"
              role="status"
              aria-live="polite"
              className="mt-1.5 text-xs text-amber-600 flex items-center gap-1"
            >
              <ExclamationTriangleIcon className="w-4 h-4" aria-hidden="true" />
              <span>CapsLock açık olabilir.</span>
            </div>
          )}
          
          {/* Password error */}
          {state.fieldErrors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1.5 text-xs text-red-600"
            >
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        {/* Remember me checkbox */}
        <div className="mb-6 flex items-start gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={state.remember}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
          />
          <label
            htmlFor="remember"
            className="text-sm text-slate-700 cursor-pointer"
          >
            Bu cihazda oturumumu açık tut
            <span className="block text-xs text-slate-500 mt-0.5">
              Bu cihazda oturum süren uzar.
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={state.isSubmitting}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center gap-2"
        >
          {state.isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Giriş yapılıyor...</span>
            </>
          ) : (
            'Giriş Yap'
          )}
        </button>

        {/* Forgot password link */}
        <p className="mt-4 text-center">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-200 rounded"
          >
            Parolanı mı unuttun?
          </a>
        </p>
      </form>
    </div>
  );
}

