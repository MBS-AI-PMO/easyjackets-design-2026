import Collar from '../models/collars.js'
import Sleeves from '../models/sleeves.js'
import DesignType from '../models/designsType.js'
import Closure from '../models/closure.js'
import Linings from '../models/lining.js'
import Pocket from '../models/pockets.js'
import Material from '../models/material.js'
import Size from '../models/size.js'
import Color from '../models/color.js'
import part from '../models/part.js'
// Create Material
export const createMaterialController = async (req, res) => {
  try {
    let { name, body, sleeves, bodyPrice, sleevesPrice, matParent } = req.body;
    if (!name || !body || !sleeves || !"body-price" || !sleevesPrice || !matParent) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Ensure matParent is an array
    if (!Array.isArray(matParent)) {
      matParent = [matParent];
    }

    const material = await new Material({ name, body, sleeves, "body-price": bodyPrice, "sleeves-price": sleevesPrice, "mat-parent": matParent }).save();
    res.status(201).send({
      success: true,
      message: "New Material created",
      material,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Material",
    });
  }
};

// Read All Materials
export const getAllMaterialsController = async (req, res) => {
  try {
    const materials = await Material.find();
    res.status(200).send({
      success: true,
      materials,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching materials",
    });
  }
};

// Read Material by ID
export const getMaterialByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).send({ message: "Material not found" });
    }
    res.status(200).send({
      success: true,
      material,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Material",
    });
  }
};

// Update Material
export const updateMaterialController = async (req, res) => {
  try {
    let { name, body, sleeves, bodyPrice, sleevesPrice, matParent } = req.body;

    // Ensure matParent is an array
    if (matParent && !Array.isArray(matParent)) {
      matParent = [matParent];
    }

    const material = await Material.findOneAndUpdate(
      { _id: req.params.id },
      { name, body, sleeves, "body-price": bodyPrice, "sleeves-price": sleevesPrice, "mat-parent": matParent },
      { new: true }
    );
    if (!material) {
      return res.status(404).send({ message: "Material not found" });
    }
    res.status(200).send({
      success: true,
      message: "Material updated",
      material,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating Material",
    });
  }
};

// Delete Material
export const deleteMaterialController = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).send({ message: "Material not found" });
    }
    res.status(200).send({
      success: true,
      message: "Material deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting Material",
    });
  }
};

//sizes 

// Create a new size
export const createSizeController = async (req, res) => {
  try {
    const { size, chest, waist, sleeves, backlength, jchest, jsleeves, jashoulder, jshoulder, jbacklength, price, fprice } = req.body;
    if (!size || !chest || !waist || !sleeves || !backlength || !jchest || !jsleeves || !jashoulder || !jshoulder || !jbacklength || !price || !fprice) {
      return res.status(400).send({ message: "All fields are required" });
    }
    const newSize = await new Size({ size, chest, waist, sleeves, backlength, jchest, jsleeves, jashoulder, jshoulder, jbacklength, price, fprice }).save();
    res.status(201).send({
      success: true,
      message: "New size created",
      newSize,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating size",
    });
  }
};

// Get all sizes
export const getAllSizesController = async (req, res) => {
  try {
    const sizes = await Size.find();
    res.status(200).send({
      success: true,
      sizes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching sizes",
    });
  }
};

// Get size by ID
export const getSizeByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await Size.findById(id);
    if (!size) {
      return res.status(404).send({ message: "Size not found" });
    }
    res.status(200).send({
      success: true,
      size,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching size",
    });
  }
};

// Update size by ID
export const updateSizeController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const size = await Size.findByIdAndUpdate(id, updates, { new: true });
    if (!size) {
      return res.status(404).send({ message: "Size not found" });
    }
    res.status(200).send({
      success: true,
      message: "Size updated",
      size,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating size",
    });
  }
};

// Delete size by ID
export const deleteSizeController = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await Size.findByIdAndDelete(id);
    if (!size) {
      return res.status(404).send({ message: "Size not found" });
    }
    res.status(200).send({
      success: true,
      message: "Size deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting size",
    });
  }
};


export const createCollarController = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).send({ message: "Name and price are required" });
    }
    const existingCollar = await Collar.findOne({ name });
    if (existingCollar) {
      return res.status(200).send({
        success: true,
        message: "Collar Already Exists",
      });
    }
    const collar = await new Collar({
      name,
      price,
    }).save();
    res.status(201).send({
      success: true,
      message: "New collar created",
      collar,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating collar",
    });
  }
};

export const getAllCollarsController = async (req, res) => {
  try {
    const collars = await Collar.find();
    res.status(200).send({
      success: true,
      collars,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching collars",
    });
  }
};

export const getCollarByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const collar = await Collar.findById(id);
    if (!collar) {
      return res.status(404).send({ message: "Collar not found" });
    }
    res.status(200).send({
      success: true,
      collar,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching collar",
    });
  }
};

export const updateCollarController = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;
    const collar = await Collar.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!collar) {
      return res.status(404).send({ message: "Collar not found" });
    }
    res.status(200).send({
      success: true,
      message: "Collar updated",
      collar,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating collar",
    });
  }
};


export const deleteCollarController = async (req, res) => {
  try {
    const { id } = req.params;
    const collar = await Collar.findByIdAndDelete(id);
    if (!collar) {
      return res.status(404).send({ message: "Collar not found" });
    }
    res.status(200).send({
      success: true,
      message: "Collar deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting collar",
    });
  }
};

//sleeves

// Create Sleeves
export const createSleeveController = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).send({ message: "Name and price are required" });
    }
    const existingSleeve = await Sleeves.findOne({ name });
    if (existingSleeve) {
      return res.status(200).send({
        success: true,
        message: "Sleeves Already Exists",
      });
    }
    const sleeves = await new Sleeves({ name, price }).save();
    res.status(201).send({
      success: true,
      message: "New Sleeves created",
      sleeves,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Sleeves",
    });
  }
};

// Read All Sleeves
export const getAllSleevesController = async (req, res) => {
  try {
    const sleeves = await Sleeves.find();
    res.status(200).send({
      success: true,
      sleeves,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching sleeves",
    });
  }
};

// Read Sleeves by ID
export const getSleeveByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const sleeves = await Sleeves.findById(id);
    if (!Sleeves) {
      return res.status(404).send({ message: "Sleeves not found" });
    }
    res.status(200).send({
      success: true,
      sleeves,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Sleeves",
    });
  }
};

// Update Sleeves
export const updateSleeveController = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;
    const sleeves = await Sleeves.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!Sleeves) {
      return res.status(404).send({ message: "Sleeves not found" });
    }
    res.status(200).send({
      success: true,
      message: "Sleeves updated",
      sleeves,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating Sleeves",
    });
  }
};

// Delete Sleeves
export const deleteSleeveController = async (req, res) => {
  try {
    const { id } = req.params;
    const sleeves = await Sleeves.findByIdAndDelete(id);
    if (!Sleeves) {
      return res.status(404).send({ message: "Sleeves not found" });
    }
    res.status(200).send({
      success: true,
      message: "Sleeves deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting Sleeves",
    });
  }
};


// closure 

export const createClosureController = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).send({ message: "Name and price are required" });
    }
    const existingClosure = await Closure.findOne({ name });
    if (existingClosure) {
      return res.status(200).send({
        success: true,
        message: "Closure Already Exists",
      });
    }
    const closure = await new Closure({ name, price }).save();
    res.status(201).send({
      success: true,
      message: "New Closure created",
      closure,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Closure",
    });
  }
};

// Read All Closures
export const getAllClosuresController = async (req, res) => {
  try {
    const closures = await Closure.find();
    res.status(200).send({
      success: true,
      closures,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching closures",
    });
  }
};

// Read Closure by ID
export const getClosureByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const closure = await Closure.findById(id);
    if (!closure) {
      return res.status(404).send({ message: "Closure not found" });
    }
    res.status(200).send({
      success: true,
      closure,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Closure",
    });
  }
};

// Update Closure
export const updateClosureController = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;
    const closure = await Closure.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!closure) {
      return res.status(404).send({ message: "Closure not found" });
    }
    res.status(200).send({
      success: true,
      message: "Closure updated",
      closure,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating Closure",
    });
  }
};

// Delete Closure
export const deleteClosureController = async (req, res) => {
  try {
    const { id } = req.params;
    const closure = await Closure.findByIdAndDelete(id);
    if (!closure) {
      return res.status(404).send({ message: "Closure not found" });
    }
    res.status(200).send({
      success: true,
      message: "Closure deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting Closure",
    });
  }
};

// pocket
// Create Pocket
export const createPocketController = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).send({ message: "Name and price are required" });
    }
    const existingPocket = await Pocket.findOne({ name });
    if (existingPocket) {
      return res.status(200).send({
        success: true,
        message: "Pocket Already Exists",
      });
    }
    const pocket = await new Pocket({ name, price }).save();
    res.status(201).send({
      success: true,
      message: "New Pocket created",
      pocket,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Pocket",
    });
  }
};

// Read All Pockets
export const getAllPocketsController = async (req, res) => {
  try {
    const pockets = await Pocket.find();
    res.status(200).send({
      success: true,
      pockets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching pockets",
    });
  }
};

// Read Pocket by ID
export const getPocketByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const pocket = await Pocket.findById(id);
    if (!pocket) {
      return res.status(404).send({ message: "Pocket not found" });
    }
    res.status(200).send({
      success: true,
      pocket,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Pocket",
    });
  }
};

// Update Pocket
export const updatePocketController = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;
    const pocket = await Pocket.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!pocket) {
      return res.status(404).send({ message: "Pocket not found" });
    }
    res.status(200).send({
      success: true,
      message: "Pocket updated",
      pocket,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating Pocket",
    });
  }
};

// Delete Pocket
export const deletePocketController = async (req, res) => {
  try {
    const { id } = req.params;
    const pocket = await Pocket.findByIdAndDelete(id);
    if (!pocket) {
      return res.status(404).send({ message: "Pocket not found" });
    }
    res.status(200).send({
      success: true,
      message: "Pocket deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting Pocket",
    });
  }
};

// Create Lining
export const createLiningController = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).send({ message: "Name and price are required" });
    }
    const existingLining = await Linings.findOne({ name });
    if (existingLining) {
      return res.status(200).send({
        success: true,
        message: "Lining Already Exists",
      });
    }
    const lining = await new Linings({ name, price }).save();
    res.status(201).send({
      success: true,
      message: "New Lining created",
      lining,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Lining",
    });
  }
};

// Read All Linings
export const getAllLiningsController = async (req, res) => {
  try {
    const linings = await Linings.find();
    res.status(200).send({
      success: true,
      linings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching linings",
    });
  }
};

// Read Lining by ID
export const getLiningByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const lining = await Linings.findById(id);
    if (!lining) {
      return res.status(404).send({ message: "Lining not found" });
    }
    res.status(200).send({
      success: true,
      lining,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Lining",
    });
  }
};

// Update Lining
export const updateLiningController = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;
    const lining = await Linings.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!lining) {
      return res.status(404).send({ message: "Lining not found" });
    }
    res.status(200).send({
      success: true,
      message: "Lining updated",
      lining,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating Lining",
    });
  }
};

// Delete Lining
export const deleteLiningController = async (req, res) => {
  try {
    const { id } = req.params;
    const lining = await Linings.findByIdAndDelete(id);
    if (!lining) {
      return res.status(404).send({ message: "Lining not found" });
    }
    res.status(200).send({
      success: true,
      message: "Lining deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting Lining",
    });
  }
};


export const createDesignTypeController = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).send({ message: "Name and price are required" });
    }
    const existingDesignType = await DesignType.findOne({ name });
    if (existingDesignType) {
      return res.status(200).send({
        success: true,
        message: "Design Type Already Exists",
      });
    }
    const designType = await new DesignType({ name, price }).save();
    res.status(201).send({
      success: true,
      message: "New Design Type created",
      designType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Design Type",
    });
  }
};

// Read All Design Types
export const getAllDesignTypesController = async (req, res) => {
  try {
    const designTypes = await DesignType.find();
    res.status(200).send({
      success: true,
      designTypes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching design types",
    });
  }
};

// Read Design Type by ID
export const getDesignTypeByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const designType = await DesignType.findById(id);
    if (!designType) {
      return res.status(404).send({ message: "Design Type not found" });
    }
    res.status(200).send({
      success: true,
      designType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Design Type",
    });
  }
};

// Update Design Type
export const updateDesignTypeController = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { id } = req.params;
    const designType = await DesignType.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!designType) {
      return res.status(404).send({ message: "Design Type not found" });
    }
    res.status(200).send({
      success: true,
      message: "Design Type updated",
      designType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating Design Type",
    });
  }
};

// Delete Design Type
export const deleteDesignTypeController = async (req, res) => {
  try {
    const { id } = req.params;
    const designType = await DesignType.findByIdAndDelete(id);
    if (!designType) {
      return res.status(404).send({ message: "Design Type not found" });
    }
    res.status(200).send({
      success: true,
      message: "Design Type deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting Design Type",
    });
  }
};

export const createColor = async (req, res) => {
  try {
    const { id, name, code, isActive, materials = [], parts = [] } = req.body;
    const newColor = new Color({ id, name, code, isActive, materials, parts });
    await newColor.save();
    res.status(201).json({ success: true, data: newColor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create color', error });
  }
};

// Get all colors
export const getColors = async (req, res) => {
  try {
    let colors;

    if (req.query.isActive !== undefined) {
      const isActive = req.query.isActive === 'true';
      colors = await Color.find({ isActive });
    } else {
      colors = await Color.find({});
    }
    res.status(200).json({ success: true, data: colors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve colors', error });
  }
};

export const getParts = async (req, res) => {
  try {
    const parts = await part.find();
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve parts', error });
  }
};
// Get a color by ID
export const getColorById = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) return res.status(404).json({ success: false, message: 'Color not found' });
    res.status(200).json({ success: true, data: color });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve color', error });
  }
};

// Update a color by ID
export const updateColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!color) return res.status(404).json({ success: false, message: 'Color not found' });
    res.status(200).json({ success: true, data: color });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update color', error });
  }
};

// Delete a color by ID
// Delete a color by ID
export const deleteColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) return res.status(404).json({ success: false, message: 'Color not found' });
    res.status(200).json({ success: true, message: 'Color deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete color', error });
  }
};
