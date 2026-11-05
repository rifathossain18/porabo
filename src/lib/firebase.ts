import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

/**
 * Register user with Email and Password
 */
export async function registerWithEmailPassword(email: string, password: string): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (err: any) {
    console.error('Firebase createUser error:', err);
    return { success: false, error: err?.message || 'Registration failed' };
  }
}

/**
 * Sign in user with Email and Password
 */
export async function loginWithEmailPassword(email: string, password: string): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (err: any) {
    console.error('Firebase signIn error:', err);
    return { success: false, error: err?.message || 'Invalid email or password' };
  }
}

/**
 * Send Password Reset Email (Forgot Password)
 */
export async function sendResetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (err: any) {
    console.error('Firebase sendPasswordResetEmail error:', err);
    return { success: false, error: err?.message || 'Failed to send password reset email' };
  }
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

// Test Connection per guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase is offline or pending initial configuration.');
    }
  }
}

// Structured error handler per Firebase skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}
