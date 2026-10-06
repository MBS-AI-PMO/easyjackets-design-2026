import express from 'express';
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js';
import { createCollarController, getAllCollarsController, getCollarByIdController, updateCollarController, deleteCollarController, 
    createSleeveController,
    getAllSleevesController,
    getSleeveByIdController,
    updateSleeveController,
    deleteSleeveController,

    createClosureController,
  getAllClosuresController,
  getClosureByIdController,
  updateClosureController,
  deleteClosureController,

  createPocketController,
  getAllPocketsController,
  getPocketByIdController,
  updatePocketController,
  deletePocketController,

  createLiningController,
  getAllLiningsController,
  getLiningByIdController,
  updateLiningController,
  deleteLiningController,

  createDesignTypeController,
  getAllDesignTypesController,
  getDesignTypeByIdController,
  updateDesignTypeController,
  deleteDesignTypeController,

  createMaterialController,
  getAllMaterialsController,
  getMaterialByIdController,
  updateMaterialController,
  deleteMaterialController,

  createSizeController,
  getAllSizesController,
  getSizeByIdController,
  updateSizeController,
  deleteSizeController,

  createColor,
  getColors,
  getColorById,
  updateColor,
  deleteColor,
  getParts,
} from '../controllers/propertyController.js';

const router = express.Router();

// Reading the options and their prices is public (the builder and the storefront); adding, changing or
// deleting them is for admins only (it used to need no login at all).

router.post('/materials', requireSignin, isAdmin, createMaterialController);
router.get('/materials', getAllMaterialsController);
router.get('/materials/:id', getMaterialByIdController);
router.put('/materials/:id', requireSignin, isAdmin, updateMaterialController);
router.delete('/materials/:id', requireSignin, isAdmin, deleteMaterialController);

router.post('/collars', requireSignin, isAdmin, createCollarController);
router.get('/collars', getAllCollarsController);
router.get('/collars/:id', getCollarByIdController);
router.put('/collars/:id', requireSignin, isAdmin, updateCollarController);
router.delete('/collars/:id', requireSignin, isAdmin, deleteCollarController);

router.post('/sleeves', requireSignin, isAdmin, createSleeveController);
router.get('/sleeves', getAllSleevesController);
router.get('/sleeves/:id', getSleeveByIdController);
router.put('/sleeves/:id', requireSignin, isAdmin, updateSleeveController);
router.delete('/sleeves/:id', requireSignin, isAdmin, deleteSleeveController);

router.post('/closures/', requireSignin, isAdmin, createClosureController);
router.get('/closures/', getAllClosuresController);
router.get('/closures/:id', getClosureByIdController);
router.put('/closures/:id', requireSignin, isAdmin, updateClosureController);
router.delete('/closures/:id', requireSignin, isAdmin, deleteClosureController);

router.post('/pockets', requireSignin, isAdmin, createPocketController);
router.get('/pockets', getAllPocketsController);
router.get('/pockets/:id', getPocketByIdController);
router.put('/pockets/:id', requireSignin, isAdmin, updatePocketController);
router.delete('/pockets/:id', requireSignin, isAdmin, deletePocketController);

router.post('/linings', requireSignin, isAdmin, createLiningController);
router.get('/linings', getAllLiningsController);
router.get('/linings/:id', getLiningByIdController);
router.put('/linings/:id', requireSignin, isAdmin, updateLiningController);
router.delete('/linings/:id', requireSignin, isAdmin, deleteLiningController);


router.post('/designTypes', requireSignin, isAdmin, createDesignTypeController);
router.get('/designTypes', getAllDesignTypesController);
router.get('/designTypes/:id', getDesignTypeByIdController);
router.put('/designTypes/:id', requireSignin, isAdmin, updateDesignTypeController);
router.delete('/designTypes/:id', requireSignin, isAdmin, deleteDesignTypeController);

router.post('/sizes', requireSignin, isAdmin, createSizeController);
router.get('/sizes', getAllSizesController);
router.get('/sizes/:id', getSizeByIdController);
router.put('/sizes/:id', requireSignin, isAdmin, updateSizeController);
router.delete('/sizes/:id', requireSignin, isAdmin, deleteSizeController);


router.post('/colors', requireSignin, isAdmin, createColor); // Create a new color
router.get('/colors', getColors); // Get all colors
router.get('/colors/:id', getColorById); // Get a single color by ID
router.put('/colors/:id', requireSignin, isAdmin, updateColor); // Update a color by ID
router.delete('/colors/:id', requireSignin, isAdmin, deleteColor);


router.get('/parts', getParts);
export default router;
