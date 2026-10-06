import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    Paper,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    ArrowDownward,
    ArrowUpward,
    AutoAwesome,
    Delete,
    Description,
    Edit,
    HelpOutline,
    Search,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import BlogRichTextEditor from './BlogRichTextEditor';
import { autoCategory, categorySuggestions, groupedPageLabel, isGroupedPage } from './faqCategories';
import { cleanHtml } from '../utils/safeHtml';

const FAQ_ENDPOINT = '/features/page-faqs';
const ROUTES_ENDPOINT = '/metadata/available-routes';

const emptyForm = { question: '', answer: '', points: '', category: '', isActive: true };

// The FAQ page and the bulk order page group their questions under headings
// (faqCategories.js); an admin can type any other name. A question with no
// category is grouped by what it asks about, and this screen shows that heading.

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

/**
 * Preview a template entry the way the storefront will render it, so an admin can
 * see that "{productName}" becomes a real jacket name before saving.
 */
const applyTemplate = (text, placeholders = []) =>
    String(text || '').replace(/\{(\w+)\}/g, (match, token) => {
        const found = placeholders.find((p) => p.token === `{${token}}`);
        return found ? found.example : match;
    });

/**
 * Answers are written in the rich text editor, so an "empty" answer is not an
 * empty string — leaving the editor untouched still yields '<p><br></p>'.
 */
const hasVisibleText = (html) =>
    String(html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim().length > 0;

/**
 * Answers as the storefront shows them, so the list and the preview read like
 * the live page instead of showing raw tags. Links use the same terracotta the
 * blog and the storefront use.
 */
const RichText = ({ html, sx }) => (
    <Box
        sx={{
            '& > :first-of-type': { mt: 0 },
            '& > :last-child': { mb: 0 },
            '& p': { m: '0 0 8px' },
            '& a': {
                color: '#ad5d30',
                fontWeight: 700,
                textDecoration: 'underline',
                textUnderlineOffset: '0.2em',
            },
            '& ul, & ol': { m: '8px 0', pl: 3 },
            '& li': { m: '4px 0' },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
            '& blockquote': {
                m: '10px 0',
                pl: 1.75,
                borderLeft: '3px solid #ad5d30',
                color: '#7c2d12',
            },
            ...sx,
        }}
        dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
    />
);

const StorefrontFaqs = () => {
    const [pages, setPages] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [activePage, setActivePage] = useState('');
    const [pageSearch, setPageSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [addPageOpen, setAddPageOpen] = useState(false);
    const [routeOptions, setRouteOptions] = useState([]);
    const [newPageRoute, setNewPageRoute] = useState(null);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await instance.get(`${FAQ_ENDPOINT}/admin`);
            setPages(response.data?.pages || []);
            setFaqs(response.data?.faqs || []);
            setLoadError('');
        } catch (error) {
            setLoadError(getErrorMessage(error, 'Could not load FAQs.'));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoutes = useCallback(async () => {
        try {
            const response = await instance.get(ROUTES_ENDPOINT);
            // Product pages are driven by the template, not per-URL FAQ lists, so
            // offering all 145 of them here would invite work that does nothing.
            setRouteOptions((response.data?.routes || []).filter((r) => r.source !== 'product'));
        } catch (error) {
            console.error('Could not load routes:', error);
        }
    }, []);

    useEffect(() => {
        fetchFaqs();
        fetchRoutes();
    }, [fetchFaqs, fetchRoutes]);

    useEffect(() => {
        if (!activePage && pages.length) setActivePage(pages[0].pageKey);
    }, [pages, activePage]);

    const currentPage = pages.find((page) => page.pageKey === activePage) || null;

    // Templates first — one edit there changes hundreds of pages, so it is the
    // highest-leverage thing on the screen and should not be buried mid-list.
    const { templatePages, sitePages } = useMemo(() => {
        const search = pageSearch.trim().toLowerCase();
        const matches = (page) => !search
            || `${page.label} ${page.pageKey}`.toLowerCase().includes(search);

        return {
            templatePages: pages.filter((p) => p.isTemplate && matches(p)),
            sitePages: pages.filter((p) => !p.isTemplate && matches(p)),
        };
    }, [pages, pageSearch]);

    const pageFaqs = useMemo(
        () => faqs
            .filter((faq) => faq.pageKey === activePage)
            .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
        [faqs, activePage]
    );

    const totalFaqs = faqs.length;
    const hiddenCount = pageFaqs.filter((f) => f.isActive === false).length;

    const openCreate = () => {
        setEditId(null);
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (faq) => {
        setEditId(faq._id);
        setFormData({
            question: faq.question || '',
            answer: faq.answer || '',
            points: (faq.points || []).join('\n'),
            category: faq.category || '',
            isActive: faq.isActive !== false,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const question = formData.question.trim();
        const answer = formData.answer.trim();
        if (!question || !hasVisibleText(answer)) {
            toast.error('Question and answer are both required.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                question,
                answer,
                points: formData.points.split('\n').map((p) => p.trim()).filter(Boolean),
                category: formData.category.trim(),
                isActive: formData.isActive,
            };

            if (editId) {
                await instance.put(`${FAQ_ENDPOINT}/${editId}`, payload);
                toast.success('FAQ updated.');
            } else {
                await instance.post(FAQ_ENDPOINT, { ...payload, pageKey: activePage });
                toast.success('FAQ added.');
            }
            setDialogOpen(false);
            await fetchFaqs();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not save the FAQ.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (faq) => {
        if (!window.confirm(`Delete "${faq.question}"? This cannot be undone.`)) return;
        try {
            await instance.delete(`${FAQ_ENDPOINT}/${faq._id}`);
            toast.success('FAQ deleted.');
            await fetchFaqs();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not delete the FAQ.'));
        }
    };

    const handleToggleActive = async (faq) => {
        try {
            await instance.put(`${FAQ_ENDPOINT}/${faq._id}`, { isActive: faq.isActive === false });
            await fetchFaqs();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not change visibility.'));
        }
    };

    const handleMove = async (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= pageFaqs.length) return;

        const reordered = [...pageFaqs];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

        // Update locally first so the arrows feel instant, then persist.
        setFaqs((prev) => prev.map((faq) => {
            const position = reordered.findIndex((r) => r._id === faq._id);
            return position === -1 ? faq : { ...faq, sortOrder: position + 1 };
        }));

        try {
            await instance.put(`${FAQ_ENDPOINT}/reorder`, { order: reordered.map((f) => f._id) });
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not save the new order.'));
            fetchFaqs();
        }
    };

    const handleAddPage = () => {
        const route = newPageRoute?.route || String(newPageRoute || '').trim();
        if (!route) return;

        if (!pages.some((page) => page.pageKey === route)) {
            // The page only really exists once it has an FAQ, so show it in the
            // sidebar straight away and let the first save create it server-side.
            setPages((prev) => [...prev, { pageKey: route, label: route, total: 0, active: 0, isTemplate: false }]);
        }
        setActivePage(route);
        setAddPageOpen(false);
        setNewPageRoute(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f6f8fb', minHeight: '100vh' }}>
            {/* ── Header ── */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
                gap={2}
                mb={3}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>
                        Storefront FAQs
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
                        {totalFaqs} questions across {pages.length} pages. These also feed the FAQ rich
                        results Google shows.
                    </Typography>
                </Box>
                <Stack direction="row" gap={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setAddPageOpen(true)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                        Add FAQ to a page
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreate}
                        disabled={!activePage}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
                    >
                        New FAQ
                    </Button>
                </Stack>
            </Stack>

            {loadError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{loadError}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3, alignItems: 'start' }}>
                {/* ── Sidebar ── */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: { md: 'sticky' }, top: 16 }} elevation={0}>
                    <Box sx={{ p: 1.5, borderBottom: '1px solid #eef2f7' }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Find a page"
                            value={pageSearch}
                            onChange={(e) => setPageSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2, bgcolor: '#f8fafc' },
                            }}
                        />
                    </Box>

                    <Box sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <SidebarGroup
                            title="Templates"
                            caption="One edit updates every page of that type"
                            pages={templatePages}
                            activePage={activePage}
                            onSelect={setActivePage}
                        />
                        <SidebarGroup
                            title="Pages"
                            pages={sitePages}
                            activePage={activePage}
                            onSelect={setActivePage}
                        />
                        {!templatePages.length && !sitePages.length && (
                            <Typography variant="caption" sx={{ display: 'block', p: 3, textAlign: 'center', color: '#94a3b8' }}>
                                No pages match “{pageSearch}”.
                            </Typography>
                        )}
                    </Box>
                </Paper>

                {/* ── Content ── */}
                <Box>
                    <Paper sx={{ borderRadius: 3, p: 2.5, mb: 2 }} elevation={0}>
                        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                            <Box
                                sx={{
                                    width: 40, height: 40, borderRadius: 2,
                                    display: 'grid', placeItems: 'center',
                                    bgcolor: currentPage?.isTemplate ? '#fff4e5' : '#e8f1ff',
                                    color: currentPage?.isTemplate ? '#b26a00' : '#1e88e5',
                                }}
                            >
                                {currentPage?.isTemplate ? <AutoAwesome /> : <Description />}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                    {currentPage?.label || activePage}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {currentPage?.isTemplate
                                        ? `Applies to ${currentPage.template?.scope}`
                                        : `Shown on ${activePage}`}
                                </Typography>
                            </Box>
                            <Stack direction="row" gap={1}>
                                <Chip
                                    size="small"
                                    label={`${pageFaqs.length} question${pageFaqs.length === 1 ? '' : 's'}`}
                                    sx={{ fontWeight: 700, bgcolor: '#eef2f7', color: '#475569' }}
                                />
                                {hiddenCount > 0 && (
                                    <Chip
                                        size="small"
                                        label={`${hiddenCount} hidden`}
                                        sx={{ fontWeight: 700, bgcolor: '#fef3c7', color: '#92400e' }}
                                    />
                                )}
                            </Stack>
                        </Stack>

                        {currentPage?.isTemplate && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fffbf5', border: '1px solid #ffe8cc', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ color: '#8d5b00' }}>
                                    {currentPage.template?.description} Use{' '}
                                    {currentPage.template?.placeholders?.map((p) => (
                                        <code
                                            key={p.token}
                                            style={{ background: '#ffe8cc', padding: '1px 6px', borderRadius: 4, marginRight: 4, fontWeight: 700 }}
                                        >
                                            {p.token}
                                        </code>
                                    ))}
                                    — it becomes the real value on each page.
                                </Typography>
                            </Box>
                        )}

                        {!currentPage?.isTemplate && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#94a3b8' }}>
                                Each page keeps its own list, so editing here does not change the same
                                question on another page.
                            </Typography>
                        )}
                    </Paper>

                    <FaqList
                        pageKey={activePage}
                        faqs={pageFaqs}
                        placeholders={currentPage?.template?.placeholders || []}
                        isTemplate={Boolean(currentPage?.isTemplate)}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggleActive}
                        onMove={handleMove}
                        onCreate={openCreate}
                    />
                </Box>
            </Box>

            {/* ── Create / edit ── */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                    {editId ? 'Edit FAQ' : 'New FAQ'}
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontWeight: 500 }}>
                        {currentPage?.label || activePage}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack gap={2.5} sx={{ pt: 1 }}>
                        <TextField
                            label="Question"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            fullWidth
                            autoFocus
                        />
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#334155', mb: 0.75, fontWeight: 700 }}>
                                Answer
                            </Typography>
                            <BlogRichTextEditor
                                value={formData.answer}
                                onChange={(answer) => setFormData((previous) => ({ ...previous, answer }))}
                                placeholder="Write the answer here. Select any text and use the link button to add a link."
                                minHeight={190}
                            />
                            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 0.75 }}>
                                Formatting and links show on the page. Google's FAQ structured data gets the
                                plain text of this answer, so a link is never lost on the page and never
                                breaks the schema.
                            </Typography>
                        </Box>
                        <TextField
                            label="Bullet points (optional, one per line)"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <Box>
                            <TextField
                                label={isGroupedPage(activePage) ? `Category (groups ${groupedPageLabel(activePage)})` : 'Category'}
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                fullWidth
                                inputProps={{ list: 'faq-category-suggestions', maxLength: 60 }}
                                placeholder={isGroupedPage(activePage) && formData.question ? autoCategory(activePage, formData.question, formData.answer) : ''}
                                helperText={isGroupedPage(activePage)
                                    ? (formData.category.trim()
                                        ? "Pick one of the page's headings or type a new one."
                                        : `Leave empty and it is filed under “${autoCategory(activePage, formData.question, formData.answer)}” by what it asks. Pick a heading to set it yourself.`)
                                    : "This page does not group its questions; a category is kept for later use."}
                            />
                            <datalist id="faq-category-suggestions">
                                {categorySuggestions(activePage).map((name) => <option key={name} value={name} />)}
                            </datalist>
                        </Box>

                        {currentPage?.isTemplate && (formData.question || formData.answer) && (
                            <Box sx={{ p: 1.75, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Preview on a real page
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.75, color: '#0f172a' }}>
                                    {applyTemplate(formData.question, currentPage.template?.placeholders)}
                                </Typography>
                                <RichText
                                    html={applyTemplate(formData.answer, currentPage.template?.placeholders)}
                                    sx={{ color: '#475569', fontSize: 14, lineHeight: 1.6, mt: 0.25 }}
                                />
                            </Box>
                        )}

                        <FormControlLabel
                            control={(
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            )}
                            label="Visible on the site"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                        sx={{ textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 2 }}>
                        {saving ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Add an FAQ block to another page ── */}
            <Dialog open={addPageOpen} onClose={() => setAddPageOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Add an FAQ section to a page</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                        Pick any page on the site. It gets its own FAQ list, and the section appears on
                        the page — just above the footer — once the first question is added.
                    </Typography>
                    <Autocomplete
                        options={routeOptions}
                        value={newPageRoute}
                        onChange={(_, value) => setNewPageRoute(value)}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.route || '')}
                        isOptionEqualToValue={(option, value) => option.route === value?.route}
                        freeSolo
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'block !important' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    {option.route}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                                    {option.title}
                                </Typography>
                            </Box>
                        )}
                        renderInput={(params) => <TextField {...params} label="Page" autoFocus />}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAddPageOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddPage} disabled={!newPageRoute}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                        Add page
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const SidebarGroup = ({ title, caption, pages, activePage, onSelect }) => {
    if (!pages.length) return null;

    return (
        <Box sx={{ py: 1 }}>
            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    {title}
                </Typography>
                {caption && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#cbd5e1', lineHeight: 1.4 }}>
                        {caption}
                    </Typography>
                )}
            </Box>
            <List dense disablePadding>
                {pages.map((page) => {
                    const selected = page.pageKey === activePage;
                    return (
                        <ListItemButton
                            key={page.pageKey}
                            selected={selected}
                            onClick={() => onSelect(page.pageKey)}
                            sx={{
                                mx: 1, borderRadius: 2, py: 0.9,
                                '&.Mui-selected': { bgcolor: '#e8f1ff', '&:hover': { bgcolor: '#dbe9ff' } },
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{ fontWeight: selected ? 800 : 600, color: selected ? '#1e88e5' : '#334155' }}
                                >
                                    {page.label}
                                </Typography>
                                {page.label !== page.pageKey && (
                                    <Typography variant="caption" noWrap sx={{ display: 'block', color: '#94a3b8' }}>
                                        {page.pageKey}
                                    </Typography>
                                )}
                            </Box>
                            <Chip
                                size="small"
                                label={page.total}
                                sx={{
                                    height: 20, minWidth: 28, fontSize: 11, fontWeight: 800,
                                    bgcolor: selected ? '#1e88e5' : '#eef2f7',
                                    color: selected ? '#fff' : '#64748b',
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>
        </Box>
    );
};

const FaqList = ({ pageKey, faqs, placeholders, isTemplate, onEdit, onDelete, onToggle, onMove, onCreate }) => {
    if (!faqs.length) {
        return (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }} elevation={0}>
                <HelpOutline sx={{ fontSize: 56, color: '#cbd5e1' }} />
                <Typography variant="h6" sx={{ mt: 1, color: '#475569', fontWeight: 700 }}>
                    No FAQs on this page yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2.5 }}>
                    The FAQ section only appears on the page once it has a question.
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={onCreate}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                    Add the first one
                </Button>
            </Paper>
        );
    }

    return (
        <Stack gap={1.25}>
            {faqs.map((faq, index) => {
                const hidden = faq.isActive === false;
                return (
                    <Paper
                        key={faq._id}
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            p: 2,
                            display: 'flex',
                            gap: 1.5,
                            alignItems: 'flex-start',
                            border: '1px solid #eef2f7',
                            borderLeft: hidden ? '4px solid #cbd5e1' : '4px solid #1e88e5',
                            bgcolor: hidden ? '#fbfcfd' : '#fff',
                            transition: 'box-shadow .2s',
                            '&:hover': { boxShadow: '0 4px 18px rgba(15,23,42,.06)' },
                        }}
                    >
                        <Stack sx={{ pt: 0.25 }}>
                            <IconButton size="small" disabled={index === 0} onClick={() => onMove(index, -1)}>
                                <ArrowUpward sx={{ fontSize: 16 }} />
                            </IconButton>
                            <Typography variant="caption" sx={{ textAlign: 'center', color: '#cbd5e1', fontWeight: 800 }}>
                                {index + 1}
                            </Typography>
                            <IconButton size="small" disabled={index === faqs.length - 1} onClick={() => onMove(index, 1)}>
                                <ArrowDownward sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Stack>

                        <Box sx={{ flex: 1, minWidth: 0, opacity: hidden ? 0.6 : 1 }}>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                    {faq.question}
                                </Typography>
                                {hidden && (
                                    <Chip size="small" label="Hidden"
                                        sx={{ height: 20, fontSize: 11, fontWeight: 800, bgcolor: '#fef3c7', color: '#92400e' }} />
                                )}
                                {faq.category ? (
                                    <Chip size="small" label={faq.category}
                                        sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#e0f2fe', color: '#075985' }} />
                                ) : isGroupedPage(pageKey) && (
                                    <Tooltip title="Filed automatically by what the question asks. Edit the question and pick a category to set it yourself.">
                                        <Chip size="small" variant="outlined" label={`${autoCategory(pageKey, faq.question, faq.answer)} · auto`}
                                            sx={{ height: 20, fontSize: 11, fontWeight: 700, borderStyle: 'dashed', borderColor: '#7dd3fc', color: '#0369a1' }} />
                                    </Tooltip>
                                )}
                            </Stack>
                            <RichText
                                html={faq.answer}
                                sx={{ color: '#475569', fontSize: 14, mt: 0.5, lineHeight: 1.6 }}
                            />
                            {Boolean(faq.points?.length) && (
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5, color: '#64748b' }}>
                                    {faq.points.map((point) => (
                                        <li key={point}><Typography variant="caption">{point}</Typography></li>
                                    ))}
                                </Box>
                            )}
                            {isTemplate && /\{\w+\}/.test(`${faq.question}${faq.answer}`) && (
                                <>
                                    <Divider sx={{ my: 1.25 }} />
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        Renders as <em>{applyTemplate(faq.question, placeholders)}</em>
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Stack direction="row" gap={0.25}>
                            <Tooltip title={hidden ? 'Show on the site' : 'Hide from the site'}>
                                <IconButton size="small" onClick={() => onToggle(faq)} sx={{ color: '#64748b' }}>
                                    {hidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => onEdit(faq)} sx={{ color: '#1e88e5' }}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => onDelete(faq)} sx={{ color: '#ef4444' }}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Paper>
                );
            })}
        </Stack>
    );
};

export default StorefrontFaqs;
