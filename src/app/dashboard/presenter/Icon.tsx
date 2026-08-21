import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function Icon({ name, className = 'w-5 h-5', size }: IconProps) {
  // Normalize name e.g. "user" -> "User", "radio" -> "Radio"
  const formattedName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Lucide icon component lookup
  const Component = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[
    formattedName
  ] || LucideIcons.Radio;

  return <Component className={className} size={size} />;
}
