import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';

import { chooseName } from '../../store/actions';
import fileInstance from '../../utils/axiosformData';


const Upload = ({ globals, part, designs, colors, chooseName }) => {
  // eslint-disable-next-line
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(designs[part]?.upload?.file);
  const fileInput = useRef(null);

  const fileUpload = () => {
    fileInput.current.click();
  };

  const onChange = async (e) => {
    e.preventDefault();
    setUploading(true);

    let fileUrl;
    let reader = new FileReader();
    let file = e.target.files[0];



    reader.readAsDataURL(file);

    let form_data = new FormData();

    form_data.append('file', file);



    const res = await fileInstance.post(`/custom/save-images`, form_data)
    console.log(res)
    fileUrl = await res.data.url;
    setUrl(fileUrl);

    chooseName('image', fileUrl, part);
    chooseName('file', reader.result, part);

    setUploading(false);


    // reader.onloadend = () => {
    //   setFile(file)
    //   setUrl(reader.result)
    //   console.log(fileUrl)

    //   chooseName( 'file', reader.result, part )
    //   chooseName( 'image', file, part )
    // }
  };

  const removeImage = () => {
    setUrl();

    new FileReader();
  };

  return (
    <div className="cjd-modal-form-wrapper">
      <div className="cjd-row">
        <div className="cjd-modal-half">
          <div className="cjd-btn cjd-btn-lg" onClick={() => fileUpload()}>
            Upload Image
          </div>
          <input
            name="file"
            type="file"
            ref={fileInput}
            accept="image/*"
            onChange={(e) => onChange(e)}
            style={{ display: 'none' }}
          />
          <p className="cjd-note">
            Images are optimized and stored as WebP.{' '}
            {part === 'Right Chest Verticle' &&
              part === 'Left Chest Verticle' &&
              ' Dimension should be 85px x 175px'}
          </p>
        </div>

        <div className="cjd-modal-half">
          <div
            className="cjd-mock-preview"
            style={{
              background:
                part === 'Right Sleeve' ||
                  part === 'Left Sleeve' ||
                  part === 'Right Sleeve End' ||
                  part === 'Left Sleeve End' ||
                  part === 'Right Mid Sleeve Upper' ||
                  part === 'Left Mid Sleeve Upper' ||
                  part === 'Right Mid Sleeve Lower' ||
                  part === 'Left Mid Sleeve Lower'
                  ? colors.sleeves
                  : colors.body,
            }}
          >
            {uploading ? (
              <div className="lds-roller">
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
            ) : (
              <>
                {url && (
                  <div
                    className="cjd-remove-image"
                    onClick={() => removeImage()}
                  ></div>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  viewBox="0 0 324 200"
                >
                  <image xlinkHref={url} width="324" height="200" />
                </svg>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  globals: state.globals,
  designs: state.designs,
  colors: state.colors,
});

const mapDispatchToProps = (dispatch) => ({
  chooseName: (key, val, part, font = null, tab = 'upload') =>
    dispatch(chooseName(key, val, part, font, tab)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
