import React, { useRef, useState } from 'react';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import CropIcon from '@mui/icons-material/Crop';
import { ACCEPT, px, shapeName } from '../constant/imageChecks';
import './SiteImages.css';

// The photo pieces shared by Content -> Site Images and Content -> How to Design Page.

/**
 * The photo framed as the site frames it (cropped or shown whole), and a drop zone: drag a file onto it or
 * click to choose one. `compare` shows the photo now on the site in the corner while a new one is previewed.
 */
export function PhotoDrop({ src, compare, ratio, fit, badge, busy, onFile, height = 300, emptyText = 'No photo yet' }) {
    const inputRef = useRef(null);
    const [over, setOver] = useState(false);
    const aspect = ratio[0] / ratio[1];
    const width = Math.round(Math.min(height * aspect, 520));
    const take = (file) => { if (file && !busy) onFile(file); };
    return (
        <div className="pp-drop-wrap" style={{ width: `${width}px`, maxWidth: '100%' }}>
            <button
                type="button"
                className={`pp-drop pp-drop--${fit}${over ? ' is-over' : ''}${busy ? ' is-busy' : ''}`}
                style={{ aspectRatio: `${ratio[0]} / ${ratio[1]}` }}
                onClick={() => !busy && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
                aria-label="Choose a photo, or drop one here"
            >
                {src ? <img src={src} alt="" style={{ objectFit: fit }} /> : <span className="pp-drop-empty">{emptyText}</span>}
                <span className="pp-drop-hint">
                    <CloudUploadOutlinedIcon />
                    <span>{busy ? 'Working…' : 'Drop a photo or click to choose'}</span>
                </span>
                {badge ? <span className="pp-badge">{badge}</span> : null}
                {compare ? (
                    <span className="pp-compare" title="The photo on the site now">
                        <img src={compare} alt="" style={{ objectFit: fit }} />
                        <em>Now</em>
                    </span>
                ) : null}
            </button>
            <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; take(f); }} />
        </div>
    );
}

/** Shape, best size, smallest size and fit, as four small tiles. */
export function SpecTiles({ spec }) {
    const tiles = [
        [<AspectRatioIcon key="i" />, 'Shape', shapeName(spec.ratio)],
        [<StarOutlineIcon key="i" />, 'Best size', px(spec.recommended), true],
        [<PhotoSizeSelectSmallIcon key="i" />, 'Smallest', px(spec.minimum)],
        [<CropIcon key="i" />, 'Fit', spec.fit === 'cover' ? 'Fills the box, edges cropped' : 'Shown whole, never cropped'],
    ];
    return (
        <div className="pp-tiles">
            {tiles.map(([icon, label, value, strong]) => (
                <div key={label} className={`pp-tile${strong ? ' is-strong' : ''}`}>
                    <span className="pp-tile-icon">{icon}</span>
                    <span className="pp-tile-label">{label}</span>
                    <span className="pp-tile-value">{value}</span>
                </div>
            ))}
        </div>
    );
}

const NOTE_ICON = { success: CheckCircleOutlineIcon, warning: WarningAmberIcon, info: InfoOutlinedIcon };

/** The checks of a chosen photo, one line each with an icon. */
export function PhotoNotes({ notes }) {
    if (!notes?.length) return null;
    return (
        <ul className="pp-notes">
            {notes.map((n, i) => {
                const Icon = NOTE_ICON[n.level] || InfoOutlinedIcon;
                return <li key={i} className={`pp-note pp-note--${n.level}`}><Icon fontSize="small" /><span>{n.text}</span></li>;
            })}
        </ul>
    );
}
