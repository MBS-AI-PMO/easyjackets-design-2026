import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import TableChartIcon from '@mui/icons-material/TableChart';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import HtmlIcon from '@mui/icons-material/Html';
import NotesIcon from '@mui/icons-material/Notes';
import { toast } from 'react-toastify';
import fileInstance from '../constant/filesInstance';
import EditorPrompt from './EditorPrompt';

/**
 * Sends one image to storage and returns its public URL.
 *
 * Images go to storage; the article holds only their URL. The editor used to
 * embed the image itself as a data: URL — the whole picture, base64-encoded,
 * saved as text inside the body and re-sent with every list the site draws.
 * One post with three photos reached 8 MB that way. The API refuses data:
 * URLs on save as well, so this is not the only guard, but it is the one that
 * keeps the editor and the saved article small.
 */
const uploadImage = async (file) => {
  const form = new FormData();
  form.append('image', file, file.name || 'image');
  const response = await fileInstance.post('/features/blogs/upload-image', form);
  const url = response?.data?.url;
  if (!url) throw new Error('The upload returned no URL.');
  return url;
};

const blockFormats = [
  { label: 'Paragraph', value: 'P' },
  { label: 'Heading 1', value: 'H1' },
  { label: 'Heading 2', value: 'H2' },
  { label: 'Heading 3', value: 'H3' },
  { label: 'Heading 4', value: 'H4' },
  { label: 'Quote', value: 'BLOCKQUOTE' },
  { label: 'Code Block', value: 'PRE' }
];

const fontSizes = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '4' },
  { label: 'XL', value: '5' },
  { label: 'XXL', value: '6' }
];

const escapeAttribute = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const normalizeUrl = (url) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const clampNumber = (value, min, max, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
};

const ToolbarButton = ({ label, children, onClick, disabled = false }) => (
  <Tooltip title={label} arrow>
    <span>
      <IconButton
        size="small"
        aria-label={label}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          color: '#334155',
          '&:hover': { bgcolor: '#e2e8f0' }
        }}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

const ColorTool = ({ label, icon, defaultValue, onChange, disabled }) => (
  <Tooltip title={label} arrow>
    <Box
      component="label"
      onMouseDown={(event) => {
        if (!disabled) event.preventDefault();
      }}
      sx={{
        width: 42,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.4,
        borderRadius: 1,
        color: disabled ? '#94a3b8' : '#334155',
        cursor: disabled ? 'default' : 'pointer',
        '&:hover': { bgcolor: disabled ? 'transparent' : '#e2e8f0' }
      }}
    >
      {icon}
      <Box
        component="input"
        type="color"
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        sx={{
          width: 15,
          height: 15,
          p: 0,
          border: '1px solid #cbd5e1',
          borderRadius: '50%',
          bgcolor: 'transparent',
          cursor: disabled ? 'default' : 'pointer',
          '&::-webkit-color-swatch-wrapper': { p: 0 },
          '&::-webkit-color-swatch': { border: 'none', borderRadius: '50%' }
        }}
      />
    </Box>
  </Tooltip>
);

/**
 * The writing surface for blog articles, and for FAQ answers on the Storefront
 * FAQs screen. `minHeight` is the only thing that differs between the two — an
 * article wants a full page to write in, an answer is two or three sentences
 * inside a dialog.
 */
const BlogRichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Start writing your article here...',
  minHeight = 460
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value || '');
  // The link / image / table dialog, or null when nothing is being asked.
  const [prompt, setPrompt] = useState(null);
  const pendingActionRef = useRef(null);
  const selectionLockedRef = useRef(false);
  const uploadInsertPointRef = useRef(null);

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange?.(html);
  };

  const saveSelection = () => {
    // Frozen while a dialog is open. Opening one blurs the editor, and browsers
    // collapse the selection to the start of the editable as they do it — the
    // blur handler would then save that collapsed range over the words the user
    // actually highlighted, and the link would be inserted at the top of the
    // text instead of wrapping them. restoreSelection's editor.focus() fires the
    // focus handler the same way, so the freeze has to outlast the command too.
    if (selectionLockedRef.current) return;

    const editor = editorRef.current;
    const selection = window.getSelection?.();

    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const isInsideEditor = editor === commonAncestor || editor.contains(commonAncestor);

    if (isInsideEditor) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const selection = window.getSelection?.();
    if (!selection) return;

    const savedRange = savedRangeRef.current;
    const isSavedRangeValid =
      savedRange &&
      (editor === savedRange.commonAncestorContainer || editor.contains(savedRange.commonAncestorContainer));

    const range = isSavedRangeValid ? savedRange : document.createRange();

    if (!isSavedRangeValid) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const runCommand = (command, commandValue = null) => {
    if (isSourceMode) return;
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
    saveSelection();
  };

  const insertHtml = (html) => {
    if (isSourceMode || !html) return;
    restoreSelection();
    document.execCommand('insertHTML', false, html);
    emitChange();
    saveSelection();
  };

  const insertImage = (src, altText = 'Blog image') => {
    const safeSrc = escapeAttribute(src);
    const safeAlt = escapeAttribute(altText || 'Blog image');
    insertHtml(
      `<figure style="margin:22px 0;"><img src="${safeSrc}" alt="${safeAlt}" style="display:block;max-width:100%;height:auto;border-radius:8px;margin:0 auto;" /></figure><p><br></p>`
    );
  };

  // Where an image should land once its upload has finished. Captured at the
  // moment the picker opens or the paste happens: by the time the upload
  // returns the editor may have blurred, and a blur collapses the selection to
  // the start of the text.
  const captureInsertPoint = () => {
    saveSelection();
    return savedRangeRef.current ? savedRangeRef.current.cloneRange() : null;
  };

  const insertImageAt = (range, src, altText) => {
    if (range) savedRangeRef.current = range;
    selectionLockedRef.current = true;
    try {
      insertImage(src, altText);
    } finally {
      selectionLockedRef.current = false;
      saveSelection();
    }
  };

  // Uploads in order and inserts each where the previous one ended, so a
  // multi-select lands in the order the files were chosen.
  const uploadAndInsert = async (files, insertPoint, altFor) => {
    let range = insertPoint;
    for (const file of files) {
      if (!file?.type?.startsWith('image/')) continue;

      const label = altFor(file);
      const pending = toast.info(`Uploading ${label}…`, { autoClose: false, closeButton: false });
      try {
        const url = await uploadImage(file);
        insertImageAt(range, url, label);
        range = savedRangeRef.current ? savedRangeRef.current.cloneRange() : range;
        toast.update(pending, { render: `Added ${label}`, type: 'success', autoClose: 1800, closeButton: true });
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.update(pending, {
          render: `Could not upload ${label}. ${error?.response?.data?.message || 'Try again.'}`,
          type: 'error',
          autoClose: 6000,
          closeButton: true
        });
      }
    }
  };

  const openFilePicker = () => {
    uploadInsertPointRef.current = captureInsertPoint();
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    uploadAndInsert(
      files,
      uploadInsertPointRef.current,
      (file) => file.name.replace(/\.[^.]+$/, '') || 'Blog image'
    );
    uploadInsertPointRef.current = null;
  };

  // Every ask goes through the same dialog. The caret has to be remembered
  // before it opens: focus moves to the dialog, and without the saved range the
  // link would be applied wherever the cursor happened to land afterwards.
  const ask = (config) => {
    saveSelection();
    selectionLockedRef.current = true;
    setPrompt(config);
  };

  const closePrompt = () => setPrompt(null);

  /**
   * What to do once the dialog has finished closing.
   *
   * The command cannot run while the dialog is still on screen: the modal's
   * focus trap pulls focus back out of the editor, so the caret we restored is
   * gone before execCommand sees it. Handlers queue their work here instead and
   * onClosed runs it.
   */
  const runPendingAction = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;

    // Run while the selection is still frozen, so the focus() inside
    // restoreSelection cannot overwrite the range on its way in. Cancelling
    // leaves no action but still has to release the freeze.
    action?.();

    selectionLockedRef.current = false;
    saveSelection();
  };

  const handleImageUrl = () => ask({
    icon: 'image',
    title: 'Image from URL',
    description: 'Alt text describes the picture for screen readers and for Google.',
    confirmLabel: 'Insert image',
    fields: [
      { name: 'src', label: 'Image URL', placeholder: 'https://example.com/jacket.jpg', autoFocus: true },
      { name: 'alt', label: 'Alt text', defaultValue: 'Blog image' },
    ],
    onSubmit: ({ src, alt }) => {
      const url = normalizeUrl(src);
      pendingActionRef.current = url ? () => insertImage(url, alt || 'Blog image') : null;
      closePrompt();
    },
  });

  const handleLink = () => ask({
    icon: 'link',
    title: 'Insert link',
    description: 'The text you selected becomes the link. Use a full address, or a path like /bulk-order for a page on this site.',
    confirmLabel: 'Insert link',
    fields: [
      { name: 'href', label: 'Link URL', placeholder: 'https://easyjackets.com', autoFocus: true },
    ],
    onSubmit: ({ href }) => {
      const url = normalizeUrl(href);
      pendingActionRef.current = url ? () => runCommand('createLink', url) : null;
      closePrompt();
    },
  });

  const handleTable = () => ask({
    icon: 'table',
    title: 'Insert table',
    description: 'Up to 12 rows and 8 columns. You can type into the cells afterwards.',
    confirmLabel: 'Insert table',
    fields: [
      { name: 'rows', label: 'Rows', type: 'number', defaultValue: '3', autoFocus: true },
      { name: 'columns', label: 'Columns', type: 'number', defaultValue: '3' },
    ],
    onSubmit: ({ rows: rowInput, columns: columnInput }) => {
      const rows = clampNumber(rowInput, 1, 12, 3);
      const columns = clampNumber(columnInput, 1, 8, 3);
      const cells = Array.from({ length: rows }, () =>
        `<tr>${Array.from({ length: columns }, () => '<td style="border:1px solid #cbd5e1;padding:10px;">Cell</td>').join('')}</tr>`
      ).join('');

      pendingActionRef.current = () => insertHtml(
        `<table style="width:100%;border-collapse:collapse;margin:22px 0;"><tbody>${cells}</tbody></table><p><br></p>`
      );
      closePrompt();
    },
  });

  const handlePaste = (event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItems = items.filter((item) => item.type.startsWith('image/'));

    if (!imageItems.length) return;

    event.preventDefault();
    const files = imageItems.map((item) => item.getAsFile()).filter(Boolean);
    uploadAndInsert(files, captureInsertPoint(), () => 'Pasted image');
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      setIsSourceMode(false);
      window.requestAnimationFrame(() => {
        if (editorRef.current) editorRef.current.innerHTML = sourceValue || '';
      });
      onChange?.(sourceValue || '');
      return;
    }

    const html = editorRef.current?.innerHTML || value || '';
    setSourceValue(html);
    setIsSourceMode(true);
  };

  useEffect(() => {
    const html = value || '';
    if (isSourceMode) {
      setSourceValue(html);
      return;
    }

    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [value, isSourceMode]);

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #cbd5e1',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(15,23,42,0.06)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.5,
          p: 1,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Select
          size="small"
          value=""
          displayEmpty
          disabled={isSourceMode}
          onMouseDown={saveSelection}
          onChange={(event) => runCommand('formatBlock', event.target.value)}
          renderValue={() => 'Styles'}
          sx={{ minWidth: 126, height: 32, bgcolor: '#fff', fontSize: 13 }}
        >
          {blockFormats.map((format) => (
            <MenuItem key={format.value} value={format.value}>
              {format.label}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value=""
          displayEmpty
          disabled={isSourceMode}
          onMouseDown={saveSelection}
          onChange={(event) => runCommand('fontSize', event.target.value)}
          renderValue={() => 'Size'}
          sx={{ minWidth: 92, height: 32, bgcolor: '#fff', fontSize: 13 }}
        >
          {fontSizes.map((size) => (
            <MenuItem key={size.value} value={size.value}>
              {size.label}
            </MenuItem>
          ))}
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label="Undo" disabled={isSourceMode} onClick={() => runCommand('undo')}>
          <UndoIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={isSourceMode} onClick={() => runCommand('redo')}>
          <RedoIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Clear formatting" disabled={isSourceMode} onClick={() => runCommand('removeFormat')}>
          <FormatClearIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label="Bold" disabled={isSourceMode} onClick={() => runCommand('bold')}>
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Italic" disabled={isSourceMode} onClick={() => runCommand('italic')}>
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Underline" disabled={isSourceMode} onClick={() => runCommand('underline')}>
          <FormatUnderlinedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" disabled={isSourceMode} onClick={() => runCommand('strikeThrough')}>
          <StrikethroughSIcon fontSize="small" />
        </ToolbarButton>

        <ColorTool
          label="Text color"
          icon={<FormatColorTextIcon fontSize="small" />}
          defaultValue="#334155"
          disabled={isSourceMode}
          onChange={(color) => runCommand('foreColor', color)}
        />
        <ColorTool
          label="Highlight color"
          icon={<FormatColorFillIcon fontSize="small" />}
          defaultValue="#fff2a8"
          disabled={isSourceMode}
          onChange={(color) => runCommand('hiliteColor', color)}
        />

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label="Bulleted list" disabled={isSourceMode} onClick={() => runCommand('insertUnorderedList')}>
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" disabled={isSourceMode} onClick={() => runCommand('insertOrderedList')}>
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Outdent" disabled={isSourceMode} onClick={() => runCommand('outdent')}>
          <FormatIndentDecreaseIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Indent" disabled={isSourceMode} onClick={() => runCommand('indent')}>
          <FormatIndentIncreaseIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label="Align left" disabled={isSourceMode} onClick={() => runCommand('justifyLeft')}>
          <FormatAlignLeftIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Align center" disabled={isSourceMode} onClick={() => runCommand('justifyCenter')}>
          <FormatAlignCenterIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Align right" disabled={isSourceMode} onClick={() => runCommand('justifyRight')}>
          <FormatAlignRightIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Justify" disabled={isSourceMode} onClick={() => runCommand('justifyFull')}>
          <FormatAlignJustifyIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label="Insert link" disabled={isSourceMode} onClick={handleLink}>
          <LinkIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Remove link" disabled={isSourceMode} onClick={() => runCommand('unlink')}>
          <LinkOffIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Upload image" disabled={isSourceMode} onClick={openFilePicker}>
          <ImageIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Image from URL" disabled={isSourceMode} onClick={handleImageUrl}>
          <NotesIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Insert table" disabled={isSourceMode} onClick={handleTable}>
          <TableChartIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Quote block" disabled={isSourceMode} onClick={() => runCommand('formatBlock', 'BLOCKQUOTE')}>
          <FormatQuoteIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Code block" disabled={isSourceMode} onClick={() => runCommand('formatBlock', 'PRE')}>
          <CodeIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton label="Horizontal line" disabled={isSourceMode} onClick={() => runCommand('insertHorizontalRule')}>
          <HorizontalRuleIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label={isSourceMode ? 'Visual editor' : 'HTML source'} onClick={toggleSourceMode}>
          <HtmlIcon fontSize="small" color={isSourceMode ? 'primary' : 'inherit'} />
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileUpload}
        />
      </Box>

      {isSourceMode ? (
        <TextField
          value={sourceValue}
          onChange={(event) => {
            setSourceValue(event.target.value);
            onChange?.(event.target.value);
          }}
          multiline
          minRows={Math.max(6, Math.round(minHeight / 26))}
          fullWidth
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            '& textarea': {
              p: 2,
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: 14,
              lineHeight: 1.65,
              color: '#0f172a'
            }
          }}
        />
      ) : (
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={emitChange}
          onFocus={saveSelection}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onBlur={saveSelection}
          onPaste={handlePaste}
          sx={{
            minHeight,
            p: 2,
            outline: 'none',
            fontFamily: 'Urbanist, Arial, sans-serif',
            fontSize: 17,
            lineHeight: 1.75,
            color: '#334155',
            overflowX: 'auto',
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: '#94a3b8',
              pointerEvents: 'none'
            },
            '& p, & div': { margin: '0 0 18px' },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: '#0f172a',
              fontWeight: 800,
              lineHeight: 1.2,
              margin: '28px 0 14px',
              letterSpacing: 0
            },
            '& h1': { fontSize: 34 },
            '& h2': { fontSize: 27 },
            '& h3': { fontSize: 22 },
            '& h4': { fontSize: 19 },
            '& ul': { listStyle: 'disc', paddingLeft: '1.8em', margin: '0 0 20px' },
            '& ol': { listStyle: 'decimal', paddingLeft: '1.8em', margin: '0 0 20px' },
            '& li': { margin: '6px 0', paddingLeft: '0.2em' },
            '& a': { color: '#ad5d30', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '0.18em' },
            '& img': {
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              margin: '18px auto'
            },
            '& blockquote': {
              margin: '24px 0',
              padding: '16px 20px',
              borderLeft: '4px solid #ad5d30',
              bgcolor: '#fff7ed',
              color: '#7c2d12'
            },
            '& pre': {
              margin: '22px 0',
              padding: '18px 20px',
              borderRadius: '8px',
              background: '#111827',
              color: '#f8fafc',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto'
            },
            '& code': {
              fontFamily: '"Courier New", Courier, monospace',
              background: 'rgba(173, 93, 48, 0.1)',
              color: '#8a4524',
              borderRadius: '6px',
              padding: '0.12em 0.35em',
              fontSize: '0.9em'
            },
            '& pre code': { background: 'transparent', color: 'inherit', padding: 0 },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              margin: '22px 0'
            },
            '& td, & th': {
              border: '1px solid #cbd5e1',
              padding: '10px',
              minWidth: 80
            },
            '& hr': {
              border: 0,
              borderTop: '1px solid #cbd5e1',
              margin: '28px 0'
            },
            '& u': { textUnderlineOffset: '0.18em' }
          }}
        />
      )}

      <EditorPrompt
        open={Boolean(prompt)}
        icon={prompt?.icon}
        title={prompt?.title}
        description={prompt?.description}
        fields={prompt?.fields || []}
        confirmLabel={prompt?.confirmLabel}
        onCancel={closePrompt}
        onSubmit={prompt?.onSubmit}
        onClosed={runPendingAction}
      />
    </Box>
  );
};

export default BlogRichTextEditor;
