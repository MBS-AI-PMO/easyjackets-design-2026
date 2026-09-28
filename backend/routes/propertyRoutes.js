import express from 'express';
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

router.post('/materials', createMaterialController);
router.get('/materials', getAllMaterialsController);
router.get('/materials/:id', getMaterialByIdController);
router.put('/materials/:id', updateMaterialController);
router.delete('/materials/:id', deleteMaterialController);

router.post('/collars', createCollarController);
router.get('/collars', getAllCollarsController);
router.get('/collars/:id', getCollarByIdController);
router.put('/collars/:id', updateCollarController);
router.delete('/collars/:id', deleteCollarController);

router.post('/sleeves', createSleeveController);
router.get('/sleeves', getAllSleevesController);
router.get('/sleeves/:id', getSleeveByIdController);
router.put('/sleeves/:id', updateSleeveController);
router.delete('/sleeves/:id', deleteSleeveController);

router.post('/closures/', createClosureController);
router.get('/closures/', getAllClosuresController);
router.get('/closures/:id', getClosureByIdController);
router.put('/closures/:id', updateClosureController);
router.delete('/closures/:id', deleteClosureController);

router.post('/pockets', createPocketController);
router.get('/pockets', getAllPocketsController);
router.get('/pockets/:id', getPocketByIdController);
router.put('/pockets/:id', updatePocketController);
router.delete('/pockets/:id', deletePocketController);

router.post('/linings', createLiningController);
router.get('/linings', getAllLiningsController);
router.get('/linings/:id', getLiningByIdController);
router.put('/linings/:id', updateLiningController);
router.delete('/linings/:id', deleteLiningController);


router.post('/designTypes', createDesignTypeController);
router.get('/designTypes', getAllDesignTypesController);
router.get('/designTypes/:id', getDesignTypeByIdController);
router.put('/designTypes/:id', updateDesignTypeController);
router.delete('/designTypes/:id', deleteDesignTypeController);

router.post('/sizes', createSizeController);
router.get('/sizes', getAllSizesController);
router.get('/sizes/:id', getSizeByIdController);
router.put('/sizes/:id', updateSizeController);
router.delete('/sizes/:id', deleteSizeController);


router.post('/colors', createColor); // Create a new color
router.get('/colors', getColors); // Get all colors
router.get('/colors/:id', getColorById); // Get a single color by ID
router.put('/colors/:id', updateColor); // Update a color by ID
router.delete('/colors/:id', deleteColor);


router.get('/parts', getParts);
export default router;
