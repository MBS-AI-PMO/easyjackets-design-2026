import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import { FRONTEND_URL } from '../constant/url';
import BlogRichTextEditor from './BlogRichTextEditor';
import './SiteImages.css';
import './TermsEditor.css';

// Content -> Terms & Conditions: the storefront's /terms-and-conditions page, section by section, stored in the
// database (backend helpers/pageContent.js; the document the client supplied is data/termsDefaults.js, which
// "Restore the original" brings back). Each section is a title and its text, written in the same rich text editor
// as the FAQ answers. The server keeps headings, paragraphs, lists, bold, italic, links, quotes and tables, so the
// page matches the rest of the site. Text still in [square brackets] (the document's placeholders) is listed at
// the top until it is filled in.

const PAGE = 'terms';
const PAGE_PATH = '/terms-and-conditions';

let lastKey = 0;
const newKey = () => { lastKey += 1; return `section-${lastKey}`; };
const clone = (v) => JSON.parse(JSON.stringify(v));
// each section gets a key for the list while it is being edited; it never reaches the database
const forEdit = (content) => ({
    header: { title: '', intro: '', effectiveDate: '', ...(content?.header || {}) },
    sections: (content?.sections || []).map((s) => ({ title: s.title || '', body: s.body || '', _key: newKey() })),
});
const forSave = (content) => ({
    header: content.header,
    sections: content.sections.map(({ _key, ...s }) => s),
});
const move = (list, from, to) => {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};
const plain = (html) => String(html || '')
    .replace(/<\/(p|li|h[1-6]|blockquote|tr)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
// the document's fill-in-later text: "[Customer Service Email]", "[Month Day, Year]"
const PLACEHOLDER = /\[[^[\]<>\n]{2,60}\]/g;
const placeholdersIn = (text) => [...new Set(String(text || '').match(PLACEHOLDER) || [])];

/** One placeholder: the text, how often it is used, the sections it is in (each opens it), and "Replace everywhere". */
function PlaceholderCard({ hole, onOpen, onFill }) {
    const [value, setValue] = useState('');
    const submit = (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onFill(value);
        setValue('');
    };
    return (
        <li className="tc-ph-card">
            <div className="tc-ph-card-top">
                <code className="tc-ph-token">{hole.text}</code>
                <span className="tc-ph-uses">{hole.uses === 1 ? 'Used once' : `Used ${hole.uses} times`}</span>
            </div>
            <div className="tc-ph-where">
                {hole.places.map((p) => (
                    <button key={p.key || 'header'} type="button" className="tc-ph-chip" onClick={() => onOpen(p.key)} title={p.key ? 'Open this section' : 'Go to the page header'}>
                        <span>{p.where}</span>
                        <NorthEastIcon />
                    </button>
                ))}
            </div>
            <form className="tc-ph-fill" onSubmit={submit}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Real value, e.g. support@easyjackets.com"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    inputProps={{ maxLength: 200, 'aria-label': `Replace ${hole.text} with` }}
                />
                <Button type="submit" variant="contained" disableElevation startIcon={<FindReplaceIcon />} disabled={!value.trim()} sx={{ whiteSpace: 'nowrap', flex: 'none' }}>
                    Replace everywhere
                </Button>
            </form>
        </li>
    );
}

function SectionCard({ section, index, count, open, filtered, onToggle, onChange, onMove, onDelete, onAddBelow, cardRef }) {
    const text = plain(section.body);
    const holes = placeholdersIn(`${section.title} ${text}`);
    return (
        <article ref={cardRef} className={`tc-card${open ? ' is-open' : ''}`}>
            <header className="tc-card-head">
                <button type="button" className="tc-card-toggle" onClick={onToggle} aria-expanded={open}>
                    <span className="tc-card-num">{index + 1}</span>
                    <span className="tc-card-heading">
                        <span className={`tc-card-title${section.title ? '' : ' is-empty'}`}>{section.title || 'Untitled section'}</span>
                        {!open ? <span className="tc-card-preview">{text || 'No text yet'}</span> : null}
                    </span>
                    <span className="tc-card-chips">
                        {holes.length ? <span className="tc-chip is-warn">{holes.length === 1 ? '1 placeholder' : `${holes.length} placeholders`}</span> : null}
                        {!text ? <span className="tc-chip">Title only</span> : null}
                    </span>
                    <ExpandMoreIcon className="tc-card-caret" />
                </button>
                <div className="tc-card-actions">
                    <Tooltip title={filtered ? 'Clear the search to reorder' : 'Move up'}><span><IconButton size="small" disabled={filtered || index === 0} onClick={() => onMove(index, index - 1)}><ArrowUpwardIcon fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title={filtered ? 'Clear the search to reorder' : 'Move down'}><span><IconButton size="small" disabled={filtered || index === count - 1} onClick={() => onMove(index, index + 1)}><ArrowDownwardIcon fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title="Add a section below"><span><IconButton size="small" disabled={filtered} onClick={() => onAddBelow(index)}><AddIcon fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title="Delete this section"><span><IconButton size="small" color="error" disabled={count <= 1} onClick={() => onDelete(index)}><DeleteOutlineIcon fontSize="small" /></IconButton></span></Tooltip>
                </div>
            </header>
            {open ? (
                <div className="tc-card-body">
                    <TextField
                        fullWidth
                        size="small"
                        label="Section title"
                        value={section.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        inputProps={{ maxLength: 160 }}
                        helperText="Shown as the section's heading and in the page's “On this page” list. Include the number if you want one, e.g. “7. Sizing & measurements”."
                        sx={{ mb: 2 }}
                    />
                    <BlogRichTextEditor
                        value={section.body}
                        onChange={(body) => onChange({ body })}
                        placeholder="Write this section here. Use Heading 2 or 3 for a sub-heading, the list buttons for bullet points, and select text to add a link."
                        minHeight={240}
                    />
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 0.75 }}>
                        Shown on the site: sub-headings (Heading 1–3 the same size, Heading 4 smaller), paragraphs, bold, italic, bullet and numbered lists, links, quotes and tables. Colours, fonts, sizes, alignment and images are left out so the page matches the rest of the site.
                    </Typography>
                </div>
            ) : null}
        </article>
    );
}

const TermsEditor = () => {
    const [content, setContent] = useState(null);
    const [defaults, setDefaults] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [openKeys, setOpenKeys] = useState(() => new Set());
    const [query, setQuery] = useState('');
    const cardRefs = useRef({});
    const headerRef = useRef(null);
    const scrollTo = useRef(null);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const [page, shipped] = await Promise.all([
                instance.get(`/page-content/${PAGE}`),
                instance.get(`/page-content/${PAGE}/defaults`),
            ]);
            setContent(forEdit(page.data?.content || shipped.data?.content));
            setDefaults(shipped.data?.content || null);
            setUpdatedAt(page.data?.updatedAt || null);
            setOpenKeys(new Set());
            setDirty(false);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Could not load the terms.';
            setLoadError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    // leaving with unsaved changes asks first (closing the tab or reloading)
    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    // a section just opened from elsewhere on the page (a placeholder, a new section) is brought into view
    useEffect(() => {
        const key = scrollTo.current;
        if (!key) return;
        scrollTo.current = null;
        cardRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const update = (fn) => {
        setContent((prev) => {
            const next = { header: { ...prev.header }, sections: [...prev.sections] };
            fn(next);
            return next;
        });
        setDirty(true);
    };
    const toggle = (key) => setOpenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });
    const reveal = (key) => {
        setQuery('');
        setOpenKeys((prev) => new Set(prev).add(key));
        scrollTo.current = key;
    };
    const addAt = (index) => {
        const key = newKey();
        update((c) => { c.sections.splice(index, 0, { title: '', body: '', _key: key }); });
        reveal(key);
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await instance.put(`/page-content/${PAGE}`, { content: forSave(content) });
            // the server's cleaned copy, keeping which sections are open
            const saved = res.data?.content;
            if (saved) {
                setContent((prev) => ({
                    header: { ...prev.header, ...saved.header },
                    sections: saved.sections.map((s, i) => ({ ...s, _key: prev.sections[i]?._key || newKey() })),
                }));
            }
            setUpdatedAt(res.data?.updatedAt || new Date().toISOString());
            setDirty(false);
            toast.success('Terms & Conditions saved. The site shows them within a minute.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save the terms.');
        } finally {
            setSaving(false);
        }
    };

    const restore = () => {
        if (!defaults) return;
        if (!window.confirm('Put back the original Terms & Conditions document, replacing every section? Nothing changes on the site until you press Save.')) return;
        setContent(forEdit(clone(defaults)));
        setOpenKeys(new Set());
        setDirty(true);
    };

    // every [placeholder] still in the text: where it is, and how many times
    const holes = useMemo(() => {
        if (!content) return [];
        const found = new Map();
        const note = (text, where, key) => {
            for (const p of String(text || '').match(PLACEHOLDER) || []) {
                if (!found.has(p)) found.set(p, { uses: 0, places: [] });
                const entry = found.get(p);
                entry.uses += 1;
                if (!entry.places.some((x) => x.key === key)) entry.places.push({ where, key });
            }
        };
        note(`${content.header.title} ${content.header.intro} ${content.header.effectiveDate}`, 'Page header', null);
        content.sections.forEach((s) => note(`${s.title} ${plain(s.body)}`, s.title || 'Untitled section', s._key));
        return [...found.entries()].map(([text, { uses, places }]) => ({ text, uses, places }));
    }, [content]);

    // "Replace everywhere": the placeholder swapped for the value in the header, every title and every text
    const fill = (placeholder, raw) => {
        const value = raw.replace(/\s+/g, ' ').trim();
        if (!value) return;
        const asHtml = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let count = 0;
        const swap = (s, replacement) => {
            const parts = String(s || '').split(placeholder);
            count += parts.length - 1;
            return parts.join(replacement);
        };
        const next = {
            header: Object.fromEntries(Object.entries(content.header).map(([k, v]) => [k, swap(v, value)])),
            sections: content.sections.map((s) => ({ ...s, title: swap(s.title, value), body: swap(s.body, asHtml) })),
        };
        if (!count) {
            // the brackets are split by formatting (part of it bold, say): only the section's own editor can reach it
            toast.info(`${placeholder} is split by formatting. Open its section and change it there.`);
            return;
        }
        setContent(next);
        setDirty(true);
        toast.success(`${placeholder} replaced ${count === 1 ? 'once' : `${count} times`}. Press Save to put it on the site.`);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
    }
    if (!content) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{loadError || 'Could not load the terms.'}</Alert>
            </Box>
        );
    }

    const { header, sections } = content;
    const q = query.trim().toLowerCase();
    const shown = sections
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => !q || `${section.title} ${plain(section.body)}`.toLowerCase().includes(q));
    const words = sections.reduce((n, s) => n + (plain(s.body).match(/\S+/g)?.length || 0), 0);

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, pb: 12, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            {/* the page's header: what it is and where it shows, the actions, then the figures at a glance */}
            <section className="tc-top">
                <div className="tc-top-main">
                    <span className="tc-top-icon"><GavelOutlinedIcon /></span>
                    <div className="tc-top-text">
                        <div className="tc-top-crumb">Content · Storefront page</div>
                        <h1 className="tc-top-title">Terms & Conditions</h1>
                        <div className="tc-top-meta">
                            <a href={`${FRONTEND_URL}${PAGE_PATH}`} target="_blank" rel="noopener noreferrer">{PAGE_PATH}<OpenInNewIcon /></a>
                            <span aria-hidden="true">·</span>
                            <span>{updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}` : 'Not edited yet: the document as supplied'}</span>
                        </div>
                    </div>
                    <div className="tc-top-actions">
                        <Button size="small" color="inherit" startIcon={<RestoreIcon />} onClick={restore} disabled={!defaults} sx={{ textTransform: 'none', fontWeight: 600, color: '#475467' }}>Restore the original</Button>
                        <Button size="small" variant="outlined" endIcon={<OpenInNewIcon fontSize="small" />} href={`${FRONTEND_URL}${PAGE_PATH}`} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2.5 }}>See the page</Button>
                        <Button size="small" variant="contained" disableElevation startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />} onClick={save} disabled={saving || !dirty} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 2.5 }}>
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </div>
                <div className="tc-top-stats">
                    <div className="tc-stat"><strong>{sections.length}</strong><span>Sections</span></div>
                    <div className="tc-stat"><strong>{words.toLocaleString()}</strong><span>Words</span></div>
                    <div className={`tc-stat${holes.length ? ' is-warn' : ' is-good'}`}><strong>{holes.length}</strong><span>{holes.length === 1 ? 'Placeholder left' : 'Placeholders left'}</span></div>
                    <div className={`tc-stat tc-stat-status${dirty ? ' is-warn' : ' is-good'}`}>
                        <strong><i aria-hidden="true" />{dirty ? 'Unsaved' : 'Up to date'}</strong>
                        <span>{dirty ? 'Changes not on the site yet' : 'The site shows this version'}</span>
                    </div>
                </div>
                <p className="tc-top-help">
                    Open a section to edit its title and text in the same editor as the FAQ answers. The page's “On this page” list is made from the section titles, in this order.
                </p>
            </section>

            {/* while there is something to save, a small bar at the bottom of the screen keeps Save in reach */}
            {dirty ? (
                <div className="pp-floatbar" role="status">
                    <span className="pp-floatbar-dot" aria-hidden="true" />
                    <span>Unsaved changes</span>
                    <Button size="small" color="inherit" onClick={() => { if (window.confirm('Throw away your unsaved changes?')) load(); }} disabled={saving}>Discard</Button>
                    <Button size="small" variant="contained" startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />} onClick={save} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            ) : null}

            {holes.length ? (
                <section className="tc-ph" aria-labelledby="tc-ph-title">
                    <header className="tc-ph-head">
                        <span className="tc-ph-icon"><WarningAmberRoundedIcon /></span>
                        <div className="tc-ph-intro">
                            <h2 id="tc-ph-title">Placeholders to fill in <span className="tc-ph-count">{holes.length}</span></h2>
                            <p>Text in [square brackets] left in the document to be completed. It shows on the site exactly as written until it is replaced: type the real value once and it goes in everywhere it is used, or open a section to edit it there.</p>
                        </div>
                    </header>
                    <ul className="tc-ph-list">
                        {holes.map((h) => (
                            <PlaceholderCard
                                key={h.text}
                                hole={h}
                                onOpen={(key) => (key ? reveal(key) : headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
                                onFill={(value) => fill(h.text, value)}
                            />
                        ))}
                    </ul>
                </section>
            ) : null}

            <div className="pp-list">
                <article className="pp-card" ref={headerRef}>
                    <header className="pp-card-head">
                        <div>
                            <div className="pp-card-crumb">Top of the page</div>
                            <h3 className="pp-card-title">Page header</h3>
                        </div>
                    </header>
                    <div className="pp-card-pad">
                        <TextField fullWidth size="small" sx={{ mb: 2 }} label="Page title" value={header.title} inputProps={{ maxLength: 80 }}
                            onChange={(e) => update((c) => { c.header.title = e.target.value; })} helperText="The big title at the top of the page." />
                        <TextField fullWidth size="small" sx={{ mb: 2 }} multiline minRows={2} label="Introduction" value={header.intro} inputProps={{ maxLength: 600 }}
                            onChange={(e) => update((c) => { c.header.intro = e.target.value; })} helperText="One or two lines under the title. Leave empty to show none." />
                        <TextField fullWidth size="small" label="Effective date" value={header.effectiveDate} inputProps={{ maxLength: 80 }}
                            onChange={(e) => update((c) => { c.header.effectiveDate = e.target.value; })} helperText="Shown under the introduction as “Effective date: …”, e.g. October 22, 2026. Leave empty to show none." />
                    </div>
                </article>

                <article className="pp-card">
                    <header className="pp-card-head">
                        <div>
                            <div className="pp-card-crumb">The terms</div>
                            <h3 className="pp-card-title">Sections</h3>
                        </div>
                        <div className="pp-card-head-side">
                            <TextField
                                size="small"
                                placeholder="Find in the terms"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                                sx={{ width: { xs: '100%', sm: 260 } }}
                            />
                            <Button size="small" color="inherit" startIcon={<UnfoldLessIcon />} disabled={!openKeys.size} onClick={() => setOpenKeys(new Set())}>Close all</Button>
                        </div>
                    </header>
                    <div className="tc-list">
                        {q && !shown.length ? <Typography color="text.secondary" sx={{ p: 2 }}>No section mentions “{query.trim()}”.</Typography> : null}
                        {q && shown.length ? <Typography variant="body2" color="text.secondary" sx={{ px: 0.5, pb: 1 }}>{shown.length} of {sections.length} sections mention “{query.trim()}”.</Typography> : null}
                        {shown.map(({ section, index }) => (
                            <SectionCard
                                key={section._key}
                                cardRef={(el) => { cardRefs.current[section._key] = el; }}
                                section={section}
                                index={index}
                                count={sections.length}
                                open={openKeys.has(section._key)}
                                filtered={Boolean(q)}
                                onToggle={() => toggle(section._key)}
                                onChange={(patch) => update((c) => { c.sections[index] = { ...c.sections[index], ...patch }; })}
                                onMove={(from, to) => update((c) => { c.sections = move(c.sections, from, to); })}
                                onAddBelow={(i) => addAt(i + 1)}
                                onDelete={(i) => {
                                    if (!window.confirm(`Delete the section “${section.title || 'Untitled section'}”? Nothing changes on the site until you press Save.`)) return;
                                    update((c) => { c.sections.splice(i, 1); });
                                }}
                            />
                        ))}
                        {!q ? (
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addAt(sections.length)} sx={{ mt: 1, alignSelf: 'flex-start' }} disabled={sections.length >= 60}>
                                Add a section
                            </Button>
                        ) : null}
                    </div>
                </article>
            </div>
        </Box>
    );
};

export default TermsEditor;
