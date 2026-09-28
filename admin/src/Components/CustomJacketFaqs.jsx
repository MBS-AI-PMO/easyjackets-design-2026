import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add,
    ArrowDownward,
    ArrowUpward,
    Delete,
    Edit,
    HelpOutline,
    Save,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import instance from '../constant/instance';

const FAQ_ENDPOINT = '/features/custom-jacket-faqs';

const emptyForm = {
    question: '',
    answer: '',
    sortOrder: 1,
    isActive: true,
};

const normalizeFaqs = (payload) => {
    if (Array.isArray(payload?.faqs)) return payload.faqs;
    if (Array.isArray(payload)) return payload;
    return [];
};

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback;

const CustomJacketFaqs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [deletingId, setDeletingId] = useState(null);

    const sortedFaqs = useMemo(
        () => [...faqs].sort((a, b) => {
            const orderA = Number(a.sortOrder) || 0;
            const orderB = Number(b.sortOrder) || 0;
            if (orderA !== orderB) return orderA - orderB;
            return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
        }),
        [faqs]
    );

    const stats = useMemo(() => ({
        total: faqs.length,
        active: faqs.filter((faq) => faq.isActive).length,
        inactive: faqs.filter((faq) => !faq.isActive).length,
    }), [faqs]);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const response = await instance.get(`${FAQ_ENDPOINT}/admin`);
            setFaqs(normalizeFaqs(response.data));
        } catch (error) {
            console.error('Error fetching Custom Jacket FAQs:', error);
            const message = getErrorMessage(error, 'Failed to load Custom Jacket FAQs.');
            setLoadError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const nextSortOrder = () => {
        const maxOrder = sortedFaqs.reduce(
            (max, faq) => Math.max(max, Number(faq.sortOrder) || 0),
            0
        );
        return maxOrder + 1;
    };

    const handleOpenCreate = () => {
        setEditId(null);
        setFormData({ ...emptyForm, sortOrder: nextSortOrder() });
        setDialogOpen(true);
    };

    const handleOpenEdit = (faq) => {
        setEditId(faq._id);
        setFormData({
            question: faq.question || '',
            answer: faq.answer || '',
            sortOrder: Number(faq.sortOrder) || 1,
            isActive: faq.isActive !== false,
        });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (saving) return;
        setDialogOpen(false);
        setEditId(null);
        setFormData(emptyForm);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const question = formData.question.trim();
        const answer = formData.answer.trim();

        if (!question || !answer) {
            toast.error('Question and answer are required');
            return;
        }

        const payload = {
            question,
            answer,
            sortOrder: Number(formData.sortOrder) || nextSortOrder(),
            isActive: Boolean(formData.isActive),
        };

        setSaving(true);
        try {
            if (editId) {
                await instance.put(`${FAQ_ENDPOINT}/${editId}`, payload);
                toast.success('Custom Jacket FAQ updated');
            } else {
                await instance.post(FAQ_ENDPOINT, payload);
                toast.success('Custom Jacket FAQ added');
            }
            handleCloseDialog();
            fetchFaqs();
        } catch (error) {
            console.error('Error saving Custom Jacket FAQ:', error);
            toast.error(getErrorMessage(error, 'Failed to save Custom Jacket FAQ.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (faq) => {
        if (!window.confirm(`Delete this FAQ?\n\n${faq.question}`)) return;

        setDeletingId(faq._id);
        try {
            await instance.delete(`${FAQ_ENDPOINT}/${faq._id}`);
            toast.success('Custom Jacket FAQ deleted');
            fetchFaqs();
        } catch (error) {
            console.error('Error deleting Custom Jacket FAQ:', error);
            toast.error(getErrorMessage(error, 'Failed to delete Custom Jacket FAQ.'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleActive = async (faq) => {
        try {
            await instance.put(`${FAQ_ENDPOINT}/${faq._id}`, {
                isActive: !faq.isActive,
            });
            toast.success(`FAQ ${faq.isActive ? 'hidden' : 'published'}`);
            fetchFaqs();
        } catch (error) {
            console.error('Error updating Custom Jacket FAQ status:', error);
            toast.error(getErrorMessage(error, 'Failed to update FAQ status.'));
        }
    };

    const handleMove = async (index, direction) => {
        const current = sortedFaqs[index];
        const target = sortedFaqs[index + direction];
        if (!current || !target) return;

        const currentOrder = Number(current.sortOrder) || index + 1;
        const targetOrder = Number(target.sortOrder) || index + direction + 1;

        try {
            await Promise.all([
                instance.put(`${FAQ_ENDPOINT}/${current._id}`, { sortOrder: targetOrder }),
                instance.put(`${FAQ_ENDPOINT}/${target._id}`, { sortOrder: currentOrder }),
            ]);
            toast.success('FAQ order updated');
            fetchFaqs();
        } catch (error) {
            console.error('Error reordering Custom Jacket FAQs:', error);
            toast.error(getErrorMessage(error, 'Failed to update FAQ order.'));
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                        <HelpOutline sx={{ color: '#37a6ff' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
                            Custom Jacket FAQs
                        </Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
                            Add FAQ
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Manage the FAQ accordion shown below the custom jacket designer and above the footer.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
                        <Chip label={`${stats.total} total`} variant="outlined" />
                        <Chip label={`${stats.active} active`} color="success" variant="outlined" />
                        <Chip label={`${stats.inactive} hidden`} color="default" variant="outlined" />
                    </Stack>
                </CardContent>
            </Card>

            {loadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={<Button color="inherit" size="small" onClick={fetchFaqs}>Retry</Button>}
                >
                    {loadError}
                </Alert>
            )}

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 860 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, width: 110 }}>Order</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Answer</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: 130 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: 130 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedFaqs.map((faq, index) => (
                                <TableRow key={faq._id} hover>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Typography variant="body2" sx={{ minWidth: 28, fontWeight: 700 }}>
                                                {faq.sortOrder}
                                            </Typography>
                                            <Tooltip title="Move up">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        disabled={index === 0}
                                                        onClick={() => handleMove(index, -1)}
                                                    >
                                                        <ArrowUpward fontSize="inherit" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Move down">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        disabled={index === sortedFaqs.length - 1}
                                                        onClick={() => handleMove(index, 1)}
                                                    >
                                                        <ArrowDownward fontSize="inherit" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 280 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {faq.question}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 420 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {faq.answer}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <FormControlLabel
                                            sx={{ m: 0 }}
                                            control={
                                                <Switch
                                                    checked={faq.isActive !== false}
                                                    onChange={() => handleToggleActive(faq)}
                                                    size="small"
                                                />
                                            }
                                            label={faq.isActive !== false ? 'Active' : 'Hidden'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit FAQ">
                                            <IconButton size="small" onClick={() => handleOpenEdit(faq)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete FAQ">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    disabled={deletingId === faq._id}
                                                    onClick={() => handleDelete(faq)}
                                                >
                                                    {deletingId === faq._id ? <CircularProgress size={16} /> : <Delete fontSize="small" />}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!sortedFaqs.length && (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">
                                            No Custom Jacket FAQs yet. Add one to show it on the custom jacket page.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editId ? 'Edit Custom Jacket FAQ' : 'Add Custom Jacket FAQ'}</DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Question"
                                    name="question"
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label="Answer"
                                    name="answer"
                                    value={formData.answer}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Sort order"
                                    name="sortOrder"
                                    value={formData.sortOrder}
                                    onChange={handleInputChange}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    sx={{ height: '100%', alignItems: 'center' }}
                                    control={
                                        <Switch
                                            name="isActive"
                                            checked={Boolean(formData.isActive)}
                                            onChange={handleInputChange}
                                        />
                                    }
                                    label={formData.isActive ? 'Active on custom jacket page' : 'Hidden from custom jacket page'}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
                        <Divider orientation="vertical" flexItem />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save FAQ'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
};

export default CustomJacketFaqs;
