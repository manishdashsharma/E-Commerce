import Coupon from '../models/coupon.schema.js'
import asyncHandler from '../servies/asyncHandler.js'
import CustomError from '../servies/CustomError.js'

export const coupon = asyncHandler( async(req, res) => {
    const { discount , code } = req.body

    if (!code || !discount){
        throw new CustomError("Code and discount are required",400)
    }

    const isCouponExist = await Coupon.findOne({code})
    if (!isCouponExist){
        throw new CustomError("All ready exist",400)
    }

    const coupon = await Coupon.create({
        code,
        discount,
    })

    res.status(200).json({
        success: true,
        message: "Coupon created successfully",
        coupon
    })
})

export const updateCoupon = asyncHandler( async(req, res) =>{
    const {id: couponId} = req.params
    const {action} = req.body

    const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        {
            active : action
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!coupon) {
        throw new CustomError("Coupon not found", 404)
    }

    res.status(200).json({
        success: true,
        message: "Coupon updated",
        coupon
    })
})

export const deleteCoupon = asyncHandler(async(req, res) => {
    const {id: couponId} = req.params

    const coupon = await Coupon.findByIdAndDelete(couponId)

    if (!coupon) {
        throw new CustomError("Coupon not found", 404)
    }

    res.status(200).json({
        success: true,
        message: "Coupon deleted",
        
    })
})

export const getAllCoupons = asyncHandler( async (req, res) => {
    const allCoupons = await Coupon.find();

    if (!allCoupons) {
        throw new CustomError("No Coupons found", 400)
        
    }

    res.status(200).json({
        success: true,
        allCoupons
    })
    
})