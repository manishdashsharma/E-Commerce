import asyncHandler from '../services/asyncHandler.js'
import CustomError from '../services/CustomError.js'
import Order from '../models/order.schema.js'
import Product from '../models/product.schema.js'
import Coupon from '../models/coupon.schema.js'
import OrderStatus from '../utils/orderStatus.js'
import verifyPayment from '../utils/verifyPayment.js'
import razorpay from './../config/razorpay.config.js';


export const createOrder = asyncHandler(async (req, res) => {
    const { products, couponCode } = req.body;
    
    if (!products || products.length === 0) {
      throw new CustomError("No products found", 400);
    }
  
    let totalAmount = 0;
    let discountAmount = 0;
  
    let productPriceCalc = Promise.all(
        products.map(async (product) => {
            const {productId, count} = product;
            const productFromDB = await Product.findById(productId)
            if (!productFromDB) {
                throw new CustomError("No product found", 400)
            }
            if (productFromDB.stock < count) {
                return res.status(400).json({
                    error: "Product quantity not in stock"
                })
            }
            totalAmount += productFromDB.price * count
        })
    )

    await productPriceCalc;
  
    const coupon = await Coupon.findOne({ code: couponCode });
  
    if (coupon) {
      discountAmount = coupon.discount;
    }
  
    const options = {
      amount: totalAmount - discountAmount,
      currency: "INR",
      receipt: `receipt_${new Date().getTime()}`,
    };
    
    const order = await razorpay.orders.create(options)

    if (!order) {
        throw new CustomError("Unable to generate order", 400)
    }

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order
    });
  });
  
  export const placeOrder = asyncHandler(async (req, res) => {
    const { transactionId, products, userId, address, phoneNumber, amount, coupon ,razorpay_payment_id, razorpay_signature} = req.body

    if(!razorpay_payment_id || !razorpay_signature) {
        throw new CustomError("Provide the all fields",400)
    }

    const order = await Order.create({
        transactionId, products, userId, address, phoneNumber, amount, coupon
    })

    let updateProducts = Promise.all(products.map(async (product) => {
        const { productId, count } = product;
        const productFromDB = await Product.findById(productId)
        if (!productFromDB) {
            throw new CustomError("Product not found", 404);
        }
        if (productFromDB.stock < count) {
            throw new CustomError("Out of stock", 404);
        }
        productFromDB.stock = productFromDB.stock - count;
        productFromDB.sold = productFromDB.sold + 1;
        await productFromDB.save();
    }))

    await updateProducts;

    const paymentData = {
        transactionId,
        razorpay_payment_id,
        razorpay_signature,
    };

    await verifyPayment(paymentData)

    res.status(200).json({
        success: true,
        message: "Order placed successfully!",
        order , 
        payment : true
    })

})

export const getMyOrders = asyncHandler(async(req, res) => {
    const { id: userId } = req.params

    if(!userId){
        throw new CustomError("Provide orderId",404)
    }

    const orders = await Order.find({ userId });
    if (!orders) {
        throw new CustomError("No orders found!");
    }

    res.status(200).json({
        success: true,
        orders
    }) 
})

export const getAllOrders = asyncHandler(async(req, res) => {
    const orders = await Order.find({})

    if (!orders) {
        throw new CustomError("No Orders found!");
    }

    res.status(200).json({
        success: true,
        orders
    })
})

export const updateOrderStatus = asyncHandler(async(req, res) => {
    const { status } = req.body
    const { id: orderId } = req.params

    if(!status){
        throw new CustomError("Order Status required",400);
    }

    if (!OrderStatus[status]) {
        throw new CustomError("Invalid Status",400);
    }

    const order = await Order.findByIdAndUpdate(orderId, { status },
        {
            new: true,
            runValidators: true
        });

    if (!order) {
        throw new CustomError("Order not found!", 404);
    }

    res.status(200).json({
        success:true,
        message:"Order status updated",
        order
    })
})