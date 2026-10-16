import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Switch,
    FormControlLabel,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import { FRONTEND_URL, uploadUrl } from '../constant/url';
import { MAX_EDGE, checkPhoto, fileProblem, readSize } from '../constant/imageChecks';
import PageWireframe from './PageWireframe';
import { PhotoDrop, PhotoNotes, SpecTiles } from './PhotoParts';
import './SiteImages.css';

// Content -> How to Design Page: every text and image on the storefront's /how-to-design-jacket page, stored
// in the database (backend helpers/pageContent.js; the page shipped with the content "Restore the original"
// brings back). Each section shows where it is on the page; each image the size to upload and a check of the
// chosen file. Images are uploaded when chosen and become part of the page on Save.

const PAGE = 'how-to-design';
const PAGE_PATH = '/how-to-design-jacket';
const SHOT = { ratio: [16, 9], recommended: [1600, 900], minimum: [1280, 720], fit: 'contain' };
const BANNER = { ratio: [27, 10], recommended: [1600, 592], minimum: [1200, 444], fit: 'contain' };

const clone = (v) => JSON.parse(JSON.stringify(v));
const num = (i) => String(i + 1).padStart(2, '0');
const move = (list, from, to) => {
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};
// the editor's own helpers (`_substeps`, kept while a step shows one screenshot) never reach the database
const forSave = (content) => ({
    ...content,
    steps: content.steps.map(({ _substeps, ...step }) => step),
});

function Field({ label, value, onChange, max, multiline, helper, placeholder }) {
    const v = value || '';
    return (
        <TextField
            fullWidth
            size="small"
            label={label}
            value={v}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            inputProps={{ maxLength: max }}
            helperText={`${helper ? `${helper} · ` : ''}${v.length}/${max}`}
            sx={{ mb: 2 }}
        />
    );
}

/** A list of short texts (chips, bullet points): add, remove, reorder. */
function TextList({ label, items = [], onChange, max, maxItems, addLabel }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{label}</Typography>
            {items.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 1 }}>
                    <TextField fullWidth size="small" value={item} inputProps={{ maxLength: max }} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
                    <IconButton size="small" aria-label="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, i - 1))}><ArrowUpwardIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, i + 1))}><ArrowDownwardIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} disabled={items.length >= maxItems} onClick={() => onChange([...items, ''])}>{addLabel}</Button>
        </Box>
    );
}

/** An image on the page: framed as the site frames it, a drop zone, the size guide and a check of the file.
 *  The file is uploaded when chosen and becomes part of the page on Save. */
function ImageField({ label, value, onChange, spec, alt, onAlt, onRemove }) {
    const [size, setSize] = useState(null);
    const [notes, setNotes] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        let alive = true;
        setSize(null);
        readSize(uploadUrl(value)).then((s) => { if (alive) setSize(s); });
        return () => { alive = false; };
    }, [value]);

    const pick = async (file) => {
        const problem = fileProblem(file);
        if (problem) { toast.error(problem); return; }
        const local = URL.createObjectURL(file);
        const chosen = await readSize(local);
        URL.revokeObjectURL(local);
        if (!chosen) { toast.error('That file could not be read as a photo.'); return; }
        setUploading(true);
        try {
            const form = new FormData();
            form.append('image', file);
            const res = await instance.post('/metadata/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (!res.data?.url) throw new Error('The upload did not return an address.');
            setNotes(checkPhoto(chosen, spec));
            onChange(res.data.url);
            toast.info('Photo uploaded. Press Save to put it on the page.');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="pp-imgfield">
            <div className="pp-imgfield-head">
                <span className="pp-section-label">{label}</span>
                {onRemove && value ? <Button size="small" color="inherit" onClick={onRemove}>Remove</Button> : null}
            </div>
            <div className="pp-imgfield-body">
                <PhotoDrop src={uploadUrl(value)} ratio={spec.ratio} fit={spec.fit} badge={size ? `${size.w} × ${size.h} px` : ''} busy={uploading} onFile={pick} height={170} emptyText="No image yet" />
                <div className="pp-imgfield-info">
                    <SpecTiles spec={spec} />
                    <PhotoNotes notes={notes} />
                    {onAlt ? (
                        <TextField fullWidth size="small" sx={{ mt: 2 }} label="Description (for screen readers and Google)" value={alt || ''} inputProps={{ maxLength: 300 }} onChange={(e) => onAlt(e.target.value)} />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

/** One part of the page, as a card: where it is (sketch + words), then its fields. */
function Section({ title, where, wire, mark, actions, children }) {
    return (
        <article className="pp-card">
            <header className="pp-card-head">
                <div>
                    <div className="pp-card-crumb">How to Design page</div>
                    <h3 className="pp-card-title">{title}</h3>
                </div>
                {actions ? <div className="pp-card-head-side">{actions}</div> : null}
            </header>
            <div className="pp-card-pad">
                <div className="pp-where">
                    <div className="pp-where-sketch"><PageWireframe wire={wire} label={mark} /></div>
                    <div>
                        <div className="pp-section-label">Where it is</div>
                        <p className="pp-where-text">{where}</p>
                    </div>
                </div>
                {children}
            </div>
        </article>
    );
}

const HowToDesignEditor = () => {
    const [content, setContent] = useState(null);
    const [defaults, setDefaults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const [page, shipped] = await Promise.all([
                instance.get(`/page-content/${PAGE}`),
                instance.get(`/page-content/${PAGE}/defaults`),
            ]);
            setContent(clone(page.data?.content || shipped.data?.content));
            setDefaults(shipped.data?.content || null);
            setDirty(false);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Could not load the page.';
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

    const update = (fn) => {
        setContent((prev) => {
            const next = clone(prev);
            fn(next);
            return next;
        });
        setDirty(true);
    };
    const setStep = (i, fn) => update((c) => { fn(c.steps[i]); });

    const save = async () => {
        setSaving(true);
        try {
            const res = await instance.put(`/page-content/${PAGE}`, { content: forSave(content) });
            setContent(clone(res.data?.content || content));
            setDirty(false);
            toast.success('How to Design page saved. The site shows it within a minute.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save the page.');
        } finally {
            setSaving(false);
        }
    };

    const restore = () => {
        if (!defaults) return;
        if (!window.confirm('Put back the original text and images of the whole page? Nothing changes on the site until you press Save.')) return;
        setContent(clone(defaults));
        setDirty(true);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
    }
    if (!content) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{loadError || 'Could not load the page.'}</Alert>
            </Box>
        );
    }

    const { header = {}, overview = {}, steps = [], cta = {} } = content;

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, pb: 12, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            {/* the header every admin page has (as Top Bar, Features…): icon, title and actions, then a line of help */}
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <MenuBookOutlinedIcon sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>How to Design Page</Typography>
                        <Button endIcon={<OpenInNewIcon fontSize="small" />} href={`${FRONTEND_URL}${PAGE_PATH}`} target="_blank" rel="noopener noreferrer">See the page</Button>
                        <Button color="inherit" startIcon={<RestoreIcon />} onClick={restore} disabled={!defaults}>Restore the original</Button>
                        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={save} disabled={saving || !dirty}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        All the text and images of the How to Design page, section by section. Images are converted to WebP and stored at most {MAX_EDGE} px on the longest side. The campaign card at the top right of the page is in Content → Site Images.
                    </Typography>
                </CardContent>
            </Card>

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

            <div className="pp-list">
                <Section title="Page header" mark="This text" wire={{ layout: 'htdHeader' }} where="The top of the page, left of the campaign card: the small gold label, the big two-line title (the second line is gold), the introduction and the jacket-style chips under it.">
                    <Field label="Small label above the title" value={header.eyebrow} max={60} onChange={(v) => update((c) => { c.header.eyebrow = v; })} />
                    <Field label="Title, first line" value={header.titleLine1} max={60} onChange={(v) => update((c) => { c.header.titleLine1 = v; })} />
                    <Field label="Title, second line (gold)" value={header.titleLine2} max={60} onChange={(v) => update((c) => { c.header.titleLine2 = v; })} />
                    <Field label="Introduction" value={header.intro} max={400} multiline onChange={(v) => update((c) => { c.header.intro = v; })} />
                    <TextList label="Jacket-style chips" items={header.chips} max={40} maxItems={8} addLabel="Add a chip" onChange={(items) => update((c) => { c.header.chips = items; })} />
                </Section>

                <Section title="Jacket styles banner" mark="This photo" wire={{ layout: 'htdOverview' }} where="The wide picture under the header that shows the jacket styles the builder starts from.">
                    <ImageField label="Banner image" spec={BANNER} value={overview.image} alt={overview.alt}
                        onChange={(url) => update((c) => { c.overview.image = url; })}
                        onAlt={(v) => update((c) => { c.overview.alt = v; })} />
                </Section>

                {steps.map((step, i) => {
                    const several = Boolean(step.substeps?.length);
                    return (
                        <Section
                            key={i}
                            title={`Step ${num(i)}${step.title ? ` · ${step.title}` : ''}`}
                            mark={several ? 'These photos' : 'This step'}
                            wire={{ layout: several ? 'htdSubsteps' : 'htdStep' }}
                            where={several
                                ? `Step ${num(i)} down the page: its number (automatic), title and text, then its screenshots in a grid of three, each with a short label and line under it.`
                                : `Step ${num(i)} down the page: its number (automatic), title, text and bullet points on one side and the screenshot on the other (the sides alternate from step to step).`}
                            actions={(
                                <>
                                    <Tooltip title="Move up"><span><IconButton disabled={i === 0} onClick={() => update((c) => { c.steps = move(c.steps, i, i - 1); })}><ArrowUpwardIcon /></IconButton></span></Tooltip>
                                    <Tooltip title="Move down"><span><IconButton disabled={i === steps.length - 1} onClick={() => update((c) => { c.steps = move(c.steps, i, i + 1); })}><ArrowDownwardIcon /></IconButton></span></Tooltip>
                                    <Tooltip title="Delete this step"><span><IconButton disabled={steps.length <= 1} onClick={() => { if (window.confirm(`Delete step ${num(i)}?`)) update((c) => { c.steps.splice(i, 1); }); }}><DeleteOutlineIcon /></IconButton></span></Tooltip>
                                </>
                            )}
                        >
                            <Field label="Step title" value={step.title} max={80} onChange={(v) => setStep(i, (s) => { s.title = v; })} />
                            <Field label="Step text" value={step.desc} max={600} multiline onChange={(v) => setStep(i, (s) => { s.desc = v; })} />
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={several ? 'several' : 'one'}
                                sx={{ mb: 2 }}
                                onChange={(_, value) => {
                                    if (!value) return;
                                    setStep(i, (s) => {
                                        if (value === 'several') {
                                            s.substeps = s._substeps?.length ? s._substeps : [{ label: '', detail: '', image: '' }];
                                            delete s._substeps;
                                        } else {
                                            s._substeps = s.substeps;
                                            s.substeps = [];
                                        }
                                    });
                                }}
                            >
                                <ToggleButton value="one">One screenshot</ToggleButton>
                                <ToggleButton value="several">Several screenshots</ToggleButton>
                            </ToggleButtonGroup>

                            {several ? (
                                <Box>
                                    {step.substeps.map((sub, j) => (
                                        <Box key={j} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, p: 2, mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>Screenshot {j + 1} of {step.substeps.length}</Typography>
                                                <IconButton size="small" aria-label="Move up" disabled={j === 0} onClick={() => setStep(i, (s) => { s.substeps = move(s.substeps, j, j - 1); })}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" aria-label="Move down" disabled={j === step.substeps.length - 1} onClick={() => setStep(i, (s) => { s.substeps = move(s.substeps, j, j + 1); })}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" aria-label="Remove" disabled={step.substeps.length <= 1} onClick={() => setStep(i, (s) => { s.substeps.splice(j, 1); })}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                            </Box>
                                            <Field label="Label (bold)" value={sub.label} max={60} onChange={(v) => setStep(i, (s) => { s.substeps[j].label = v; })} />
                                            <Field label="Line under it" value={sub.detail} max={160} onChange={(v) => setStep(i, (s) => { s.substeps[j].detail = v; })} />
                                            <ImageField label="Screenshot" spec={SHOT} value={sub.image} onChange={(url) => setStep(i, (s) => { s.substeps[j].image = url; })} />
                                        </Box>
                                    ))}
                                    <Button size="small" startIcon={<AddIcon />} disabled={step.substeps.length >= 12} onClick={() => setStep(i, (s) => { s.substeps.push({ label: '', detail: '', image: '' }); })}>Add a screenshot</Button>
                                </Box>
                            ) : (
                                <Box>
                                    <TextList label="Bullet points (optional)" items={step.bullets || []} max={120} maxItems={12} addLabel="Add a bullet point" onChange={(items) => setStep(i, (s) => { s.bullets = items; })} />
                                    <ImageField label="Screenshot" spec={SHOT} value={step.image} onChange={(url) => setStep(i, (s) => { s.image = url; })} />
                                    <FormControlLabel
                                        sx={{ mb: 1 }}
                                        control={<Switch checked={Boolean(step.resultImage) || step._result === true} onChange={(e) => setStep(i, (s) => {
                                            if (e.target.checked) { s._result = true; } else { delete s._result; s.resultImage = ''; s.resultCaption = ''; }
                                        })} />}
                                        label="Show a second “result” screenshot under it"
                                    />
                                    {step.resultImage || step._result ? (
                                        <Box sx={{ pl: { md: 2 }, borderLeft: { md: '3px solid #e5e7eb' } }}>
                                            <Field label="Caption above the result" value={step.resultCaption} max={160} onChange={(v) => setStep(i, (s) => { s.resultCaption = v; })} />
                                            <ImageField label="Result screenshot" spec={SHOT} value={step.resultImage} onChange={(url) => setStep(i, (s) => { s.resultImage = url; })} />
                                        </Box>
                                    ) : null}
                                </Box>
                            )}
                        </Section>
                    );
                })}

                <Box>
                    <Button variant="outlined" startIcon={<AddIcon />} disabled={steps.length >= 12} onClick={() => update((c) => { c.steps.push({ title: '', desc: '', image: '' }); })}>
                        Add a step
                    </Button>
                </Box>

                <Section title="Bottom banner" mark="This text" wire={{ layout: 'htdCta' }} where="The dark banner at the bottom of the page, above the footer: a small gold label, a two-line title (the second line is gold), a line of text and two buttons.">
                    <Field label="Small label" value={cta.eyebrow} max={60} onChange={(v) => update((c) => { c.cta.eyebrow = v; })} />
                    <Field label="Title, first line" value={cta.titleLine1} max={60} onChange={(v) => update((c) => { c.cta.titleLine1 = v; })} />
                    <Field label="Title, second line (gold)" value={cta.titleLine2} max={60} onChange={(v) => update((c) => { c.cta.titleLine2 = v; })} />
                    <Field label="Text" value={cta.text} max={400} multiline onChange={(v) => update((c) => { c.cta.text = v; })} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                            <Field label="Gold button text" value={cta.primaryLabel} max={40} onChange={(v) => update((c) => { c.cta.primaryLabel = v; })} />
                            <Field label="Gold button link" value={cta.primaryHref} max={500} helper="a page here, e.g. /design-custom-jacket, or https://…" onChange={(v) => update((c) => { c.cta.primaryHref = v; })} />
                        </Box>
                        <Box>
                            <Field label="Outline button text" value={cta.secondaryLabel} max={40} onChange={(v) => update((c) => { c.cta.secondaryLabel = v; })} />
                            <Field label="Outline button link" value={cta.secondaryHref} max={500} helper="a page here, e.g. /fabrics, or https://…" onChange={(v) => update((c) => { c.cta.secondaryHref = v; })} />
                        </Box>
                    </Box>
                </Section>
            </div>
        </Box>
    );
};

export default HowToDesignEditor;
