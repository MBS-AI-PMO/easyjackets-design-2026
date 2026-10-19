import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import { FRONTEND_URL, uploadUrl } from '../constant/url';
import { SITE_IMAGE_GROUPS } from '../constant/siteImages';
import { MAX_EDGE, checkPhoto, fileProblem, readSize } from '../constant/imageChecks';
import PageWireframe from './PageWireframe';
import { PhotoDrop, PhotoNotes, SpecTiles } from './PhotoParts';
import SiteSlidesCard from './SiteSlidesCard';
import './SiteImages.css';

// Content -> Site Images: every replaceable photo on the storefront, grouped by page. Each card says where
// the photo is (a sketch of the page with it marked, and a link), the shape and size to upload, previews and
// checks a chosen file before it is saved, and keeps a description for screen readers and search engines.
// Stored in the site settings (Metadata '/global-settings', field siteImages); the backend stores the
// shipped photos there too (helpers/siteImageDefaults.js).

const ALL_SLOTS = SITE_IMAGE_GROUPS.flatMap((g) => g.slots.map((s) => ({ ...s, group: g.title })));

function SlotCard({ slot, group, saved, fallback, onSaved }) {
    const current = saved?.src || fallback?.src || '';
    const currentAlt = saved?.alt || fallback?.alt || '';
    const isShipped = !saved?.src || saved.src === fallback?.src;
    const [currentSize, setCurrentSize] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [fileSize, setFileSize] = useState(null);
    const [alt, setAlt] = useState(currentAlt);
    const [busy, setBusy] = useState(false);

    useEffect(() => { setAlt(currentAlt); }, [currentAlt]);
    useEffect(() => {
        let alive = true;
        setCurrentSize(null);
        readSize(uploadUrl(current)).then((s) => { if (alive) setCurrentSize(s); });
        return () => { alive = false; };
    }, [current]);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const pick = async (chosen) => {
        const problem = fileProblem(chosen);
        if (problem) { toast.error(problem); return; }
        const url = URL.createObjectURL(chosen);
        const size = await readSize(url);
        if (!size) {
            URL.revokeObjectURL(url);
            toast.error('That file could not be read as a photo.');
            return;
        }
        setFile(chosen);
        setPreview(url);
        setFileSize(size);
    };

    const cancel = () => {
        setFile(null);
        setPreview('');
        setFileSize(null);
        setAlt(currentAlt);
    };

    const write = async (entry, message) => {
        // merged into the latest settings, so a change saved meanwhile (another photo, another tab) is kept
        const latest = (await instance.get('/metadata/global-settings')).data?.metadata?.siteImages || {};
        const response = await instance.put('/metadata/global-settings', { siteImages: { ...latest, [slot.key]: entry } });
        onSaved(response.data?.metadata?.siteImages || { ...latest, [slot.key]: entry });
        toast.success(message);
    };

    const save = async () => {
        setBusy(true);
        try {
            let src = current;
            if (file) {
                const form = new FormData();
                form.append('image', file);
                const uploaded = await instance.post('/metadata/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                src = uploaded.data?.url;
                if (!src) throw new Error('The upload did not return an address.');
            }
            await write({ src, alt: alt.trim() }, `${slot.title} saved. The site shows it within a minute.`);
            cancel();
        } catch (error) {
            console.error('Error saving site image:', error);
            toast.error(error.response?.data?.message || error.message || 'Could not save the photo.');
        } finally {
            setBusy(false);
        }
    };

    const restore = async () => {
        if (!fallback?.src || !window.confirm(`Put the original photo back for "${slot.title}"?`)) return;
        setBusy(true);
        try {
            await write({ src: fallback.src, alt: fallback.alt || '' }, `${slot.title}: the original photo is back.`);
            cancel();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Could not restore the photo.');
        } finally {
            setBusy(false);
        }
    };

    const altChanged = alt.trim() !== currentAlt.trim();
    const pending = Boolean(file) || altChanged;
    const badge = preview
        ? `New · ${fileSize.w} × ${fileSize.h} px`
        : currentSize ? `${currentSize.w} × ${currentSize.h} px` : '';

    return (
        <article className={`pp-card${pending ? ' is-pending' : ''}`}>
            <header className="pp-card-head">
                <div>
                    <div className="pp-card-crumb">{group}</div>
                    <h3 className="pp-card-title">{slot.title}</h3>
                </div>
                <div className="pp-card-head-side">
                    <span className={`pp-pill${isShipped ? '' : ' is-own'}`}>{isShipped ? 'Original photo' : 'Your upload'}</span>
                    <a className="pp-link" href={`${FRONTEND_URL}${slot.path}`} target="_blank" rel="noopener noreferrer">
                        See it on the site <OpenInNewIcon fontSize="inherit" />
                    </a>
                </div>
            </header>

            <div className="pp-card-body">
                <div className="pp-card-photo">
                    <PhotoDrop
                        src={preview || uploadUrl(current)}
                        compare={preview ? uploadUrl(current) : ''}
                        ratio={slot.ratio}
                        fit={slot.fit}
                        badge={badge}
                        busy={busy}
                        onFile={pick}
                    />
                    {preview ? <div className="pp-caption">Previewed exactly as the site {slot.fit === 'cover' ? 'crops' : 'shows'} it · not saved yet</div> : null}
                </div>

                <div className="pp-card-info">
                    <div className="pp-where">
                        <div className="pp-where-sketch"><PageWireframe wire={slot.wire} /></div>
                        <div>
                            <div className="pp-section-label">Where it is</div>
                            <p className="pp-where-text">{slot.where}</p>
                            {slot.note ? <p className="pp-where-note">{slot.note}</p> : null}
                        </div>
                    </div>

                    <div className="pp-section-label">Size to upload</div>
                    <SpecTiles spec={slot} />
                    <PhotoNotes notes={fileSize ? checkPhoto(fileSize, slot) : []} />

                    <TextField
                        fullWidth
                        size="small"
                        sx={{ mt: 2.5 }}
                        label="Description (for screen readers and Google)"
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        inputProps={{ maxLength: 300 }}
                        helperText="Say what the photo shows, e.g. “Team in matching black varsity jackets”."
                    />
                </div>
            </div>

            <footer className="pp-card-foot">
                {!isShipped && fallback?.src ? (
                    <Button color="inherit" startIcon={<RestoreIcon />} onClick={restore} disabled={busy}>Original photo</Button>
                ) : <span />}
                <div className="pp-card-foot-actions">
                    {pending ? <Button onClick={cancel} disabled={busy}>Cancel</Button> : null}
                    {!preview ? (
                        <Button variant="outlined" startIcon={<CloudUploadOutlinedIcon />} disabled={busy} onClick={(e) => e.currentTarget.closest('.pp-card')?.querySelector('.pp-drop')?.click()}>
                            Choose photo
                        </Button>
                    ) : null}
                    <Button variant="contained" disableElevation startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={save} disabled={busy || !pending}>
                        {busy ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </footer>
        </article>
    );
}

const SiteImages = () => {
    const [saved, setSaved] = useState({});
    const [defaults, setDefaults] = useState({});
    const [slideLimits, setSlideLimits] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [tab, setTab] = useState(SITE_IMAGE_GROUPS[0].id);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const [settings, shipped] = await Promise.all([
                instance.get('/metadata/global-settings'),
                instance.get('/metadata/site-image-defaults'),
            ]);
            setSaved(settings.data?.metadata?.siteImages || {});
            setDefaults(shipped.data?.defaults || {});
            setSlideLimits(shipped.data?.slides || {});
        } catch (error) {
            console.error('Error loading site images:', error);
            const message = error.response?.data?.message || error.message || 'Could not load the site images.';
            setLoadError(message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const group = useMemo(() => SITE_IMAGE_GROUPS.find((g) => g.id === tab) || SITE_IMAGE_GROUPS[0], [tab]);
    const replaced = ALL_SLOTS.filter((s) => (saved[s.key]?.src && saved[s.key].src !== defaults[s.key]?.src) || saved[s.key]?.more?.length).length;

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            {/* the header every admin page has (as Top Bar, Features…): icon, title and figures, then a line of help */}
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <PhotoLibraryOutlinedIcon sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>Site Images</Typography>
                        <Chip label={`${ALL_SLOTS.length} photos`} variant="outlined" />
                        <Chip label={`${replaced} replaced`} color={replaced ? 'primary' : 'default'} variant={replaced ? 'filled' : 'outlined'} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Every photo on the storefront you can change, page by page. Each card shows where the photo sits, the size to upload, and previews your photo cropped exactly as the site will show it before you save. The home page hero takes several photos and shows them as a slideshow. Uploads are converted to WebP and stored at most {MAX_EDGE} px on the longest side.
                    </Typography>
                </CardContent>
            </Card>

            {loadError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
                    {loadError}
                </Alert>
            )}

            <div className="pp-tabs">
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                    {SITE_IMAGE_GROUPS.map((g) => (
                        <Tab key={g.id} value={g.id} label={<span className="pp-tab">{g.title}<em>{g.slots.length}</em></span>} />
                    ))}
                </Tabs>
            </div>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 0.5 }}>
                {group.slots.length === 1 ? '1 photo' : `${group.slots.length} photos`} on this page.
            </Typography>

            <div className="pp-list">
                {group.slots.map((slot) => (slot.slides ? (
                    <SiteSlidesCard key={slot.key} slot={slot} group={group.title} saved={saved[slot.key]} fallback={defaults[slot.key]} limit={slideLimits[slot.key]} onSaved={setSaved} />
                ) : (
                    <SlotCard key={slot.key} slot={slot} group={group.title} saved={saved[slot.key]} fallback={defaults[slot.key]} onSaved={setSaved} />
                )))}
            </div>
        </Box>
    );
};

export default SiteImages;
