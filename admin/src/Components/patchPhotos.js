import React from "react";
import GalleryUpload from "./galleryUpload";

// The storefront's Embroidery & Patches page and the landing page's patch tiles
// show these photos; the tags become the page's filter chips.
const PATCH_TAGS = ['Patches', 'Chenille', 'Embroidery', 'Rhinestone', 'Printed', 'Names & numbers'];

function PatchPhotos() {
    return (
        <GalleryUpload
            endpoint="/patches"
            title="Embroidery & Patches"
            subtitle="Photos of patches, chenille letters, embroidery, rhinestone and printed work shown on the storefront"
            itemNoun="Patch Photo"
            tagOptions={PATCH_TAGS}
        />
    );
}

export default PatchPhotos;
