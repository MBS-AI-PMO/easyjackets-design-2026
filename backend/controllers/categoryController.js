import CategoryModel from "../models/CategoryModel.js";
import slugify from "slugify";
import formidable from "formidable";
import uploadToS3 from "../helpers/fileUpload.js";

export const createCategoryController = async (req, res) => {
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');

  const run = async (fields, imageFile) => {
    try {
      const name = fields.name;
      if (!name) {
        return res.status(401).send({ message: "Name is required" });
      }

      const existingCategory = await CategoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(200).send({
          success: true,
          message: "Category Already Exists",
        });
      }

      let imageUrl = null;
      if (imageFile) {
        const key = await uploadToS3(imageFile);
        imageUrl = `${process.env.AWS_FILE_PATH}${key}`;
      }

      const showOnLanding = fields.showOnLanding !== undefined
        ? (fields.showOnLanding === 'true' || fields.showOnLanding === true)
        : true;

      const category = await new CategoryModel({
        name,
        code: fields.code,
        section: fields.section || 'jackets',
        image: imageUrl,
        showOnLanding,
        serial: fields.serial || 0,
        slug: slugify(name),
      }).save();

      res.status(201).send({
        success: true,
        message: "new category created",
        category,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error in Category",
      });
    }
  };

  if (isMultipart) {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).send('Error parsing the files.');
      const flat = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      );
      const imageFile = files.image
        ? (Array.isArray(files.image) ? files.image[0] : files.image)
        : null;
      run(flat, imageFile);
    });
  } else {
    run(req.body, null);
  }
};

//update category
export const updateCategoryController = async (req, res) => {
  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send('Error parsing the files.');
    }

    try {
      // Handle front image
      const frontImageFile = files.image ? files.image[0] : null;
      let frontImageUrl = fields.existingImage ? fields.existingImage[0] : (fields.image ? fields.image[0] : null);

      if (frontImageFile) {
        const url = await uploadToS3(frontImageFile);
        frontImageUrl = `${process.env.AWS_FILE_PATH}${url}`;
      }

      const { id } = req.params
      const data = {
        name: fields.name[0],
        image: frontImageUrl,
        section: fields.section ? fields.section[0] : 'jackets',
        showOnLanding: fields.showOnLanding ? fields.showOnLanding[0] === 'true' : true,
        serial: fields.serial ? Number(fields.serial[0]) : 0
      }
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { ...data, slug: slugify(data.name) },
        { new: true }
      );
      res.status(200).send({
        success: true,
        messsage: "Category Updated Successfully",
        category,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error while updating category",
      });
    }
  })
};

// get all cat
export const categoryControlller = async (req, res) => {
  try {
    const { section, sort } = req.query;
    let filter = {};
    if (section) {
      if (section === 'jackets') {
        filter.$or = [{ section: 'jackets' }, { section: { $exists: false } }];
      } else {
        filter.section = section;
      }
    }
    let query = CategoryModel.find(filter);
    if (sort === 'serial') {
      query = query.sort({ serial: 1 });
    }
    const category = await query;
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};

// single category
export const singleCategoryController = async (req, res) => {
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get SIngle Category SUccessfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category",
    });
  }
};

//delete category
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while deleting category",
      error,
    });
  }
};
