import express from 'express'
import { getOrder, getOrderlist, updateOrder, deleteOrder, softDeleteOrder, restoreOrder, getDeletedOrderlist, clearAllDeletedOrders, proxyImage } from '../controllers/orderController.js'
import { trackOrderController } from '../controllers/trackOrderController.js';
import {
    createBulkOrder,
    getAllbulkOrderController,
    getSingleOrderController,
    getDeletedBulkOrderController,
    softDeleteBulkOrderController,
    restoreBulkOrderController,
    permanentDeleteBulkOrderController,
} from '../controllers/bulkOrderController.js'
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js'
import { emailFormLimit, rateLimit } from '../middlewares/rateLimit.js'

const router = express.Router()


router.post('/bulk', emailFormLimit('bulk-quote'), createBulkOrder) // emails the team and the customer (middlewares/rateLimit.js)
router.get('/bulk/deleted', requireSignin, isAdmin, getDeletedBulkOrderController)
router.put('/bulk/restore/:id', requireSignin, isAdmin, restoreBulkOrderController)
router.delete('/bulk/permanent/:id', requireSignin, isAdmin, permanentDeleteBulkOrderController)
// Every order and bulk-order screen is the admin's: admins only (a customer account used to be enough to
// read, change and delete everyone's orders)
router.get('/bulk', requireSignin, isAdmin, getAllbulkOrderController)
router.get('/bulk/:id', requireSignin, isAdmin, getSingleOrderController)
router.delete('/bulk/:id', requireSignin, isAdmin, softDeleteBulkOrderController)

router.get('/deleted', requireSignin, isAdmin, getDeletedOrderlist)
router.delete('/clear-deleted', requireSignin, isAdmin, clearAllDeletedOrders)
router.put('/restore/:id', requireSignin, isAdmin, restoreOrder)
// Public: guest order tracking by order number + email (storefront /track-order). Limited per visitor, so
// it cannot be used to try order numbers and emails one after another.
const trackLimit = rateLimit({ name: 'order-track', max: 20, windowMs: 10 * 60 * 1000, message: 'Too many lookups. Please wait a few minutes and try again.' })
router.get('/track', trackLimit, trackOrderController);
// Public, as the admin's order PDF loads images through it with a plain <img>: it only fetches images from
// a fixed list of image hosts (controllers/orderController.js proxyImage)
router.get('/proxy-image', proxyImage)
router.get('/:id', requireSignin, isAdmin, getOrder)
router.put('/:id', requireSignin, isAdmin, updateOrder)
router.delete('/:id', requireSignin, isAdmin, softDeleteOrder)
router.delete('/permanent/:id', requireSignin, isAdmin, deleteOrder)
router.get('/', requireSignin, isAdmin, getOrderlist)

export default router
