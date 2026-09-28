import express from 'express'
import { getDesignDataByCategoryCode , 
    save_design_to_cart, 
    getCartById , 
    updateCart,
    updateDesign,
    getDesignById,
    getAllCustomCart,
    shareDesign,
    save_design_to_product,
    save_images
 } from '../controllers/designController.js'
 import formidable from "express-formidable";

const router = express.Router()

router.get('/get-properties',  getDesignDataByCategoryCode)
router.post('/product-design' , save_design_to_product)
router.post('/addToCart' ,  save_design_to_cart)
router.get('/getCart/:cartId' , getCartById)
router.put('/updateCart/:cartId', updateCart)
router.get('/getDesign/:designId' , getDesignById)
router.put('/updateDesign/:designId', updateDesign)
router.post('/getAllCustomCart', getAllCustomCart)
router.post('/share' , shareDesign)
router.post('/save-images' , 
    
    save_images)

export default router