// Editable storefront pages (helpers/pageContent.js): read by the storefront, written by the admin.
import PageContent from '../models/pageContent.js';
import { PAGE_CONTENT } from '../helpers/pageContent.js';

const pageFor = (req, res) => {
  const page = PAGE_CONTENT[req.params.key];
  if (!page) res.status(404).json({ success: false, message: 'No such page' });
  return page;
};

// GET /page-content/:key (public): the page's content; the shipped content when it has no row yet
export const getPageContent = async (req, res) => {
  const page = pageFor(req, res);
  if (!page) return;
  try {
    const row = await PageContent.findOne({ key: req.params.key }).lean();
    res.status(200).json({ success: true, content: row ? page.clean(row.data) : page.defaults, updatedAt: row?.updatedAt || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load the page content' });
  }
};

// GET /page-content/:key/defaults (admin): the content the page shipped with ("Restore the original")
export const getPageContentDefaults = (req, res) => {
  const page = pageFor(req, res);
  if (!page) return;
  res.status(200).json({ success: true, content: page.defaults });
};

// PUT /page-content/:key (admin) { content }: cleaned, then stored
export const updatePageContent = async (req, res) => {
  const page = pageFor(req, res);
  if (!page) return;
  try {
    const content = page.clean(req.body?.content);
    if (!content.steps?.length) return res.status(400).json({ success: false, message: 'The page needs at least one step.' });
    const row = await PageContent.findOneAndUpdate(
      { key: req.params.key },
      { $set: { data: content } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();
    res.status(200).json({ success: true, message: 'Page saved', content: page.clean(row.data), updatedAt: row.updatedAt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not save the page content' });
  }
};
