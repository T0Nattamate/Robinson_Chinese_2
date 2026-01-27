import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import useAuthStore from "./AuthStore";
import axiosInceptor from "../utils/axiosInterceptor";

/**
 * A single store within a branch, matching your API response:
 * {
 *   "storeId": "a1111111-b222-c333-d444-e55555555555",
 *   "storeName": "ร้าน A",
 *   "branchId": "R001",
 *   "isStoreEnable": true,
 *   "canLuckydraw": true,
 *   "canBag": true
 * }
 */
export interface Store {
  storeId: string;
  storeName: string;
  branchId: string;
  category: string;
  isParticipating: boolean;
  isStoreEnable: boolean;
}

/**
 * A branch with possible extra fields from your API:
 * {
 *   "branchId": "R001",
 *   "branchName": "สาขาสมุทรสาคร",
 *   "isBranchEnable": true,
 *   "canVip": true,
 *   "vipPoint": "100",
 *   "canHokkaido": true,
 *   "canBag": true,
 *   "stores": [...]
 * }
 */
export interface Branch {
  branchId: string;
  branchName: string;
  isBranchEnable: boolean;
  stores: Store[];
}

/**
 * The shape of our Zustand store state for branches.
 */
export interface BranchState {
  branches: Branch[];
  fetchBranches: () => Promise<void>;
  findBranchIdByBranchName: (branchName: string) => string | null;
  findBranchNameByBranchId: (branchId: string) => string | null;
  findFilteredBranchIdByBranchName: (branchName: string) => string | null;
  findFilteredBranchNameByBranchId: (branchId: string) => string | null;
}

type BranchPersist = (
  config: StateCreator<BranchState>,
  options: PersistOptions<BranchState>
) => StateCreator<BranchState>;

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

const useBranchStore = create<BranchState>(
  (persist as BranchPersist)(
    (set, get) => ({
      // ─────────────────────────────────────────────────────────
      // State
      // ─────────────────────────────────────────────────────────
      branches: [],

      // ─────────────────────────────────────────────────────────
      // Actions
      // ─────────────────────────────────────────────────────────
      fetchBranches: async () => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get("branch/available", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const branchData: Branch[] = response.data;

          // If vipPoint is always returned as a string, you could parse it here:
          // branchData.forEach((b) => {
          //   if (typeof b.vipPoint === 'string') {
          //     b.vipPoint = parseInt(b.vipPoint, 10);
          //   }
          // });

          set({ branches: branchData });
        } catch (error) {
          console.error("Error fetching branches:", error);
        }
      },

      findBranchIdByBranchName: (branchName: string) => {
        const { branches } = get();
        const branch = branches.find((b) => b.branchName === branchName);
        return branch ? branch.branchId : null;
      },

      findBranchNameByBranchId: (branchId: string) => {
        const { branches } = get();
        const branch = branches.find((b) => b.branchId === branchId);
        return branch ? branch.branchName : null;
      },

      findFilteredBranchIdByBranchName: (branchName: string) => {
        const { branches } = get();
        const branch = branches
          .filter((b) => b.isBranchEnable)
          .find((b) => b.branchName === branchName);
        return branch ? branch.branchId : null;
      },

      findFilteredBranchNameByBranchId: (branchId: string) => {
        const { branches } = get();
        const branch = branches
          .filter((b) => b.isBranchEnable)
          .find((b) => b.branchId === branchId);
        return branch ? branch.branchName : null;
      },
    }),
    {
      name: "branch-storage",
      storage: typeof window !== "undefined" ? localStorageWrapper : undefined,
    }
  )
);

export default useBranchStore;
