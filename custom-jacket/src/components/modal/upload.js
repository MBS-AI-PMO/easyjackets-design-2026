import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';

import { chooseName } from '../../store/actions';
import fileInstance from '../../utils/axiosformData';
import { uploadUrl } from '../../config/url';

const SLEEVE_PLACES = [
  'Right Sleeve', 'Left Sleeve', 'Right Sleeve End', 'Left Sleeve End',
  'Right Mid Sleeve Upper', 'Left Mid Sleeve Upper', 'Right Mid Sleeve Lower', 'Left Mid Sleeve Lower',
];

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const Upload = ({ part, designs, colors, chooseName }) => {
  // The preview shows the picture from the file itself (at once, and with no network): the stored copy's
  // address points at the API's public domain, which a local or not-yet-live API does not serve, so the
  // preview showed a broken image. The stored address is still saved with the design (`image`).
  const [preview, setPreview] = useState(designs[part]?.upload?.file || uploadUrl(designs[part]?.upload?.image));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const fileUpload = () => {
    if (!uploading) fileInput.current.click();
  };

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // so the same file can be picked again
    if (!file) return;

    const previous = preview;
    setError('');
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      setPreview(dataUrl); // shown dimmed under the spinner while it uploads

      const form = new FormData();
      form.append('file', file);
      const res = await fileInstance.post('/custom/save-images', form);
      const fileUrl = res?.data?.url;
      if (!fileUrl) throw new Error('no address for the stored picture');

      chooseName('image', fileUrl, part);
      chooseName('file', dataUrl, part);
    } catch {
      setPreview(previous);
      setError('The picture could not be uploaded. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(undefined);
    setError('');
    chooseName('file', undefined, part);
    chooseName('image', undefined, part);
  };

  return (
    <div className="cjd-modal-form-wrapper">
      <div className="cjd-row">
        <div className="cjd-modal-half">
          <div
            className="cjd-btn cjd-btn-lg"
            role="button"
            tabIndex={0}
            aria-disabled={uploading}
            onClick={fileUpload}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileUpload()}
          >
            {uploading ? 'Uploading…' : preview ? 'Replace image' : 'Upload image'}
          </div>
          <input
            name="file"
            type="file"
            ref={fileInput}
            accept="image/*"
            onChange={onChange}
            style={{ display: 'none' }}
          />
          {error && <p className="cjd-upload-error" role="alert">{error}</p>}
          <p className="cjd-note">
            Images are optimized and stored as WebP.{' '}
            {part === 'Right Chest Verticle' &&
              part === 'Left Chest Verticle' &&
              ' Dimension should be 85px x 175px'}
          </p>
        </div>

        <div className="cjd-modal-half">
          <div
            className={`cjd-mock-preview cjd-upload-preview${uploading ? ' is-uploading' : ''}`}
            aria-busy={uploading}
            style={{ background: SLEEVE_PLACES.includes(part) ? colors.sleeves : colors.body }}
          >
            {preview && <img className="cjd-upload-image" src={preview} alt="" />}
            {!preview && !uploading && <span className="cjd-upload-empty">No picture yet</span>}
            {uploading && <span className="cjd-upload-spinner" role="status" aria-label="Uploading" />}
            {preview && !uploading && (
              <button type="button" className="cjd-remove-image" aria-label="Remove the picture" onClick={removeImage}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  designs: state.designs,
  colors: state.colors,
});

const mapDispatchToProps = (dispatch) => ({
  chooseName: (key, val, part, font = null, tab = 'upload') =>
    dispatch(chooseName(key, val, part, font, tab)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
