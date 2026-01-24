// src/hooks/useWebSocket.ts
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useUserStore } from "../src/store/userStore"; // adjust path if needed
import type { Receipt } from "../src/pages/ReceiptHistory"; // or wherever your Receipt interface is

const SOCKET_URL = import.meta.env.VITE_BASE_URL; // Adjust to your NestJS server's URL

/**
 * Custom hook to listen for real-time updates via WebSocket.
 * @param lineId - The user’s lineId (unique identifier).
 * @param setItems - (Optional) A React setState function to update the receipt list in real-time.
 */
export function useWebSocket(
  lineId: string,
  setItems?: React.Dispatch<React.SetStateAction<Receipt[]>>
) {
  // Zustand action to update user’s points/rights
  const updateUserData = useUserStore((state) => state.updateUserData);

  useEffect(() => {
    // Only connect if we have a valid lineId
    if (!lineId) return;

    const socket = io(SOCKET_URL);

    // 1) Listen for user info (points/rights) updates
    socket.on(`user-info-${lineId}`, (data) => {
      console.log("WebSocket user info update:", data);
      // data.user should contain the updated user fields (e.g. currentPoints, accPoints, etc.)
      if (data?.user) {
        updateUserData({
          accPoints: data.user.accPoints,
          rights: data.user.rights,
          accRights: data.user.accRights,
        });
      }
    });

    // 2) Listen for real-time receipt updates
    if (setItems) {
      socket.on(`receipt-update-${lineId}`, (updatedReceipt) => {
        console.log("Receipt updated:", updatedReceipt);
        // Merge the updated fields into the correct receipt in your `items` array
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.receiptId === updatedReceipt.receiptId
              ? { ...item, ...updatedReceipt }
              : item
          )
        );
      });
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [lineId, setItems, updateUserData]);
}
