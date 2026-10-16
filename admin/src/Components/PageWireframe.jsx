import React from 'react';
import './SiteImages.css';

// A small sketch of a storefront page with one box marked in gold ("This photo" / "This text"), so the admin
// sees where on the page the thing being edited is. Boxes are [kind, x, y, w, h] in % of a 16:10 frame;
// kinds are styled in SiteImages.css (.si-wire-<kind>).
const WIRES = {
    // Site Images
    hero: [
        ['title', 6, 20, 40, 6], ['title', 6, 29, 33, 6], ['text', 6, 40, 38, 3], ['text', 6, 46, 30, 3], ['btn', 6, 55, 15, 6], ['btnGhost', 23, 55, 15, 6],
        ['me', 62, 14, 26, 52], ['tag', 82, 12, 9, 5], ['box', 0, 76, 100, 5], ['box', 6, 85, 20, 12], ['box', 29, 85, 20, 12], ['box', 52, 85, 20, 12], ['box', 75, 85, 19, 12],
    ],
    band: [
        ['box', 6, 13, 50, 8], ['box', 6, 25, 20, 16], ['box', 29, 25, 20, 16], ['box', 52, 25, 20, 16], ['box', 75, 25, 19, 16],
        ['dark', 0, 48, 100, 46], ['me', 8, 56, 26, 31.2], ['tag', 6, 82, 11, 5],
        ['titleLight', 46, 58, 40, 6], ['titleLight', 46, 66, 26, 6], ['textLight', 46, 76, 40, 3], ['btn', 46, 83, 14, 5],
    ],
    card: [
        ['text', 6, 15, 14, 2.5], ['title', 6, 21, 44, 8], ['title', 6, 32, 32, 8], ['text', 6, 45, 40, 3], ['text', 6, 51, 34, 3],
        ['me', 66, 13, 26, 41.6], ['shade', 66, 38, 26, 16.6], ['btn', 83, 47, 7, 4.5], ['box', 6, 66, 41, 26], ['box', 51, 66, 43, 26],
    ],
    bulkHero: [
        ['title', 6, 13, 38, 7], ['text', 6, 23, 36, 3], ['text', 6, 29, 9, 4], ['text', 17, 29, 9, 4], ['text', 28, 29, 9, 4], ['text', 39, 29, 7, 4],
        ['me', 6, 37, 40, 40], ['card', 56, 13, 38, 80], ['text', 60, 20, 24, 4], ['field', 60, 29, 14, 6], ['field', 76, 29, 14, 6], ['field', 60, 39, 30, 6], ['field', 60, 49, 30, 6], ['btn', 60, 82, 30, 6],
    ],
    wide: [
        ['title', 6, 14, 40, 7], ['title', 6, 23, 28, 7], ['text', 6, 34, 34, 3], ['box', 70, 12, 22, 35.2], ['me', 6, 52, 52, 46.8],
    ],
    contact: [
        ['title', 6, 13, 34, 6], ['text', 6, 22, 26, 3], ['text', 6, 27, 22, 3], ['me', 6, 34, 36, 43.2], ['card', 54, 13, 40, 74], ['field', 58, 20, 32, 6], ['field', 58, 30, 32, 6], ['field', 58, 40, 32, 18], ['btn', 58, 63, 32, 6],
    ],
    diagramLeft: [
        ['table', 6, 13, 88, 14], ['me', 6, 34, 26, 52], ['title', 40, 36, 40, 7], ['num', 40, 50, 3, 5], ['text', 45, 51, 34, 3], ['num', 40, 60, 3, 5], ['text', 45, 61, 30, 3], ['num', 40, 70, 3, 5], ['text', 45, 71, 32, 3],
    ],
    diagramRight: [
        ['title', 6, 13, 44, 7], ['line', 6, 23, 88, 0.6], ['text', 6, 28, 40, 3], ['table', 6, 36, 48, 42], ['me', 60, 28, 34, 43.5],
    ],
    notFound: [
        ['title', 6, 20, 30, 14], ['text', 6, 40, 40, 3], ['text', 6, 46, 34, 3], ['btn', 6, 55, 16, 6], ['me', 62, 14, 26, 52],
    ],
    // How to Design page
    htdHeader: [
        ['text', 6, 14, 14, 2.5], ['me', 5, 19, 50, 44], ['box', 66, 13, 26, 41.6], ['shade', 66, 38, 26, 16.6], ['box', 12, 72, 76, 22],
    ],
    htdOverview: [
        ['text', 6, 14, 14, 2.5], ['title', 6, 20, 40, 9], ['box', 66, 13, 26, 30], ['me', 14, 50, 72, 26.5], ['num', 6, 84, 4, 6], ['title', 6, 92, 30, 4],
    ],
    htdStep: [
        ['num', 8, 22, 6, 9], ['title', 8, 34, 34, 8], ['text', 8, 47, 34, 3], ['text', 8, 53, 28, 3], ['me', 52, 20, 40, 39.4], ['line', 8, 74, 84, 0.5], ['num', 8, 80, 6, 9],
    ],
    htdStepText: [
        ['me', 6, 18, 40, 46], ['box', 52, 20, 40, 39.4], ['line', 8, 74, 84, 0.5], ['num', 8, 80, 6, 9],
    ],
    htdSubsteps: [
        ['num', 8, 14, 6, 8], ['title', 8, 25, 34, 7], ['text', 8, 36, 40, 3],
        ['me', 8, 44, 26, 20], ['me', 37, 44, 26, 20], ['me', 66, 44, 26, 20], ['me', 8, 70, 26, 20], ['me', 37, 70, 26, 20], ['me', 66, 70, 26, 20],
    ],
    htdCta: [
        ['box', 6, 12, 88, 26], ['me', 6, 46, 88, 40], ['box', 0, 92, 100, 8],
    ],
};

const grid4 = (index, tall) => {
    const top = 27;
    const h = tall ? 40 : 24;
    const boxes = [['title', 6, 13, 52, 8]];
    for (let i = 0; i < 4; i += 1) {
        const x = 6 + i * 22.67;
        boxes.push([i === index ? 'me' : 'box', x, top, 20, h]);
        boxes.push(['text', x, top + h + 4, 14, 3]);
        boxes.push(['text', x, top + h + 9, 18, 2.5]);
    }
    return boxes;
};

export default function PageWireframe({ wire, label = 'This photo' }) {
    const boxes = wire.layout === 'grid4' ? grid4(wire.index, wire.tall) : WIRES[wire.layout] || [];
    let marked = 0;
    return (
        <div className="si-wire" aria-hidden="true">
            <div className="si-wire-nav"><span className="si-wire-logo" /><span className="si-wire-menu" /></div>
            {boxes.map(([kind, x, y, w, h], i) => {
                const first = kind === 'me' && marked++ === 0;
                return (
                    <div key={i} className={`si-wire-${kind}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
                        {first ? <span>{label}</span> : null}
                    </div>
                );
            })}
        </div>
    );
}
