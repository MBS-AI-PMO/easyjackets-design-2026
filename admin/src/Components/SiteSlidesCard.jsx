import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import { toast } from 'react-toastify';
import instance from '../constant/instance';
import { FRONTEND_URL, uploadUrl } from '../constant/url';
import { ACCEPT, checkPhoto, fileProblem, readSize } from '../constant/imageChecks';
import PageWireframe from './PageWireframe';
import { PhotoDrop, PhotoNotes, SpecTiles } from './PhotoParts';
import './SiteImages.css';

// Content -> Site Images, a spot that takes several photos (slot.slides, e.g. the home hero). One photo stands
// still on the site; two or more become a slideshow with a bar per photo along the bottom (storefront
// components/SiteSlides.jsx). The photos are a strip here: add, drag or move to reorder, remove, and pick one
// to replace it or write its description. Nothing changes on the site until Save, which uploads the new
// photos and stores the list as the slot's own photo (the first) plus `more: [{ src, alt }]`.

let lastId = 0;
const newId = () => { lastId += 1; return `slide-${lastId}`; };

const fromSaved = (saved, fallback) => [
    { src: saved?.src || fallback?.src || '', alt: saved?.alt || fallback?.alt || '' },
    ...(Array.isArray(saved?.more) ? saved.more : []).map((p) => ({ src: p?.src || '', alt: p?.alt || '' })),
].filter((p, i) => i === 0 || p.src).map((p) => ({ id: newId(), ...p }));

export default function SiteSlidesCard({ slot, group, saved, fallback, limit, onSaved }) {
    const max = limit || slot.slides;
    const savedJson = JSON.stringify([saved || null, fallback || null]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initial = useMemo(() => fromSaved(saved, fallback), [savedJson]);
    const [items, setItems] = useState(initial);
    const [selected, setSelected] = useState(0);
    const [busy, setBusy] = useState(false);
    const [currentSize, setCurrentSize] = useState(null);
    const [dragFrom, setDragFrom] = useState(null);
    const [dropAt, setDropAt] = useState(null);
    const addRef = useRef(null);
    const previews = useRef(new Set()); // object URLs of chosen files, freed when no longer shown

    const freePreviews = () => { previews.current.forEach((u) => URL.revokeObjectURL(u)); previews.current.clear(); };
    useEffect(() => () => freePreviews(), []);
    // the saved list changed (loaded, or this card saved): show it
    useEffect(() => { freePreviews(); setItems(initial); setSelected(0); }, [initial]);

    const at = Math.min(selected, items.length - 1);
    const current = items[at];
    useEffect(() => {
        let alive = true;
        setCurrentSize(null);
        if (current?.src && !current.file) readSize(uploadUrl(current.src)).then((s) => { if (alive) setCurrentSize(s); });
        return () => { alive = false; };
    }, [current?.src, current?.file]);

    const isShipped = !saved?.more?.length && (!saved?.src || saved.src === fallback?.src);
    const pending = items.length !== initial.length
        || items.some((p, i) => p.file || p.src !== initial[i].src || p.alt.trim() !== initial[i].alt.trim());

    /** A chosen file, checked and read: { file, preview, size }, or null (with a message why). */
    const readFile = async (file) => {
        const problem = fileProblem(file);
        if (problem) { toast.error(`${file.name}: ${problem}`); return null; }
        const preview = URL.createObjectURL(file);
        const size = await readSize(preview);
        if (!size) {
            URL.revokeObjectURL(preview);
            toast.error(`${file.name} could not be read as a photo.`);
            return null;
        }
        previews.current.add(preview);
        return { file, preview, size };
    };

    const replace = async (file) => {
        const read = await readFile(file);
        if (!read) return;
        setItems((list) => list.map((p, i) => (i === at ? { ...p, ...read } : p)));
    };

    const add = async (files) => {
        const room = max - items.length;
        const chosen = Array.from(files || []);
        if (!chosen.length) return;
        if (room <= 0) { toast.info(`The slideshow already has ${max} photos, the most it takes. Remove one first.`); return; }
        if (chosen.length > room) toast.info(`Only ${room} more ${room === 1 ? 'photo fits' : 'photos fit'} (the most is ${max}); the rest were left out.`);
        const read = (await Promise.all(chosen.slice(0, room).map(readFile))).filter(Boolean);
        if (!read.length) return;
        setItems((list) => [...list, ...read.map((r) => ({ id: newId(), src: '', alt: '', ...r }))]);
        setSelected(items.length);
    };

    const move = (from, to) => {
        if (from === to || from == null || to < 0 || to >= items.length) return;
        setItems((list) => {
            const next = [...list];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
        setSelected(to);
    };

    const remove = (index) => {
        if (items.length < 2) return;
        const gone = items[index];
        if (gone?.preview) { URL.revokeObjectURL(gone.preview); previews.current.delete(gone.preview); }
        setItems((list) => list.filter((_, i) => i !== index));
        setSelected(Math.max(0, index - (index === items.length - 1 ? 1 : 0)));
    };

    const setAlt = (alt) => setItems((list) => list.map((p, i) => (i === at ? { ...p, alt } : p)));

    const cancel = () => { freePreviews(); setItems(initial); setSelected(0); };

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
            const list = [];
            for (const photo of items) {
                let { src } = photo;
                if (photo.file) {
                    const form = new FormData();
                    form.append('image', photo.file);
                    const uploaded = await instance.post('/metadata/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                    src = uploaded.data?.url;
                    if (!src) throw new Error('The upload did not return an address.');
                }
                list.push({ src, alt: photo.alt.trim() });
            }
            const [first, ...more] = list;
            await write(
                { src: first.src, alt: first.alt, ...(more.length ? { more } : {}) },
                more.length
                    ? `${slot.title} saved: a slideshow of ${list.length} photos. The site shows it within a minute.`
                    : `${slot.title} saved: one photo, no slideshow. The site shows it within a minute.`,
            );
        } catch (error) {
            console.error('Error saving site slides:', error);
            toast.error(error.response?.data?.message || error.message || 'Could not save the photos.');
        } finally {
            setBusy(false);
        }
    };

    const restore = async () => {
        if (!fallback?.src || !window.confirm(`Put the original photo back as the only one in "${slot.title}"? The other photos leave the slideshow.`)) return;
        setBusy(true);
        try {
            await write({ src: fallback.src, alt: fallback.alt || '' }, `${slot.title}: the original photo is back.`);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Could not restore the photo.');
        } finally {
            setBusy(false);
        }
    };

    // the strip: thumbnails drag to a new place; files dropped on it are added
    const onStripDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files?.length) add(files);
        else if (dragFrom != null) move(dragFrom, dropAt ?? items.length - 1);
        setDragFrom(null);
        setDropAt(null);
    };

    const badge = current?.file
        ? `New · ${current.size.w} × ${current.size.h} px`
        : currentSize ? `${currentSize.w} × ${currentSize.h} px` : '';
    const count = items.length;

    return (
        <article className={`pp-card${pending ? ' is-pending' : ''}`}>
            <header className="pp-card-head">
                <div>
                    <div className="pp-card-crumb">{group}</div>
                    <h3 className="pp-card-title">{slot.title}</h3>
                </div>
                <div className="pp-card-head-side">
                    <span className={`pp-pill${count > 1 ? ' is-own' : ''}`}>
                        {count > 1 ? `Slideshow · ${count} photos` : 'One photo · stands still'}
                    </span>
                    {isShipped ? <span className="pp-pill">Original photo</span> : null}
                    <a className="pp-link" href={`${FRONTEND_URL}${slot.path}`} target="_blank" rel="noopener noreferrer">
                        See it on the site <OpenInNewIcon fontSize="inherit" />
                    </a>
                </div>
            </header>

            <div className="pp-card-body">
                <div className="pp-card-photo">
                    <PhotoDrop
                        src={current?.preview || uploadUrl(current?.src || '')}
                        compare={current?.preview && current?.src ? uploadUrl(current.src) : ''}
                        ratio={slot.ratio}
                        fit={slot.fit}
                        badge={badge}
                        busy={busy}
                        onFile={replace}
                        hint={count > 1 ? `Drop a photo or click to replace photo ${at + 1}` : 'Drop a photo or click to replace it'}
                        overlay={count > 1 ? (
                            <span className="pp-drop-bars" aria-hidden="true">
                                {items.map((p, i) => <i key={p.id} className={i === at ? 'is-on' : i < at ? 'is-past' : ''} />)}
                            </span>
                        ) : null}
                    />
                    <div className="pp-caption">
                        {current?.file ? 'Previewed exactly as the site crops it · not saved yet' : `Photo ${at + 1} of ${count}, cropped as the site shows it`}
                    </div>

                    <div className="pp-slides">
                        <div className="pp-section-label">Photos · {count} of {max}{count > 1 ? ' · drag to reorder' : ''}</div>
                        <ol
                            className={`pp-slides-strip${dragFrom == null && dropAt === 'files' ? ' is-over' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); if (dragFrom == null) setDropAt('files'); }}
                            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropAt(null); }}
                            onDrop={onStripDrop}
                        >
                            {items.map((p, i) => (
                                <li
                                    key={p.id}
                                    className={`pp-slide${i === at ? ' is-selected' : ''}${dragFrom === i ? ' is-dragging' : ''}${dragFrom != null && dropAt === i && dragFrom !== i ? ' is-target' : ''}`}
                                    draggable={!busy && count > 1}
                                    onDragStart={(e) => { setDragFrom(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); }}
                                    onDragOver={() => { if (dragFrom != null) setDropAt(i); }}
                                    onDragEnd={() => { setDragFrom(null); setDropAt(null); }}
                                >
                                    <button
                                        type="button"
                                        className="pp-slide-thumb"
                                        onClick={() => setSelected(i)}
                                        aria-pressed={i === at}
                                        aria-label={`Photo ${i + 1}${p.file ? ' (new)' : ''}`}
                                    >
                                        <img src={p.preview || uploadUrl(p.src)} alt="" draggable={false} />
                                        <span className="pp-slide-num">{i + 1}</span>
                                        {p.file ? <span className="pp-slide-new">New</span> : null}
                                    </button>
                                </li>
                            ))}
                            {count < max ? (
                                <li className="pp-slide pp-slide--add">
                                    <button type="button" className="pp-slide-add" onClick={() => addRef.current?.click()} disabled={busy}>
                                        <AddPhotoAlternateOutlinedIcon />
                                        <span>Add</span>
                                    </button>
                                </li>
                            ) : null}
                        </ol>
                        <input ref={addRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { const f = e.target.files; add(f); e.target.value = ''; }} />
                        {count > 1 ? (
                            <div className="pp-slide-tools">
                                <Button size="small" color="inherit" startIcon={<ChevronLeftIcon />} disabled={busy || at === 0} onClick={() => move(at, at - 1)}>Earlier</Button>
                                <Button size="small" color="inherit" endIcon={<ChevronRightIcon />} disabled={busy || at === count - 1} onClick={() => move(at, at + 1)}>Later</Button>
                                <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} disabled={busy} onClick={() => remove(at)}>Remove photo {at + 1}</Button>
                            </div>
                        ) : null}
                    </div>
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

                    <div className="pp-how">
                        <SlideshowOutlinedIcon />
                        <div>
                            <div className="pp-section-label">How it shows on the site</div>
                            <ul>
                                <li><strong>One photo:</strong> it stands still, with no bars.</li>
                                <li><strong>Two or more (up to {max}):</strong> a slideshow. Each photo shows for 6 seconds and fades into the next, with a thin bar for each photo along the bottom (no arrows). Visitors can click a bar or swipe; it waits while the mouse is over it.</li>
                                <li><strong>Order:</strong> photo 1 shows first and loads first, so put your best one there.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pp-section-label">Size to upload (every photo)</div>
                    <SpecTiles spec={slot} />
                    <PhotoNotes notes={current?.size ? checkPhoto(current.size, slot) : []} />

                    <TextField
                        fullWidth
                        size="small"
                        sx={{ mt: 2.5 }}
                        label={`Description of photo ${at + 1} (for screen readers and Google)`}
                        value={current?.alt || ''}
                        onChange={(e) => setAlt(e.target.value)}
                        inputProps={{ maxLength: 300 }}
                        helperText="Say what the photo shows, e.g. “Customer in a red and navy varsity jacket”."
                    />
                </div>
            </div>

            <footer className="pp-card-foot">
                {!isShipped && fallback?.src ? (
                    <Button color="inherit" startIcon={<RestoreIcon />} onClick={restore} disabled={busy}>Original photo</Button>
                ) : <span />}
                <div className="pp-card-foot-actions">
                    {pending ? <Button onClick={cancel} disabled={busy}>Cancel</Button> : null}
                    {count < max ? (
                        <Button variant="outlined" startIcon={<AddPhotoAlternateOutlinedIcon />} disabled={busy} onClick={() => addRef.current?.click()}>
                            Add photos
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
