import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and operations.
 */
export function useAuth() {
  return useAuthContext();
}
