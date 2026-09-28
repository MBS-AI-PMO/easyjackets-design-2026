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

const router = express.Router()


router.post('/bulk', createBulkOrder)
router.get('/bulk/deleted', requireSignin, isAdmin, getDeletedBulkOrderController)
router.put('/bulk/restore/:id', requireSignin, isAdmin, restoreBulkOrderController)
router.delete('/bulk/permanent/:id', requireSignin, isAdmin, permanentDeleteBulkOrderController)
router.get('/bulk', requireSignin, getAllbulkOrderController)
router.get('/bulk/:id', requireSignin, getSingleOrderController)
router.delete('/bulk/:id', requireSignin, isAdmin, softDeleteBulkOrderController)

router.get('/deleted', requireSignin, isAdmin, getDeletedOrderlist)
router.delete('/clear-deleted', requireSignin, isAdmin, clearAllDeletedOrders)
router.put('/restore/:id', requireSignin, restoreOrder)
// Public: guest order tracking by order number + email (storefront /track-order)
router.get('/track', trackOrderController);
router.get('/proxy-image', proxyImage)
router.get('/:id', requireSignin, getOrder)
router.put('/:id', requireSignin, updateOrder)
router.delete('/:id', requireSignin, softDeleteOrder)
router.delete('/permanent/:id', requireSignin, deleteOrder)
router.get('/', requireSignin, getOrderlist)

export default router
