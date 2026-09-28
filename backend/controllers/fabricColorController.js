import formidable from "formidable";
import slugify from "slugify";
import FabricColor from "../models/fabricColor.js";
import FabricSection from "../models/fabricSection.js";
import uploadToS3 from "../helpers/fileUpload.js";

const DEFAULT_FABRIC_SECTIONS = [
  {
    seedKey: "premium-leather",
    key: "premium-leather",
    eyebrow: "Leather Collection",
    title: "Premium Leathers",
    description: "Click on any swatch to explore the texture and grain of our hand-selected leathers.",
    sortOrder: 1,
    isActive: true,
  },
  {
    seedKey: "polyester-satin",
    key: "polyester-satin",
    eyebrow: "Satin Collection",
    title: "Polyester Satin Colors",
    description: "Smooth, lightweight satin shades for custom varsity jackets with a clean reflective finish.",
    sortOrder: 2,
    isActive: true,
  },
];

const DEFAULT_FABRIC_COLORS = [
  {
    seedKey: "premium-leather-tan",
    name: "Tan Leather",
    group: "premium-leather",
    imageUrl: "/gridImage/1177-large_default_110x110@2x - Copy.webp",
    altText: "Tan premium leather swatch",
    sortOrder: 10,
    isActive: true,
  },
  {
    seedKey: "premium-leather-black",
    name: "Black Leather",
    group: "premium-leather",
    imageUrl: "/gridImage/1178-large_default_1024x1024@2x.webp",
    altText: "Black premium leather swatch",
    sortOrder: 20,
    isActive: true,
  },
  {
    seedKey: "premium-leather-cognac",
    name: "Cognac Leather",
    group: "premium-leather",
    imageUrl: "/gridImage/1179-large_default_110x110@2x.webp",
    altText: "Cognac premium leather swatch",
    sortOrder: 30,
    isActive: true,
  },
  {
    seedKey: "premium-leather-brown",
    name: "Brown Leather",
    group: "premium-leather",
    imageUrl: "/gridImage/1180-large_default_1024x1024@2x.webp",
    altText: "Brown premium leather swatch",
    sortOrder: 40,
    isActive: true,
  },
  {
    seedKey: "premium-leather-navy",
    name: "Navy Leather",
    group: "premium-leather",
    imageUrl: "/gridImage/1181-large_default_1024x1024@2x.webp",
    altText: "Navy premium leather swatch",
    sortOrder: 50,
    isActive: true,
  },
  {
    seedKey: "premium-leather-olive",
    name: "Olive Leather",
    group: "premium-leather",
    imageUrl: "/gridImage/1182-large_default_1024x1024@2x.webp",
    altText: "Olive premium leather swatch",
    sortOrder: 60,
    isActive: true,
  },
  {
    seedKey: "polyester-satin-black",
    name: "Black Satin",
    group: "polyester-satin",
    imageUrl: "/fabric-colors/polyester-satin/black.jfif",
    altText: "Black polyester satin swatch",
    sortOrder: 10,
    isActive: true,
  },
  {
    seedKey: "polyester-satin-dark-gray",
    name: "Dark Gray Satin",
    group: "polyester-satin",
    imageUrl: "/fabric-colors/polyester-satin/dark-gray.jfif",
    altText: "Dark gray polyester satin swatch",
    sortOrder: 20,
    isActive: true,
  },
  {
    seedKey: "polyester-satin-light-gray",
    name: "Light Gray Satin",
    group: "polyester-satin",
    imageUrl: "/fabric-colors/polyester-satin/light-gray.jfif",
    altText: "Light gray polyester satin swatch",
    sortOrder: 30,
    isActive: true,
  },
];

let defaultFabricSectionsReady = false;
let defaultFabricColorsReady = false;

const getFirstField = (value, fallback = "") => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
};

const getUploadedFile = (files) => {
  const image = files?.image;
  if (Array.isArray(image)) return image[0];
  return image || null;
};

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value) === "true";
};

const parseNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeSectionKey = (value = "") =>
  slugify(String(value || ""), {
    lower: true,
    strict: true,
    trim: true,
  });

const parseRequest = (req) =>
  new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      resolve({ fields: req.body || {}, files: {} });
      return;
    }

    const form = formidable({ multiples: false });
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });

const ensureDefaultFabricSections = async () => {
  if (defaultFabricSectionsReady) return;

  const existingSection = await FabricSection.exists({});
  if (existingSection) {
    defaultFabricSectionsReady = true;
    return;
  }

  try {
    await FabricSection.insertMany(DEFAULT_FABRIC_SECTIONS, { ordered: false });
    defaultFabricSectionsReady = true;
  } catch (error) {
    if (error?.code !== 11000) throw error;
    defaultFabricSectionsReady = true;
  }
};

const ensureDefaultFabricColors = async () => {
  if (defaultFabricColorsReady) return;

  const existingColor = await FabricColor.exists({});
  if (existingColor) {
    defaultFabricColorsReady = true;
    return;
  }

  try {
    await FabricColor.insertMany(DEFAULT_FABRIC_COLORS, { ordered: false });
    defaultFabricColorsReady = true;
  } catch (error) {
    if (error?.code !== 11000) throw error;
    defaultFabricColorsReady = true;
  }
};

const ensureDefaultFabricData = async () => {
  await ensureDefaultFabricSections();
  await ensureDefaultFabricColors();
};

const buildQuery = (query = {}, forceActive = false) => {
  const filter = {};
  const group = normalizeSectionKey(query.group || "");
  if (group) filter.group = group;

  if (forceActive) {
    filter.isActive = true;
  } else if (query.isActive !== undefined) {
    filter.isActive = String(query.isActive) === "true";
  }

  return filter;
};

const buildSectionQuery = (query = {}, forceActive = false) => {
  const filter = {};

  if (forceActive) {
    filter.isActive = true;
  } else if (query.isActive !== undefined) {
    filter.isActive = String(query.isActive) === "true";
  }

  return filter;
};

const listFabricColors = async (filter) =>
  FabricColor.find(filter)
    .select("name group imageUrl altText sortOrder isActive createdAt updatedAt")
    .sort({ group: 1, sortOrder: 1, createdAt: 1 })
    .lean();

const listFabricSections = async (filter = {}) =>
  FabricSection.find(filter)
    .select("key eyebrow title description sortOrder isActive createdAt updatedAt")
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

export const getFabricColors = async (req, res) => {
  try {
    await ensureDefaultFabricData();
    const allFilter = buildQuery(req.query);
    const sections = await listFabricSections(buildSectionQuery(req.query, true));
    const publicFilter = buildQuery(req.query, true);
    const activeSectionKeys = sections.map((section) => section.key);

    if (!req.query.group) {
      publicFilter.group = { $in: activeSectionKeys };
    } else if (!activeSectionKeys.includes(publicFilter.group)) {
      publicFilter.group = "__hidden-section__";
    }

    const colors = await listFabricColors(publicFilter);
    const hasRecords = colors.length > 0 || Boolean(await FabricColor.exists(allFilter));
    res.status(200).json({ success: true, data: colors, sections, total: colors.length, hasRecords });
  } catch (error) {
    console.error("Error fetching fabric colors:", error);
    res.status(500).json({ success: false, message: "Error fetching fabric colors" });
  }
};

export const getAllFabricColors = async (req, res) => {
  try {
    await ensureDefaultFabricData();
    const [colors, sections] = await Promise.all([
      listFabricColors(buildQuery(req.query)),
      listFabricSections(buildSectionQuery(req.query)),
    ]);
    res.status(200).json({ success: true, data: colors, sections });
  } catch (error) {
    console.error("Error fetching all fabric colors:", error);
    res.status(500).json({ success: false, message: "Error fetching fabric colors" });
  }
};

export const createFabricSection = async (req, res) => {
  try {
    await ensureDefaultFabricData();

    const title = String(getFirstField(req.body?.title)).trim();
    const key = normalizeSectionKey(getFirstField(req.body?.key, title));

    if (!key || !title) {
      return res.status(400).json({ success: false, message: "Section key and heading are required" });
    }

    const section = await FabricSection.create({
      key,
      eyebrow: String(getFirstField(req.body?.eyebrow)).trim(),
      title,
      description: String(getFirstField(req.body?.description)).trim(),
      sortOrder: parseNumber(getFirstField(req.body?.sortOrder), 0),
      isActive: parseBoolean(getFirstField(req.body?.isActive), true),
    });

    res.status(201).json({ success: true, data: section, message: "Fabric section created" });
  } catch (error) {
    console.error("Error creating fabric section:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A fabric section with this key already exists" });
    }
    res.status(500).json({ success: false, message: "Error creating fabric section" });
  }
};

export const updateFabricSection = async (req, res) => {
  try {
    await ensureDefaultFabricData();

    const existing = await FabricSection.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Fabric section not found" });
    }

    const title = String(getFirstField(req.body?.title, existing.title)).trim();
    const key = normalizeSectionKey(getFirstField(req.body?.key, existing.key));

    if (!key || !title) {
      return res.status(400).json({ success: false, message: "Section key and heading are required" });
    }

    const previousKey = existing.key;
    existing.key = key;
    existing.eyebrow = String(getFirstField(req.body?.eyebrow, existing.eyebrow)).trim();
    existing.title = title;
    existing.description = String(getFirstField(req.body?.description, existing.description)).trim();
    existing.sortOrder = parseNumber(getFirstField(req.body?.sortOrder, existing.sortOrder), existing.sortOrder);
    existing.isActive = parseBoolean(getFirstField(req.body?.isActive, existing.isActive), existing.isActive);

    await existing.save();

    if (previousKey !== key) {
      await FabricColor.updateMany({ group: previousKey }, { $set: { group: key } });
    }

    res.status(200).json({ success: true, data: existing, message: "Fabric section updated" });
  } catch (error) {
    console.error("Error updating fabric section:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A fabric section with this key already exists" });
    }
    res.status(500).json({ success: false, message: "Error updating fabric section" });
  }
};

export const createFabricColor = async (req, res) => {
  try {
    await ensureDefaultFabricData();
    const { fields, files } = await parseRequest(req);
    const name = String(getFirstField(fields.name)).trim();
    const group = normalizeSectionKey(getFirstField(fields.group, "polyester-satin"));
    const imageFile = getUploadedFile(files);
    let imageUrl = String(getFirstField(fields.imageUrl)).trim();

    if (!name || !group) {
      return res.status(400).json({ success: false, message: "Name and section are required" });
    }

    const sectionExists = await FabricSection.exists({ key: group });
    if (!sectionExists) {
      return res.status(400).json({ success: false, message: "Please select a valid fabric section" });
    }

    if (imageFile) {
      const key = await uploadToS3(imageFile);
      imageUrl = `${process.env.AWS_FILE_PATH}${key}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Please upload an image or provide an image URL" });
    }

    const color = await FabricColor.create({
      name,
      group,
      imageUrl,
      altText: String(getFirstField(fields.altText, name)).trim(),
      sortOrder: parseNumber(getFirstField(fields.sortOrder), 0),
      isActive: parseBoolean(getFirstField(fields.isActive), true),
    });

    res.status(201).json({ success: true, data: color, message: "Fabric color created" });
  } catch (error) {
    console.error("Error creating fabric color:", error);
    res.status(500).json({ success: false, message: "Error creating fabric color" });
  }
};

export const updateFabricColor = async (req, res) => {
  try {
    await ensureDefaultFabricData();
    const existing = await FabricColor.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Fabric color not found" });
    }

    const { fields, files } = await parseRequest(req);
    const imageFile = getUploadedFile(files);
    let imageUrl = String(getFirstField(fields.imageUrl, existing.imageUrl)).trim();

    if (imageFile) {
      const key = await uploadToS3(imageFile);
      imageUrl = `${process.env.AWS_FILE_PATH}${key}`;
    }

    const group = normalizeSectionKey(getFirstField(fields.group, existing.group));
    const sectionExists = await FabricSection.exists({ key: group });
    if (!group || !sectionExists) {
      return res.status(400).json({ success: false, message: "Invalid fabric section" });
    }

    existing.name = String(getFirstField(fields.name, existing.name)).trim();
    existing.group = group;
    existing.imageUrl = imageUrl;
    existing.altText = String(getFirstField(fields.altText, existing.altText || existing.name)).trim();
    existing.sortOrder = parseNumber(getFirstField(fields.sortOrder, existing.sortOrder), existing.sortOrder);
    existing.isActive = parseBoolean(getFirstField(fields.isActive, existing.isActive), existing.isActive);

    await existing.save();

    res.status(200).json({ success: true, data: existing, message: "Fabric color updated" });
  } catch (error) {
    console.error("Error updating fabric color:", error);
    res.status(500).json({ success: false, message: "Error updating fabric color" });
  }
};

export const deleteFabricColor = async (req, res) => {
  try {
    const color = await FabricColor.findByIdAndDelete(req.params.id);
    if (!color) {
      return res.status(404).json({ success: false, message: "Fabric color not found" });
    }

    res.status(200).json({ success: true, message: "Fabric color deleted" });
  } catch (error) {
    console.error("Error deleting fabric color:", error);
    res.status(500).json({ success: false, message: "Error deleting fabric color" });
  }
};

export const deleteFabricSection = async (req, res) => {
  try {
    await ensureDefaultFabricData();

    const section = await FabricSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: "Fabric section not found" });
    }

    const colorCount = await FabricColor.countDocuments({ group: section.key });
    if (colorCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Move or delete this section's pictures before deleting the section",
      });
    }

    await section.deleteOne();

    res.status(200).json({ success: true, message: "Fabric section deleted" });
  } catch (error) {
    console.error("Error deleting fabric section:", error);
    res.status(500).json({ success: false, message: "Error deleting fabric section" });
  }
};
