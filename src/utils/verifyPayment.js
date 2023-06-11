import razorpay from "razorpay";
import crypto from "crypto";
import config from "../config/index.js";
import CustomError from "../services/CustomError.js";

const verifyPayment = async (paymentData) => {
    const { transactionId, razorpay_payment_id, razorpay_signature } = paymentData;
  
    const generatedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_SECRET)
      .update(`${transactionId}|${razorpay_payment_id}`)
      .digest("hex");
  
    if (generatedSignature === razorpay_signature) {
      return true;
    } else {
      throw new CustomError("Payment verification failed", 400);
    }
};

export default verifyPayment