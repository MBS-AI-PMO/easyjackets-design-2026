import TopBar from '../models/topBar.js';

const defaultTopBarText =
  'Flash Sale \u00b7 50% Off \u00b7 Free Expedited Shipping Across US & Canada';

const ensureDefaultTopBar = async () => {
  let topBar = await TopBar.findOne().sort({ createdAt: 1 });
  if (topBar) return topBar;

  topBar = await TopBar.create({ text: defaultTopBarText });
  return topBar;
};

export const getTopBarController = async (req, res) => {
  try {
    const topBar = await ensureDefaultTopBar();
    res.status(200).json({ success: true, topBar });
  } catch (error) {
    console.error('Error fetching top bar:', error);
    res.status(500).json({ success: false, message: 'Error fetching top bar.' });
  }
};

export const updateTopBarController = async (req, res) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Top bar text is required.' });
    }

    const topBar = await ensureDefaultTopBar();
    topBar.text = text;
    await topBar.save();

    res.status(200).json({ success: true, message: 'Top bar updated successfully.', topBar });
  } catch (error) {
    console.error('Error updating top bar:', error);
    res.status(500).json({ success: false, message: 'Error updating top bar.' });
  }
};
