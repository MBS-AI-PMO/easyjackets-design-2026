import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Dialog, Stack, TextField, Typography, Zoom } from '@mui/material';

/**
 * The editor's ask-for-a-value dialog.
 *
 * Replaces window.prompt in BlogRichTextEditor. The browser prompt could not be
 * styled, showed "localhost:3000 says" above the question, and could only ask
 * one thing at a time — inserting an image meant two prompts back to back, and
 * a table meant two more. This asks for every field at once and looks like the
 * rest of the admin.
 *
 * Fields are described by the caller: { name, label, placeholder, defaultValue,
 * type, autoFocus }. onSubmit receives them as an object keyed by name.
 */

const ICONS = {
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    table: <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></>,
};

// The admin's blue, the same one the edit icons and headings use across these
// screens. Deliberately not the storefront terracotta — that belongs to the
// content being written, not to the admin chrome around it.
const ACCENT = '#1e88e5';
const ACCENT_DARK = '#1668b8';

const initialValues = (fields = []) =>
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? '' }), {});

const EditorPrompt = ({
    open,
    icon = 'link',
    title,
    description,
    fields = [],
    confirmLabel = 'Insert',
    onCancel,
    onSubmit,
    onClosed,
}) => {
    const [values, setValues] = useState(() => initialValues(fields));

    // The caller drops its config on close, which would blank the dialog while
    // it is still fading out. Keep the last real content to render through the
    // exit animation.
    const shown = useRef({ icon, title, description, fields, confirmLabel });
    if (open) shown.current = { icon, title, description, fields, confirmLabel };
    const content = open ? { icon, title, description, fields, confirmLabel } : shown.current;

    // Reset every time the dialog opens, so a previous URL is not still sitting
    // in the box the next time the button is pressed.
    useEffect(() => {
        if (open) setValues(initialValues(fields));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, title]);

    const submit = (event) => {
        event?.preventDefault?.();
        onSubmit?.(values);
    };

    return (
        <Dialog
            open={Boolean(open)}
            onClose={onCancel}
            TransitionComponent={Zoom}
            // The caller acts on the answer only once this has finished closing
            // — see runPendingAction in BlogRichTextEditor.
            TransitionProps={{ onExited: onClosed }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: submit,
                sx: { borderRadius: '20px', p: 0, overflow: 'hidden' },
            }}
        >
            <Box sx={{ px: 4, pt: 4, pb: 3, textAlign: 'center' }}>
                <Box
                    sx={{
                        width: 68,
                        height: 68,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        color: ACCENT,
                        bgcolor: 'rgba(30, 136, 229, 0.1)',
                        border: '3px solid rgba(30, 136, 229, 0.25)',
                    }}
                >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {ICONS[content.icon] || ICONS.link}
                    </svg>
                </Box>

                <Typography sx={{ fontSize: 21, fontWeight: 800, color: '#0f172a' }}>
                    {content.title}
                </Typography>

                {content.description && (
                    <Typography sx={{ fontSize: 13.5, color: '#64748b', mt: 0.75, lineHeight: 1.6 }}>
                        {content.description}
                    </Typography>
                )}

                <Stack gap={2} sx={{ mt: 3, textAlign: 'left' }}>
                    {(content.fields || []).map((field) => (
                        <TextField
                            key={field.name}
                            label={field.label}
                            placeholder={field.placeholder}
                            type={field.type || 'text'}
                            value={values[field.name] ?? ''}
                            onChange={(event) => setValues((previous) => ({
                                ...previous,
                                [field.name]: event.target.value,
                            }))}
                            autoFocus={field.autoFocus}
                            fullWidth
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: ACCENT,
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
                            }}
                        />
                    ))}
                </Stack>

                <Stack direction="row" gap={1.5} sx={{ mt: 3.5 }}>
                    <Button
                        type="button"
                        onClick={onCancel}
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            py: 1.1,
                            color: '#475569',
                            bgcolor: '#eef2f7',
                            '&:hover': { bgcolor: '#e2e8f0' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            py: 1.1,
                            color: '#fff',
                            bgcolor: ACCENT,
                            boxShadow: '0 8px 20px rgba(30, 136, 229, 0.28)',
                            '&:hover': { bgcolor: ACCENT_DARK },
                        }}
                    >
                        {content.confirmLabel}
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
};

export default EditorPrompt;
