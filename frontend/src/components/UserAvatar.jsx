import React, { useState } from 'react';
import { User } from 'lucide-react';

export default function UserAvatar({ 
  src, 
  name = 'User', 
  githubUsername = null, 
  className = 'w-10 h-10 rounded-xl',
  fallbackClassName = 'bg-slate-900 text-cyan-300 font-bold font-mono'
}) {
  const [imageFailed, setImageFailed] = useState(false);

  // Determine candidate URLs
  const candidateUrl = !imageFailed
    ? (src || (githubUsername ? `https://github.com/${githubUsername}.png` : null))
    : (githubUsername && src !== `https://github.com/${githubUsername}.png`
        ? `https://github.com/${githubUsername}.png`
        : null);

  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  const handleImageError = () => {
    setImageFailed(true);
  };

  if (!candidateUrl || (imageFailed && (!githubUsername || src === `https://github.com/${githubUsername}.png`))) {
    return (
      <div 
        className={`${className} ${fallbackClassName} flex items-center justify-center select-none shadow-sm border border-slate-200/80`}
        title={name}
      >
        {initial ? (
          <span className="text-sm font-bold tracking-tight">{initial}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-slate-400" />
        )}
      </div>
    );
  }

  return (
    <img
      src={candidateUrl}
      alt={name}
      referrerPolicy="no-referrer"
      onError={handleImageError}
      className={`${className} object-cover border border-slate-200/80 shadow-sm`}
    />
  );
}
