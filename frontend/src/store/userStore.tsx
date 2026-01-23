import {create} from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import useAuthStore from "./AuthStore";
import axiosInceptor from "../utils/axiosInterceptor";

// interface RedeemItem {
//   premiumTypeId: number;
//   premiumTypeName: string;
//   requirePoints: number;
//   eligibleAt: string;
// }

interface RedeemItemAvailable {
  branchId:string;
  redeemId: number;
  anpaoName: string;
  remainStock: number;
  isEnable: boolean;
  gotRedeem: number;
  updatedAt: string;
}

interface ConfirmRedeemResponse {
  message: string;
  remainingPoints: number;
  remainingRedeemRight: number;
}

export type UserProfileResponse = {
  response: {
    userId: string;
    fullname: string;
    phone: string;
    email: string;
    lineId: string;
    lineProfilePic: string;
    currentPoints: number;
    accPoints: number;
    allPoints: number;
    accumulatedPoints: number;
    isTheOne: boolean;
    createdAt: string;
    updatedAt: string;
    isLucky: boolean;
    rights: number;
    accRights:number;
    redeemedAnpao: number;
  };
  message: string;
};

interface UserState {
  userId: string;
  fullname: string;
  phone: string;
  email: string;
  currentPoints: number;
  accPoints: number;
  allPoints: number;
  lineId: string;
  lineProfilePic: string;
  isTheOne: boolean;
  createdAt: string;
  updatedAt: string;
  rights: number;
  accRights:number;
  isLucky:boolean;
  redeemedAnpao: number;
  selectedRedeemId: number | null;
  selectedAnpaoName: string | null;
  uploadCurrentBranch: string;
  setLineId: (lineIdFromInput: string) => void;
  setUploadCurrentBranch: (current: string) => void;
  setLineProfilePic: (linePicUrl: string) => void;
  setUserId: (newUserId: string) => void;
  fetchUserRights: () => Promise<void>;
  // getAvailablePremium: (userIdgetAvailableRewardsInBranch: string) => Promise<RedeemItem[] | undefined>;
  getAvailableRewardsInBranch: (
    branchId: string
  ) => Promise<RedeemItemAvailable[] | undefined>;
  // getAvailableMovieTicketsInBranch: (
  //   branchId: string
  // ) => Promise<RedeemItemAvailable[] | undefined>;
  setSelectedReward: (redeemId: number, anpaoName: string) => void;
  confirmRedeem: (
    userId: string,
    redeemId: number,
    branchId: string,
  ) => Promise<ConfirmRedeemResponse | undefined>;
  confirmLoginWithLineId: (
    lineId: string,
    lineProfilePic?: string
  ) => Promise<string | void>;
  updateLineProfile: (
    userId: string,
    lineProfilePic: string
  ) => Promise<UserProfileResponse>;
  updateUserData: (updatedUser: Partial<UserState>) =>void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      //states
      userId: "",
      fullname: "",
      phone: "",
      email: "",
      lineId: "",
      lineProfilePic: "",
      isLucky:false,
      currentPoints: 0,
      accPoints: 0,
      allPoints: 0,
      selectedRedeemId: null,
      selectedAnpaoName: null,
      uploadCurrentBranch: "",
      isTheOne:false,
      createdAt:"",
      updatedAt:"",
      rights:0,
      accRights: 0,
      redeemedAnpao: 0,
      //actions
      //retrive userId after login to update userId global state
      setUploadCurrentBranch: (current: string) =>
        set({ uploadCurrentBranch: current }),
      setLineId: (lineIdFromInput: string) => set({ lineId: lineIdFromInput }),
      setLineProfilePic: (linePicUrl: string) =>
        set({ lineProfilePic: linePicUrl }),
      setUserId: (newUserId: string) => set({ userId: newUserId }),
      updateUserData: (updatedUser: Partial<UserState>) => {
           set((state) => ({
                ...state,
           ...updatedUser,
         }));
      },
      fetchUserRights: async () => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(`/user/info`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          set({
            userId: response.data.user.userId,
            fullname: response.data.user.fullname,
            phone: response.data.user.phone,
            email: response.data.user.email,
            currentPoints: response.data.user.currentPoints,
            accPoints: response.data.user.accPoints,
            allPoints: response.data.user.allPoints,
            lineId: response.data.user.lineId,
            lineProfilePic: response.data.user.lineProfilePic,
            rights: response.data.user.rights,
            accRights: response.data.user.accRights,
            isLucky: response.data.user.isLucky,
            createdAt: response.data.user.createdAt,
            redeemedAnpao: response.data.user.redeemedAnpao
          });
        } catch (error) {
          console.error("Error fetching user rights:", error);
        }
      },
      // getAvailablePremium: async (userId) => {
      //   try {
      //     const accessToken = useAuthStore.getState().accessToken;
      //     const response = await axiosInceptor.get(
      //       `/redeem/available/${userId}`,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${accessToken}`,
      //         },
      //       }
      //     );
      //     return response.data;
      //   } catch (error) {
      //     console.error("Error getAvailablePremium", error);
      //   }
      // },
      getAvailableRewardsInBranch: async (branchId) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.get(
            `/anpao/available/${branchId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          return response.data.anpaoAvailable;
        } catch (error) {
          console.error("Error getAvailableRewardsInBranch", error);
        }
      },
      // getAvailableMovieTicketsInBranch: async (branchId) => {
      //   try {
      //     const accessToken = useAuthStore.getState().accessToken;
      //     const response = await axiosInceptor.get(
      //       `/redeem/movieticket/${branchId}`,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${accessToken}`,
      //         },
      //       }
      //     );
      //     return response.data.MovieTicket;
      //   } catch (error) {
      //     console.error("Error getAvailableMovieTicketsInBranch", error);
      //   }
      // },
      setSelectedReward: (redeemId: number, anpaoName: string) => {
        set({
          selectedRedeemId: redeemId,
          selectedAnpaoName: anpaoName,
        });
      },
      confirmRedeem: async (
        userId: string,
        redeemId: number,
        branchId: string,
      ) => {
        const accessToken = useAuthStore.getState().accessToken;
        try {
          const response = await axiosInceptor.post(
            `/anpao/redeem`,
            {
              userId,
              redeemId,
              branchId,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`, // Set the Bearer token in the header
                "Content-Type": "application/json", // Set content type if needed
              },
            }
          );
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
      confirmLoginWithLineId: async (lineId: string, lineProfilePic?: string) => {
        try {
          const { setAccessToken } = useAuthStore.getState();
          const response = await axios.post(
            `/user/login`,
            {
              lineId,
              lineProfilePic,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      
          if (response?.data?.response) {
            const userData = response.data.response;
            const jwt = response.data.response.jwt;
      
            // Set user details in the store if available
            if (userData) {
              set({
                userId: userData.userId,
                fullname: userData.fullname,
                phone: userData.phone,
                email: userData.email,
                currentPoints: userData.currentPoints,
                accPoints: userData.accPoints,
                allPoints: userData.allPoints,
                lineId: userData.lineId,
                lineProfilePic: userData.lineProfilePic,
                accRights: userData.accRights,
                rights: userData.rights,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
              });
            }
      
            // Set access token in the auth store if available
            if (jwt) {
              setAccessToken(jwt);
              return jwt; // Return the JWT token for use in the frontend
            } else {
              throw new Error("JWT Token not found in response.");
            }
          } else {
            throw new Error("Invalid response structure received from backend.");
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              return Promise.reject(error.response.data);
            } else if (error.request) {
              return Promise.reject("No response received from the server.");
            }
          }
          return Promise.reject("An unknown error occurred.");
        }
      },
      
      // requestOtp: async (phone: string) => {
      //   try {
      //     // Get app_id and message_id from environment variables
      //     const app_id = import.meta.env.VITE_APP_ID;
      //     const message_id = import.meta.env.VITE_MESSAGE_ID;
      //     const bearerToken = import.meta.env.VITE_TOKEN_OTP;

      //     // Check if environment variables are available
      //     if (!app_id || !message_id) {
      //       throw new Error(
      //         "Missing environment variables: VITE_APP_ID or VITE_MESSAGE_ID"
      //       );
      //     }
      //     const formattedPhone = phone.startsWith("0")
      //       ? phone.replace(/^0/, "66")
      //       : phone;
      //     const body = {
      //       app_id,
      //       message_id,
      //       message: "รหัส OTP ของท่านคือ $(otp) รหัสอ้างอิง ref($(ref_code))",
      //       to: formattedPhone,
      //       sender: "Test",
      //     };
      //     const response = await axios.post(
      //       "https://otp2.sc4msg.com/api/v1/verify/request",
      //       body,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${bearerToken}`,
      //           "Content-Type": "application/json",
      //         },
      //       }
      //     );
      //     if (response && response.data) {
      //       //console.log("Response data:", response.data);
      //       return response.data;
      //     }
      //   } catch (error) {
      //     if (axios.isAxiosError(error)) {
      //       if (error.response) {
      //         //console.log(error.response.data);
      //         return Promise.reject(error.response.data);
      //       } else if (error.request) {
      //         return Promise.reject("No response received from the server.");
      //       }
      //     }
      //     return Promise.reject("An unknown error occurred.");
      //   }
      // },

      // verifyPhoneOtp: async (requestId: string, otp: string) => {
      //   try {
      //     const bearerToken = import.meta.env.VITE_TOKEN_OTP;
      //     const body = {
      //       requestId,
      //       code: otp,
      //     };
      //     const response = await axios.post(
      //       "https://otp2.sc4msg.com/api/v1/verify/check",
      //       body,
      //       {
      //         headers: {
      //           Authorization: `Bearer ${bearerToken}`,
      //           "Content-Type": "application/json",
      //         },
      //       }
      //     );
      //     if (response && response.data.status === 0) {
      //       //console.log("Response data:", response.data);
      //       return response.data;
      //     } else {
      //       //console.log("fail to verify otp");
      //       return false;
      //     }
      //   } catch (error) {
      //     if (axios.isAxiosError(error)) {
      //       if (error.response) {
      //         //console.log(error.response.data);
      //         return Promise.reject(error.response.data);
      //       } else if (error.request) {
      //         return Promise.reject("No response received from the server.");
      //       }
      //     }
      //     return Promise.reject("An unknown error occurred.");
      //   }
      // },
      updateLineProfile: async (userId: string, lineProfilePic: string) => {
        try {
          const accessToken = useAuthStore.getState().accessToken;
          const response = await axiosInceptor.patch(
            `/user/profile/${userId}`,
            { lineProfilePic },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
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
    }),
    {
      name: "user-storage",
    }
  )
);
