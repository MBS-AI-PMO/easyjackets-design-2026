import express from 'express';
import {
    createOrUpdateFeatureController,
    getFeaturesController,
    getFeatureByNameController,
    updateWebsiteDetails,
    getWebsiteDetails,
    createBlogController,
    getAllBlogsController,
    getBlogByIdController,
    updateBlogController,
    deleteBlogController,
    getBlogBySlugController,
    getFeaturedBlogsController,
    getRecentBlogsController,
    getBlogsByCategoryController,
    uploadBlogImageController,
    addCommentController,
    getCommentsController,
    getAllCommentsController,
    approveCommentController,
    deleteCommentController,
    SubmitContact,
    subscribeNewsletter
} from '../controllers/FeatureController.js';
import {
    createPageFaqController,
    deletePageFaqController,
    getAdminPageFaqsController,
    getBuilderFaqsController,
    getPageFaqsController,
    reorderPageFaqsController,
    updatePageFaqController,
} from '../controllers/pageFaqController.js';
import {
    getTopBarController,
    updateTopBarController,
} from '../controllers/topBarController.js';
import {
    finishDeploymentStatusController,
    getDeploymentStatusController,
    startDeploymentStatusController,
} from '../controllers/deploymentStatusController.js';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/website/details', getWebsiteDetails);
router.put('/website/details', requireSignin, isAdmin, updateWebsiteDetails);

// Blog Routes
router.post('/blogs', requireSignin, isAdmin, createBlogController);
router.post('/blogs/upload-image', requireSignin, isAdmin, uploadBlogImageController);
router.get('/blogs', getAllBlogsController);
router.get('/blogs/featured', getFeaturedBlogsController);
router.get('/blogs/recent', getRecentBlogsController);
router.get('/blogs/category/:category', getBlogsByCategoryController);
router.get('/blogs/slug/:slug', getBlogBySlugController);
router.get('/blogs/:id', getBlogByIdController);
router.put('/blogs/:id', requireSignin, isAdmin, updateBlogController);
router.delete('/blogs/:id', requireSignin, isAdmin, deleteBlogController);

// Blog Comments
router.post('/blogs/:id/comments', addCommentController);
router.get('/blogs/:id/comments', getCommentsController);

// Admin Blog Comments Moderation
router.get('/blogs/comments/all', requireSignin, isAdmin, getAllCommentsController);
router.put('/blogs/:blogId/comments/:commentId/approve', requireSignin, isAdmin, approveCommentController);
router.delete('/blogs/:blogId/comments/:commentId', requireSignin, isAdmin, deleteCommentController);

// Page FAQ Routes — every page's FAQ block, plus the product/catalog templates.
router.get('/page-faqs/admin', requireSignin, isAdmin, getAdminPageFaqsController);
router.get('/page-faqs', getPageFaqsController);
router.post('/page-faqs', requireSignin, isAdmin, createPageFaqController);
router.put('/page-faqs/reorder', requireSignin, isAdmin, reorderPageFaqsController);
router.put('/page-faqs/:id', requireSignin, isAdmin, updatePageFaqController);
router.delete('/page-faqs/:id', requireSignin, isAdmin, deletePageFaqController);

// Legacy jacket-builder FAQ endpoint. The separately deployed custom-jacket app
// still calls this, so it stays — but it now reads the unified page-faqs
// collection rather than its own, so there is one place to edit them.
router.get('/custom-jacket-faqs', getBuilderFaqsController);

// Top Bar Routes
router.get('/top-bar', getTopBarController);
router.put('/top-bar', requireSignin, isAdmin, updateTopBarController);

// Deployment Status Routes
router.get('/deployment-status', getDeploymentStatusController);
router.post('/deployment-status/start', startDeploymentStatusController);
router.post('/deployment-status/finish', finishDeploymentStatusController);

// Feature Routes
router.post('/', requireSignin, isAdmin, createOrUpdateFeatureController);
router.post('/contact', SubmitContact);
router.post('/subscribe', subscribeNewsletter);
router.get('/', getFeaturesController);
router.get('/:name', getFeatureByNameController);

export default router;
