// services/auth.ts
export const sendOTP = async (email: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.includes("@")) {
          console.log(`Mock: OTP sent to ${email}`);
          resolve({ success: true });
        } else {
          reject({ message: "Invalid email address" });
        }
      }, 1000); // Simulate network delay
    });
  };
  
  export const verifyOTP = async (email: string, otp: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === "123456") {
          console.log(`Mock: OTP verified for ${email}`);
          resolve({ success: true });
        } else {
          reject({ message: "Invalid OTP" });
        }
      }, 1000);
    });
  };
  