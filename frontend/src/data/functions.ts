import axios from "axios";
import Swal from "sweetalert2";

export const formatDateToYYYYMMDD = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    console.error("Invalid date provided:", date);
    return "Invalid date provided:";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const censorString = (input: string) => {
  // phone number (only digits)
  if (/^\d+$/.test(input)) {
    // Censor digits except the first 3 and last 2
    return input.replace(/(\d{3})\d*(\d{2})/, "$1*****$2");
  }

  // For other types of text
  return input
    .split(" ")
    .map((word) => {
      if (word.length <= 2) {
        // If the word length is 2 or less, keep it as is
        return word;
      } else if (word.length <= 4) {
        // If the word length is 3 or 4, censor the middle character(s)
        return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
      } else {
        // For longer words, keep the first 3 characters and last 2 characters visible, censor the middle
        const start = word.slice(0, Math.ceil(word.length / 3));
        const end = word.slice(-Math.ceil(word.length / 3));
        return (
          start + "*".repeat(word.length - start.length - end.length) + end
        );
      }
    })
    .join(" ");
};

// Mockup API function
export const delay = () => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

// Example usage
export async function mockApiCall() {
  console.log("Start");
  await delay();
  console.log("End");
}

//  Swal alert
export const showAlert = (
  text: string,
  icon: "error" | "success",
  onConfirm?: (() => void)[]
) => {
  Swal.fire({
    icon: icon,
    text: text,
    confirmButtonText: "ยืนยัน",
    customClass: {
      htmlContainer: "font-kanit",
      confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
    },
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm.forEach((fn) => fn()); //accept multiple functions
    }
  });
};

// Swal error
export const handleError = (error: unknown) => {
  let errorMessage = "An unknown error occurred";

  if (axios.isAxiosError(error)) {
    // If error is a structured Axios error, check if we have a message field in the response
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      // Fallback to a generic error field if message is not available
      errorMessage = error.response.data.error;
    } else {
      errorMessage = error.message || "An unknown error occurred";
    }
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    // If error was manually rejected with an object containing a message field
    errorMessage = (error as { message: string }).message;
  } else if (error instanceof Error) {
    // Fallback to standard error object message
    errorMessage = error.message;
  }

  console.error("Error occurred:", errorMessage);
  showAlert(errorMessage, "error");
};

//format date time
export const formatThaiDateTime = (date: Date | string): string => {
  return (
    new Date(date).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false, // 24-hour format
    }) + " น."
  ); // Append "น." at the end
};

//format , in number or string
export function formatNumber(value: number | string): string {
    const number = typeof value === "string" ? parseFloat(value) : value;


    if (isNaN(number)) {
      return "Invalid number";
    }
  
    return number.toLocaleString();
}