import SiteTag from '../models/SiteTag.js';

// Create a new tag
export const createTag = async (req, res) => {
  try {
    const { name, tagType, attributes, content, isActive } = req.body;

    // Parse attributes if they come as a string
    let parsedAttributes = attributes;
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes);
      } catch (e) {
        // If it fails, leave it as is or handle it
      }
    }

    const newTag = new SiteTag({
      name,
      tagType,
      attributes: parsedAttributes,
      content,
      isActive
    });

    const savedTag = await newTag.save();
    res.status(201).json({ success: true, message: 'Tag created successfully', tag: savedTag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all tags (for Admin)
export const getAllTags = async (req, res) => {
  try {
    const tags = await SiteTag.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get active tags (for Frontend)
export const getActiveTags = async (req, res) => {
  try {
    const tags = await SiteTag.find({ isActive: true });
    res.status(200).json({ success: true, tags });
  } catch (error) {
    console.error('Error fetching active tags:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a tag
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tagType, attributes, content, isActive } = req.body;

    let parsedAttributes = attributes;
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes);
      } catch (e) {
        // Handle parsing error if needed
      }
    }

    const updatedTag = await SiteTag.findByIdAndUpdate(
      id,
      { name, tagType, attributes: parsedAttributes, content, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedTag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    res.status(200).json({ success: true, message: 'Tag updated successfully', tag: updatedTag });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a tag
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTag = await SiteTag.findByIdAndDelete(id);

    if (!deletedTag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    res.status(200).json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
