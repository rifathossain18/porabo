import React, { useState } from 'react';
import type { UserRole } from '../lib/types';
import { GUARDIAN_CONFIG, TEACHER_CONFIG } from './landing/config';
import { RoleLanding } from './landing/RoleLanding';
import { RoleSelector } from './landing/RoleSelector';

interface LandingPageProps {
  onProceedToAuth: (role: UserRole, mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onProceedToAuth,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (!selectedRole) {
    return <RoleSelector onSelect={setSelectedRole} />;
  }

  if (selectedRole === 'TUTOR') {
    return (
      <RoleLanding
        config={TEACHER_CONFIG}
        onSignIn={() => onProceedToAuth('TUTOR', 'login')}
        onRegister={() => onProceedToAuth('TUTOR', 'register')}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <RoleLanding
      config={GUARDIAN_CONFIG}
      onSignIn={() => onProceedToAuth('STUDENT', 'login')}
      onRegister={() => onProceedToAuth('STUDENT', 'register')}
      onBack={() => setSelectedRole(null)}
    />
  );
};
