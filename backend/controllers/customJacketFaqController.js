import CustomJacketFaq from '../models/customJacketFaq.js';

const defaultCustomJacketFaqs = [
  {
    question: 'How do I save my custom jacket design?',
    answer: 'Use the Save button in the designer before starting a new jacket. Your saved design keeps the selected style, materials, colors, size, and artwork choices ready for review.',
    sortOrder: 1,
    isActive: true,
  },
  {
    question: 'Can I choose different materials for the body and sleeves?',
    answer: 'Yes. The custom jacket designer lets you choose the jacket body material and sleeve material separately, including melton wool and leather options where available.',
    sortOrder: 2,
    isActive: true,
  },
  {
    question: 'What size should I select for my jacket?',
    answer: 'Pick the size that best matches your usual jacket fit. If you are between sizes or want extra layering room, choose the next size up.',
    sortOrder: 3,
    isActive: true,
  },
  {
    question: 'Can I share my design before ordering?',
    answer: 'Yes. Use the Share button to send your current jacket configuration by email so you or your team can review the look before checkout.',
    sortOrder: 4,
    isActive: true,
  },
  {
    question: 'Is my jacket ready to order after customization?',
    answer: 'Once your materials, colors, designs, and size are selected, save the jacket and continue to cart. You can review the full custom jacket details before placing the order.',
    sortOrder: 5,
    isActive: true,
  },
];

const sortFaqs = { sortOrder: 1, createdAt: 1 };

const ensureDefaultCustomJacketFaqs = async () => {
  const count = await CustomJacketFaq.countDocuments();
  if (count > 0) return;

  await CustomJacketFaq.insertMany(defaultCustomJacketFaqs);
};

const cleanText = (value) => String(value || '').trim();

const toSortOrder = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getNextSortOrder = async () => {
  const lastFaq = await CustomJacketFaq.findOne().sort({ sortOrder: -1, createdAt: -1 });
  return (Number(lastFaq?.sortOrder) || 0) + 1;
};

export const getCustomJacketFaqsController = async (req, res) => {
  try {
    await ensureDefaultCustomJacketFaqs();

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 5)
      : 5;

    const faqs = await CustomJacketFaq.find({ isActive: true })
      .sort(sortFaqs)
      .limit(limit);

    res.status(200).json({ success: true, faqs });
  } catch (error) {
    console.error('Error fetching custom jacket FAQs:', error);
    res.status(500).json({ success: false, message: 'Error fetching custom jacket FAQs.' });
  }
};

export const getAdminCustomJacketFaqsController = async (req, res) => {
  try {
    await ensureDefaultCustomJacketFaqs();

    const faqs = await CustomJacketFaq.find().sort(sortFaqs);
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    console.error('Error fetching admin custom jacket FAQs:', error);
    res.status(500).json({ success: false, message: 'Error fetching custom jacket FAQs.' });
  }
};

export const createCustomJacketFaqController = async (req, res) => {
  try {
    const question = cleanText(req.body.question);
    const answer = cleanText(req.body.answer);

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required.' });
    }

    const faq = await CustomJacketFaq.create({
      question,
      answer,
      sortOrder: toSortOrder(req.body.sortOrder, await getNextSortOrder()),
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, message: 'Custom Jacket FAQ created successfully.', faq });
  } catch (error) {
    console.error('Error creating custom jacket FAQ:', error);
    res.status(500).json({ success: false, message: 'Error creating custom jacket FAQ.' });
  }
};

export const updateCustomJacketFaqController = async (req, res) => {
  try {
    const faq = await CustomJacketFaq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'Custom Jacket FAQ not found.' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'question')) {
      const question = cleanText(req.body.question);
      if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required.' });
      }
      faq.question = question;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'answer')) {
      const answer = cleanText(req.body.answer);
      if (!answer) {
        return res.status(400).json({ success: false, message: 'Answer is required.' });
      }
      faq.answer = answer;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'sortOrder')) {
      faq.sortOrder = toSortOrder(req.body.sortOrder, faq.sortOrder);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'isActive')) {
      faq.isActive = Boolean(req.body.isActive);
    }

    await faq.save();
    res.status(200).json({ success: true, message: 'Custom Jacket FAQ updated successfully.', faq });
  } catch (error) {
    console.error('Error updating custom jacket FAQ:', error);
    res.status(500).json({ success: false, message: 'Error updating custom jacket FAQ.' });
  }
};

export const deleteCustomJacketFaqController = async (req, res) => {
  try {
    const faq = await CustomJacketFaq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'Custom Jacket FAQ not found.' });
    }

    res.status(200).json({ success: true, message: 'Custom Jacket FAQ deleted successfully.' });
  } catch (error) {
    console.error('Error deleting custom jacket FAQ:', error);
    res.status(500).json({ success: false, message: 'Error deleting custom jacket FAQ.' });
  }
};
