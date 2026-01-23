import { create,StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface AuthState {
  accessToken: string;
  isAcceptUpload: boolean;
  isAcceptRedeem: boolean;
  canAccessTermsUpload: boolean;
  canAccessTermsRedeem: boolean;
  isScanQR: boolean;
  isMfa: boolean;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  resetUserProtect: () => void;
  setAcceptUpload: () => void;
  setAcceptRedeem: () => void;
  setScanQR: () => void;
  setAlreadyMfa: () => void;
  setCanAccessTermsUpload: () => void;
  setCanAccessTermsRedeem: () => void;
  resetTermsAccess: () => void;
}
type AuthPersist = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState>
) => StateCreator<AuthState>;

const localStorageWrapper = {
  getItem: (name: string) => {
    const storedValue = localStorage.getItem(name);
    try {
      return storedValue ? JSON.parse(storedValue) : null;
    } catch (e) {
      console.error("Failed to parse localStorage item:", e);
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to set localStorage item:", e);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

const useAuthStore = create<AuthState>(
  (persist as AuthPersist)(
    (set) => ({
      // State
      accessToken: "",
      isAcceptUpload: false,
      isAcceptRedeem: false,
      canAccessTermsUpload: false,
      canAccessTermsRedeem: false,
      isScanQR: false,
      isMfa: false,
      // Actions
      setAccessToken: (token: string) => set({ accessToken: token }),
      clearAuth: () => {
        set({ accessToken: "", isMfa: false });
      },
      resetUserProtect: () =>
        set({ isAcceptUpload: false, isAcceptRedeem: false, isScanQR: false }),
      setAcceptUpload: () => set({ isAcceptUpload: true }),
      setAcceptRedeem: () => set({ isAcceptRedeem: true }),
      setScanQR: () => set({ isScanQR: true }),
      setAlreadyMfa: () => set({ isMfa: true }),
      setCanAccessTermsUpload: () => {
        set({ canAccessTermsUpload: true });
      },
      setCanAccessTermsRedeem: () => {
        set({ canAccessTermsRedeem: true });
      },
      resetTermsAccess: () => {
        set({ canAccessTermsUpload: false, canAccessTermsRedeem: false });
      },
    }),
    {
      name: "auth-storage",
      storage: typeof window !== "undefined" ? localStorageWrapper : undefined,
    }
  )
);

export default useAuthStore;
