'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'medium',
  color = 'primary',
  text,
  className = '',
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    secondary: 'loading-spinner--secondary',
    white: 'loading-spinner--white'
  };

  const containerClass = fullScreen 
    ? 'loading-spinner-container loading-spinner-container--fullscreen'
    : 'loading-spinner-container';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
        <div className="loading-spinner__circle"></div>
      </div>
      {text && (
        <p className="loading-spinner__text">{text}</p>
      )}
    </div>
  );
}
