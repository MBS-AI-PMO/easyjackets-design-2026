import express from 'express'
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js'
import { emailFormLimit } from '../middlewares/rateLimit.js'
import { getDesignDataByCategoryCode ,
    save_design_to_cart,
    getCartById ,
    createDesignTicket,
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
// a catalogue product's design: admins, with a design ticket (controllers/designController.js)
router.post('/design-ticket', requireSignin, isAdmin, createDesignTicket)
router.post('/product-design' , save_design_to_product)
router.post('/addToCart' ,  save_design_to_cart)
router.get('/getCart/:cartId' , getCartById)
router.get('/getDesign/:designId' , getDesignById)
// the cart design's own key, or an admin's design ticket (controllers/designController.js updateDesign)
router.put('/updateDesign/:designId', updateDesign)
router.post('/getAllCustomCart', getAllCustomCart)
router.post('/share' , emailFormLimit('share-design'), shareDesign) // emails the design (middlewares/rateLimit.js)
router.post('/save-images' , 
    
    save_images)

export default router