export interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export interface RegistrationFormProps {
  onSwitchToLogin: () => void;
}

export interface TeacherCredentialRegistrationProps {
  onNextStep: (step: 1 | 2 | 3 | 4) => void;
}

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AuthGateHeaderProps {
  onBack: () => void;
}
