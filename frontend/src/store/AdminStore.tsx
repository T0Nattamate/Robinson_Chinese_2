import axios from "axios";
import axiosInceptor from "../utils/axiosInterceptor";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Redemption } from "../components/AdminDashboard/RedeemHistoryAdmin";
import { Customer } from "../components/AdminDashboard/CustomerAdmin";

export type MockRedemptionResponse = {
  claimedHistory: Redemption[];
  nextCursor: string;
  totalCount: number;
};

export type MockRedemptionResponseBranch = {
  claimedHistory: Redemption[];
  nextCursor: string;
  totalCount: number;
};

export type MockAllCustomersResponse = {
  data: Customer[];
  nextCursor: string;
  totalCount: number;
};

interface AdminData {
  adminId: string;
  username: string;
  role: "branchAdmin" | "superAdmin" | "secretAdmin";
  branch: string;
  isEnable: boolean;
  isMfa: boolean;
  qrCodeUrl?: string;
}

export interface Receipt {
  receiptId: number;
  receiptNo: string;
  lineId: string;
  receiptDate: string;
  amount: number;
  branchId: string;
  branchName: string;
  storeId: string;
  storeName: string;
  receiptImage: string;
  status: string;
  fullname: string;
  phone: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface ReceiptData {
  pageSize: number;
  totalCount: number;
  nextCursor: number | null;
  receiptHistory: Receipt[];
}

interface BranchAdmin {
  adminId: string;
  role: "branchAdmin" | "superAdmin";
  password: string;
  username: string;
  branchId: string;
  isMfa: string;
  isEnable: boolean;
}

interface AdminResponse {
  admins: BranchAdmin[];
  nextCursor: string | null;
  totalCount: number;
}

export interface LuckyResponse {
  userId: number;
  fullname: string;
  phone: string;
  week: number;
  mostBranchName: string;
}
export interface BranchStockUpdateResponse {
  message: string;
  data: {
    branchStockId: number;
    branchId: string;
    branchName: string;
    isEnable: boolean;
    redeemId: string;
    amount: number;
    gotRedeemded: number;
    updatedAt: string;
  };
  additionalInfo: {
    amount: number | null;
    updatedStatus: boolean;
    isEnable?: boolean;
  };
}

export type Reward = {
  rewardId: number;
  premiumTypeId: number;
  createdAt: string;
  updatedAt: string;
  rewardName: string;
  totalGotRedeem: number;
};

export type RewardRedeemStat = {
  redeemId: string;
  branchId: string;
  gotRedeemded: number;
  sumgotRedeemded: number;
};

export type RewardsRespond = {
  branchStockId: number;
  branchId: string;
  branchName: string;
  redeemId: string;
  gotRedeemded: number;
  amount: number;
  isEnable: boolean;
  updatedAt: string;
};


export type Transaction = {
  branchStockHistoryId: string;
  editDate: string;
  branchId: string;
  adminId: string;
  username: string;
  redeemId: string;
  amount: number;
  updatedStatus: boolean
  isEnable: boolean;
};

export interface ValidatePasswordResponse {
  data: AdminData[];
}

export interface UpdatePasswordResponse {
  message: string;
}
export interface UpdateBranchResponse {
  message: string;
}

export type AdminStatusResponse = {
  response: {
    adminId: string;
    role: string;
    password: string;
    username: string;
    branchId: string;
    createdAt: string;
    isMfa: boolean;
    mfaDate: string;
    secretKey: string;
    isEnable: boolean;
  };
  message: string;
};

interface AdminStore {
  adminData: Partial<AdminData>;
  universalOverlay: boolean;
  setUniversalOverlayTrue: () => void;
  setUniversalOverlayFalse: () => void;
  adminLoginAction: (credentials: {
    username: string;
    password: string;
  }) => Promise<boolean>;
  verifyOtp: (otpInput: string, adminId: string) => Promise<boolean>;
  fetchInitialAllReceipts: (
    pageSize: string,
    receiptNo?: string,
    phone?: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ) => Promise<Partial<ReceiptData>>;
  fetchNextAllReceipts: (
    pageSize: string,
    nextCursor: number,
    receiptNo?: string,
    phone?: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ) => Promise<Partial<ReceiptData>>;
  fetchNextBranchReceipts: (
    branchId: string,
    pageSize: string,
    nextCursor: number,
    receiptNo?: string,
    phone?: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ) => Promise<Partial<ReceiptData>>;
  fetchInitialBranchReceipts: (
    branchId: string,
    pageSize: string,
    receiptNo?: string,
    phone?: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ) => Promise<Partial<ReceiptData>>;
  updateStatusAction: (
    receiptId: number,
    lineId: string,
    newStatus: string,
    receiptNo: string,
    branchName: string,
    storeName: string,
  ) => Promise<boolean>;
  createBranchAdmin: (
    username: string,
    password: string,
    branchId: string,
  ) => Promise<boolean>;
  updateBranchAdmin: (
    adminId: string,
    username: string,
    password: string,
    branchId: string,
    role: string
  ) => Promise<boolean>;
  fetchInitialAdmin: (pageSize: string) => Promise<Partial<AdminResponse>>;
  fetchNextAdmin: (
    pageSize: string,
    nextCursor: string
  ) => Promise<Partial<AdminResponse>>;
  deleteAdmin: (adminId: string) => void;
  fetchInitialAllRedeem: (
    pageSize: string,
    rewardId?: string,
    phone?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Partial<MockRedemptionResponse>>;
  fetchNextAllRedeem: (
    pageSize: string,
    nextCursor: string,
    rewardId?: string,
    phone?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Partial<MockRedemptionResponse>>;
  fetchInitialCustomerAdmin: (
    pageSize: string,
    phone?: string,
    theOne?: "true" | "false" | null,
    orderBy?: "allPoints" | null,
    theOneId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Partial<MockAllCustomersResponse>>;
  fetchNextCustomerAdmin: (
    pageSize: string,
    nextCursor: string,
    phone?: string,
    theOne?: "true" | "false" | null,
    orderBy?: "allPoints" | null,
    theOneId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Partial<MockAllCustomersResponse>>;
  createLuckyByAdmin: (body: {
    phone: string;
    week: number;
  }) => Promise<Partial<LuckyResponse>>;
  updateLuckyByAdmin: (
    body: { phone: string },
    luckyId: number
  ) => Promise<Partial<LuckyResponse>>;
  getLuckyByAdmin: () => Promise<Partial<LuckyResponse[]>>;
  deleteLuckyByAdmin: (phone: string) => void;
  getStockInBranch: (branchId: string) => Promise<Partial<RewardsRespond>>;
  updateStockInBranch: (
    body: { adminId: string; branchId: string; redeemId: string; amount: number; isEnable?: boolean }
  ) => Promise<Partial<BranchStockUpdateResponse>>;
  downloadAllReceipt: (
    receiptNo?: string,
    phone?: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ) => void;
  downloadBranchReceipt: (
    branchId: string,
    receiptNo?: string,
    phone?: string,
    startDate?: string,
    endDate?: string,
    status?: string
  ) => void;
  downloadAllRedeem: (
    phone?: string,
    rewardId?: string,
    startDate?: string,
    endDate?: string
  ) => void;
  downloadBranchRedeem: (
    branchId: string,
    phone?: string,
    rewardId?: string,
    startDate?: string,
    endDate?: string
  ) => void;
  fetchInitialBranchRedeem: (
    branchId: string,
    pageSize: string,
    rewardId?: string,
    phone?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Partial<MockRedemptionResponseBranch>>;
  fetchNextBranchRedeem: (
    branchId: string,
    pageSize: string,
    nextCursor: string,
    rewardId?: string,
    phone?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Partial<MockRedemptionResponseBranch>>;
  downloadCustomerAdmin: (
    phone?: string,
    theOne?: "true" | "false" | null,
    orderBy?: "allPoints" | null,
    theOneId?: string,
    startDate?: string,
    endDate?: string
  ) => void;
  fetchAllStatRedeem: (redeemId: string) => Promise<RewardRedeemStat[]>;
  fetchBranchStatRedeem: (
    redeemId: string,
    branchId: string
  ) => Promise<Partial<RewardRedeemStat[]>>;
  fetchStockTransaction: (branchId: string) => Promise<Partial<Transaction[]>>;
  updateNewBranch: (
    body: { adminId: string, branchId: string }
  ) => Promise<UpdateBranchResponse>;
  updateNewPassword: (
    body: { adminId: string, newPassword: string }
  ) => Promise<UpdatePasswordResponse>;
  validateOldPassword: (
    body: { adminId: string, inputPassword: string }
  ) => Promise<ValidatePasswordResponse>;
  clearAdminData: () => void;
  enableAdmin: (
    adminId: string,
    isEnabled: Boolean
  ) => Promise<AdminStatusResponse>;
  downloadCustomerAdminLuckyDraw: (
    phone?: string,
    theOne?: "true" | "false" | null,
    orderBy?: "allPoints" | null,
    theOneId?: string,
    startDate?: string,
    endDate?: string
  ) => void;
  addStoresBulkAction: (branchId: string, stores: any[]) => Promise<any>;
  uploadStoresExcelAction: (branchId: string, file: File) => Promise<any>;
}

import useAuthStore from "./AuthStore";

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      //states
      adminData: {},
      universalOverlay: false,

      //actions
      setUniversalOverlayTrue: () => set({ universalOverlay: true }),
      setUniversalOverlayFalse: () => set({ universalOverlay: false }),

      adminLoginAction: async (credentials: {
        username: string;
        password: string;
      }) => {
        //ยังไม่ใช้ accessToken
        try {
          const response = await axios.post("/admin/login", credentials);
          //console.log(response);
          const {
            adminId,
            username,
            role,
            branch,
            isEnable,
            isMfa,
            qrCodeUrl,
          } = response.data;
          set({
            adminData: {
              adminId,
              username,
              role,
              branch,
              isEnable,
              isMfa,
              qrCodeUrl: qrCodeUrl || undefined,
            },
          });
          //console.log(adminId);
          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      verifyOtp: async (otpInput: string, adminId: string) => {
        try {
          const { setAccessToken } = useAuthStore.getState();
          const response = await axios.post(
            "/admin/checkmfa",
            { otpInput, adminId },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response && response.data) {
            //console.log("Response data:", response.data);
          }

          if (response?.data?.jwt) {
            //console.log("JWT Token:", response.data.accessToken); // Log the JWT token
            const { jwt } = response.data;
            setAccessToken(jwt);
            return response.data.jwt; // Return the JWT token
          } else {
            throw new Error("JWT Token not found in response.");
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      fetchInitialAllReceipts: async (
        pageSize: string,
        receiptNo?: string,
        phone?: string,
        startDate?: string,
        endDate?: string,
        status?: string
      ) => {
        const accessToken = useAuthStore.getState().accessToken;
        const params: Record<string, string | undefined> = { pageSize };

        if (receiptNo) params.receiptNo = receiptNo;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.status = status;

        try {
          const response = await axiosInceptor.get(`/admin/receipt`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params,
          });

          // console.log(`API URL: /receipts/all`, {
          //   params,
          // });
          // console.log("fetchInitialAllReceipts");
          return response.data;
        } catch (error) {
          //console.error("Error fetching receipts:", error);
          throw error;
        }
      },
      fetchNextAllReceipts: async (
        pageSize: string,
        nextCursor: number,
        receiptNo?: string,
        phone?: string,
        startDate?: string,
        endDate?: string,
        status?: string
      ) => {
        const accessToken = useAuthStore.getState().accessToken;
        const params: Record<string, string | number | undefined> = {
          pageSize,
          cursor: nextCursor,
        };

        if (receiptNo) params.receiptNo = receiptNo;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.status = status;

        try {
          const response = await axiosInceptor.get(`/admin/receipt`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params,
          });

          // console.log(`API URL: /receipts/all`, {
          //   params,
          // });
          // console.log("fetchNextAllReceipts");
          return response.data;
        } catch (error) {
          //console.error("Error fetching next receipts:", error);
          throw error;
        }
      },
      fetchInitialBranchReceipts: async (
        branchId: string,
        pageSize: string,
        receiptNo?: string,
        phone?: string,
        startDate?: string,
        endDate?: string,
        status?: string
      ) => {
        const params: Record<string, string | number | undefined> = {
          branchId,
          pageSize,
        };

        if (receiptNo) params.receiptNo = receiptNo;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.status = status;
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `admin/receipt`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
            }
          );

          // console.log(`API URL: /receipts/branch`, {
          //   params,
          // });
          // console.log("fetchInitialBranchReceipts");
          return response.data;
        } catch (error) {
          //console.error("Error fetching branch receipts:", error);
          throw error;
        }
      },
      fetchNextBranchReceipts: async (
        branchId: string,
        pageSize: string,
        nextCursor: number,
        receiptNo?: string,
        phone?: string,
        startDate?: string,
        endDate?: string,
        status?: string
      ) => {
        const params: Record<string, string | number | undefined> = {
          branchId,
          pageSize,
          cursor: nextCursor,
        };

        if (receiptNo) params.receiptNo = receiptNo;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.status = status;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/admin/receipt`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
            }
          );

          // console.log(`API URL: /receipts/branch`, {
          //   params,
          // });
          // console.log("fetchNextBranchReceipts");
          return response.data;
        } catch (error) {
          //console.error("Error fetching branch next receipts:", error);
          throw error;
        }
      },
      updateStatusAction: async (
        receiptId: number,
        lineId: string,
        newStatus: string,
        receiptNo: string,
        branchName: string,
        storeName: string,
      ) => {
        try {
          const requestBody = {
            receiptId,
            lineId,
            newStatus,
            receiptNo,
            branchName,
            storeName,
          };
          const accessToken = useAuthStore.getState().accessToken;
          await axiosInceptor.post("/admin/status", requestBody, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      createBranchAdmin: async (
        username: string,
        password: string,
        branchId: string,
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.post(
            "/admin/create",
            { username, password, branchId },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response && response.data.adminData) {
            //console.log("Response data:", response.data);
            return true;
          } else {
            return false;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      updateBranchAdmin: async (
        adminId: string,
        username: string,
        password: string,
        branchId: string,
        role: string
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.patch(
            `/admin/${adminId}`, // Ensure this URL is correct
            { username, password, branchId, role },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response && response.data) {
            //console.log("Response data:", response.data);
            return true;
          } else {
            return false;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      fetchInitialAdmin: async (pageSize: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/admin/list`, {
            params: { pageSize },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log("fetchInitialAdmin");
          // console.log(`/admin/list?${pageSize}`);
          return response.data;
        } catch (error) {
          //console.error("Error fetchInitialAdmin:", error);
          throw error;
        }
      },
      fetchNextAdmin: async (pageSize: string, nextCursor: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/admin/list`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { pageSize, cursor: nextCursor },
          });

          // console.log(`/admin/list?pageSize=${pageSize}&cursor=${nextCursor}`);
          // console.log("fetchNextAdmin");
          return response.data;
        } catch (error) {
          //console.error("Error fetching branch next receipts:", error);
          throw error;
        }
      },
      deleteAdmin: async (adminId: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.delete(`/admin/${adminId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log(`Admin with ID ${adminId} deleted successfully.`);
          return response.data;
        } catch (error) {
          //console.error(`Error deleting admin with ID ${adminId}:`, error);
          throw error;
        }
      },
      fetchInitialAllRedeem: async (
        pageSize: string,
        rewardId?: string,
        phone?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | number | undefined> = {
          pageSize,
        };

        if (rewardId) params.rewardId = rewardId;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/admin/claimed`, {
            params,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log("fetchInitialAllRedeem");
          // console.log(`API URL: /redeem-history`, {
          //   params,
          // });
          return response.data;
        } catch (error) {
          //console.error("Error fetchInitialAllRedeem:", error);
          throw error;
        }
      },
      fetchNextAllRedeem: async (
        pageSize: string,
        nextCursor: string,
        rewardId?: string,
        phone?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | number | undefined> = {
          pageSize,
          cursor: nextCursor,
        };

        if (rewardId) params.rewardId = rewardId;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/admin/claimed`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params,
          });

          // console.log(`API URL: /redeem-history`, {
          //   params,
          // });
          // console.log("data: ", response.data);
          // console.log("fetchNextAllRedeem");
          return response.data;
        } catch (error) {
          //console.error("Error fetchNextAllRedeem:", error);
          throw error;
        }
      },
      fetchInitialCustomerAdmin: async (
        pageSize: string,
        phone?: string,
        theOne?: "true" | "false" | null,
        orderBy?: "allPoints" | null,
        theOneId?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | undefined> = {
          pageSize,
        };

        if (phone) params.phone = phone;
        if (theOne) params.theOne = theOne;

        // Sort logic

        if (orderBy) params.orderBy = orderBy;
        if (theOneId) params.theOneId = theOneId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/admin/customer`, {
            params,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log("fetchInitialCustomerAdmin");
          // console.log(`API URL: /admin/customer`, {
          //   params,
          // });
          return response.data;
        } catch (error) {
          //console.error("Error fetchInitialCustomerAdmin:", error);
          throw error;
        }
      },
      fetchNextCustomerAdmin: async (
        pageSize: string,
        nextCursor: string,
        phone?: string,
        theOne?: "true" | "false" | null,
        orderBy?: "allPoints" | null,
        theOneId?: string,
        startDate?: string,
        endDate?: string
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const params: Record<string, string | undefined> = {
            pageSize,
            cursor: nextCursor,
          };

          if (phone) params.phone = phone;
          if (theOne) params.theOne = theOne;

          // Sort logic
          if (orderBy) params.orderBy = orderBy;
          if (theOneId) params.theOneId = theOneId;
          if (startDate) params.startDate = startDate;
          if (endDate) params.endDate = endDate;
          const response = await axiosInceptor.get(`/admin/customer`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params,
          });

          // console.log(`API URL: /admin/customer`, {
          //   params,
          // });
          // console.log("fetchNextCustomerAdmin");
          return response.data;
        } catch (error) {
          //console.error("Error fetchNextCustomerAdmin:", error);
          throw error;
        }
      },
      createLuckyByAdmin: async (body: { phone: string, week: number }) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.post("/admin/lucky/create", body, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = response.data.data;

          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      updateLuckyByAdmin: async (body: { phone: string }, luckyId: number) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.patch(
            `/user/lucky-user/${luckyId}`,
            body,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const data = response.data;

          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      getLuckyByAdmin: async () => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get("/admin/lucky/get", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = response.data;

          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      deleteLuckyByAdmin: async (phone: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.delete(
            `/admin/lucky/delete?phone=${phone}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const data = response.data;

          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      getStockInBranch: async (branchId: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/branch/stock/${branchId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = response.data;
          //console.log(`getStockInBranch URL :/stock/${branchId}`);
          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      updateStockInBranch: async (
        body: { adminId: string; branchId: string; redeemId: string; amount: number; isEnable?: boolean }
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.post(
            `/branch/stock/update`,
            body,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const data = response.data;
          // console.log(
          //   `updateStockInBranch URL :/stock/add/${branchId}/${rewardId}`
          // );

          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      // Download excel
      downloadAllReceipt: async (
        receiptNo?: string,
        phone?: string,
        startDate?: string,
        endDate?: string,
        status?: string
      ) => {
        const params: Record<string, string | undefined> = {};

        if (receiptNo) params.receiptNo = receiptNo;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.status = status;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/admin/download/receipts`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "AllReceipt.xlsx";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // console.log(`API URL: /receipts/download-excel-all`, {
          //   params,
          // });
          // console.log("downloadAllReceipt");
        } catch (error) {
          //console.error("Error fetching receipts:", error);
          throw error;
        }
      },
      downloadBranchReceipt: async (
        branchId: string,
        receiptNo?: string,
        phone?: string,
        startDate?: string,
        endDate?: string,
        status?: string
      ) => {
        const accessToken = useAuthStore.getState().accessToken;
        const params: Record<string, string | undefined> = {};
        if (branchId) params.branchId = branchId;
        if (receiptNo) params.receiptNo = receiptNo;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status) params.status = status;

        try {
          const response = await axiosInceptor.get(
            `/admin/download/receipts`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `BranchReceipt${branchId}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // console.log(`API URL: /receipts/download-excel-all`, {
          //   params,
          // });
          // console.log("downloadBranchReceipt");
        } catch (error) {
          //console.error("Error fetching receipts:", error);
          throw error;
        }
      },
      downloadAllRedeem: async (
        phone?: string,
        rewardId?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const accessToken = useAuthStore.getState().accessToken;
        const params: Record<string, string | undefined> = {};

        if (phone) params.phone = phone;
        if (rewardId) params.rewardId = rewardId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        try {
          const response = await axiosInceptor.get(
            `/admin/download/claimed`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "AllRedeem.xlsx";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // console.log(`API URL: /admin/download-redeem-all`, {
          //   params,
          // });
          // console.log("downloadAllRedeem");
        } catch (error) {
          //console.error("Error fetching redeem:", error);
          throw error;
        }
      },
      downloadBranchRedeem: async (
        branchId: string,
        phone?: string,
        rewardId?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | undefined> = {};

        if (branchId) params.branchId = branchId;
        if (phone) params.phone = phone;
        if (rewardId) params.rewardId = rewardId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/admin/download/claimed`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `BranchRedeem${branchId}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // console.log(`API URL: /admin/download-redeem-branch/${branchId}`, {
          //   params,
          // });
          // console.log("downloadBranchRedeem");
        } catch (error) {
          //console.error("Error fetching receipts:", error);
          throw error;
        }
      },
      fetchInitialBranchRedeem: async (
        branchId: string,
        pageSize: string,
        rewardId?: string,
        phone?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | number | undefined> = {
          pageSize,
          branchId
        };

        if (phone) params.phone = phone;
        if (rewardId) params.rewardId = rewardId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/admin/claimed`,
            {
              params,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // console.log("fetchInitialBranchRedeem");
          // console.log(`API URL: /admin/redemption/${branchId}`, {
          //   params,
          // });
          return response.data;
        } catch (error) {
          //console.error("Error fetchInitialBranchRedeem:", error);
          throw error;
        }
      },
      fetchNextBranchRedeem: async (
        branchId: string,
        pageSize: string,
        nextCursor: string,
        rewardId?: string,
        phone?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | number | undefined> = {
          pageSize,
          branchId,
          cursor: nextCursor,
        };
        if (nextCursor !== undefined) params.nextCursor = nextCursor;
        if (rewardId) params.rewardId = rewardId;
        if (phone) params.phone = phone;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/admin/claimed`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              params,
            }
          );

          // console.log(`API URL: /admin/admin/redemption/${branchId}`, {
          //   params,
          // });
          // console.log("data: ", response.data);
          // console.log("fetchNextBranchRedeem");
          return response.data;
        } catch (error) {
          //console.error("Error fetchNextBranchRedeem:", error);
          throw error;
        }
      },
      downloadCustomerAdmin: async (
        phone?: string,
        theOne?: "true" | "false" | null,
        orderBy?: "allPoints" | null,
        theOneId?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | undefined> = {};

        if (phone) params.phone = phone;
        if (theOne) params.theOne = theOne;
        if (theOneId) params.theOneId = theOneId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (orderBy) params.orderBy = orderBy;

        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/admin/download/customers`, {
            params,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            responseType: "blob",
          });

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Customers.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          throw error;
        }
      },

      fetchAllStatRedeem: async (redeemId: string) => {
        const accessToken = useAuthStore.getState().accessToken;

        try {
          const response = await axiosInceptor.get(`/admin/got-redeem?redeemId=${redeemId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log(`API URL: /admin/redeem-static`);
          // console.log("fetchInitialAllReceipts");
          return response.data;
        } catch (error) {
          //console.error("Error fetching receipts:", error);
          throw error;
        }
      },
      fetchBranchStatRedeem: async (redeemId: string, branchId: string) => {
        const accessToken = useAuthStore.getState().accessToken;

        try {
          const response = await axiosInceptor.get(`/admin/got-redeem?redeemId=${redeemId}&branchId=${branchId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // console.log(`API URL: /admin/redeem-static?branchId=${branchId}`);
          // console.log("fetchInitialAllReceipts");
          return response.data;
        } catch (error) {
          //console.error("Error fetching receipts:", error);
          throw error;
        }
      },
      fetchStockTransaction: async (branchId: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/branch/stock/hist/${branchId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // console.log("fetchStockTransaction");
          // console.log(`/stock/history/${branchId}`);
          return response.data;
        } catch (error) {
          //console.error("Error fetchInitialAdmin:", error);
          throw error;
        }
      },
      validateOldPassword: async (
        body: { adminId: string, inputPassword: string }
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.post(
            `/admin/check`,
            body,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response && response.data) {
            // console.log("Response data:", response.data);
            return response.data;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      updateNewPassword: async (
        body: { adminId: string, newPassword: string }
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.patch(
            `/admin/update`,
            body,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response && response.data) {
            //console.log("Response data:", response.data);
            return response.data;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      updateNewBranch: async (
        body: { adminId: string, branchId: string }
      ) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.patch(
            `/admin/update`,
            body,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (response && response.data) {
            //console.log("Response data:", response.data);
            return response.data;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              // console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      clearAdminData: () => {
        //console.log("adminData cleared");
        set({ adminData: {} });
      },
      enableAdmin: async (adminId: string, isEnabled: Boolean) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.patch(
            `/admin/update`,
            { adminId, isEnable: isEnabled },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              }, // Convert boolean to string
            }
          );
          //console.log("update enable admin");
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              //console.log(error.response.data);
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      downloadCustomerAdminLuckyDraw: async (
        phone?: string,
        theOne?: "true" | "false" | null,
        orderBy?: "allPoints" | null,
        theOneId?: string,
        startDate?: string,
        endDate?: string
      ) => {
        const params: Record<string, string | undefined> = {};

        if (phone) params.phone = phone;
        if (theOne) params.theOne = theOne;
        if (theOneId) params.theOneId = theOneId;

        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (orderBy) params.orderBy = orderBy;
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/admin/download/luckydraw`,
            {
              params,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Customers.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          throw error;
        }
      },
      addStoresBulkAction: async (branchId: string, stores: any[]) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.post(
            "/admin/store/add",
            { branchId, stores },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      },
      uploadStoresExcelAction: async (branchId: string, file: File) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const formData = new FormData();
          formData.append("file", file);
          const response = await axiosInceptor.post(
            `/admin/store/upload?branchId=${branchId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          return response.data;
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: "admin-storage",
    }
  )
);
