import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Avatar,
    CircularProgress,
    Grid,
    Chip,
    Tooltip,
    Button,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import {
    Comment as CommentIcon,
    CheckCircle,
    Cancel,
    Delete,
    Visibility,
} from '@mui/icons-material';
import instance from '../constant/instance';
import { toast } from 'react-toastify';

const CommentModeration = () => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await instance.get('/features/blogs/comments/all');
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error fetching comments', error);
            toast.error('Error loading comments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveToggle = async (comment) => {
        try {
            const response = await instance.put(`/features/blogs/${comment.blogId}/comments/${comment._id}/approve`, {
                approved: !comment.approved
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchComments();
            }
        } catch (error) {
            console.error('Error toggling approval', error);
            toast.error('Error updating comment status');
        }
    };

    const handleDelete = async (comment) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const response = await instance.delete(`/features/blogs/${comment.blogId}/comments/${comment._id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchComments();
            }
        } catch (error) {
            console.error('Error deleting comment', error);
            toast.error('Error deleting comment');
        }
    };

    const handleViewDetails = (comment) => {
        setSelectedComment(comment);
        setOpenDetail(true);
    };

    const stats = {
        total: comments.length,
        pending: comments.filter(c => !c.approved).length,
        approved: comments.filter(c => c.approved).length,
    };

    return (
        <>
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Comments', value: stats.total, icon: <CommentIcon />, color: '#37a6ff' },
                    { label: 'Pending Approval', value: stats.pending, icon: <Cancel />, color: '#f59e0b' },
                    { label: 'Approved', value: stats.approved, icon: <CheckCircle />, color: '#10b981' }
                ].map((stat, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderBottom: `4px solid ${stat.color}` }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                                <Box sx={{ p: 1.5, bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 2, mr: 2, display: 'flex' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="text.primary">{stat.value}</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">{stat.label}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Header Banner */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                    borderRadius: 6,
                    p: { xs: 3, md: 5 },
                    mb: 6,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(30, 136, 229, 0.25)',
                }}
            >
                {/* Glassmorphism accent */}
                <Box sx={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                }} />

                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Avatar
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            width: 56,
                            height: 56,
                            mr: 2.5,
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}
                    >
                        <CommentIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h3" sx={{
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            fontFamily: 'Urbanist, sans-serif'
                        }}>
                            Comment Moderation
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            Review and manage feedback on your articles
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Blog Post</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Comment Preview</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#37a6ff' }} />
                                </TableCell>
                            </TableRow>
                        ) : comments.map((comment) => (
                            <TableRow key={comment._id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ bgcolor: '#37a6ff', width: 32, height: 32 }}>{comment.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{comment.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{comment.email}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1e88e5' }}>{comment.blogTitle || 'N/A'}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {comment.content}
                                    </Typography>
                                </TableCell>
                                <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={comment.approved ? 'Approved' : 'Pending'}
                                        size="small"
                                        sx={{ bgcolor: comment.approved ? '#10b981' : '#f59e0b', color: 'white', fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Tooltip title="View Full Comment">
                                            <IconButton size="small" onClick={() => handleViewDetails(comment)}>
                                                <Visibility fontSize="small" sx={{ color: '#64748b' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={comment.approved ? "Unapprove" : "Approve"}>
                                            <IconButton size="small" onClick={() => handleApproveToggle(comment)}>
                                                {comment.approved ? <Cancel fontSize="small" sx={{ color: '#ef4444' }} /> : <CheckCircle fontSize="small" sx={{ color: '#10b981' }} />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => handleDelete(comment)}>
                                                <Delete fontSize="small" sx={{ color: '#64748b' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {comments.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#999' }}>
                                    <Typography variant="h6">No comments yet</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Detail Dialog */}
            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>Comment Details</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedComment && (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#37a6ff' }}>{selectedComment.name[0]}</Avatar>
                                <Box>
                                    <Typography variant="h6">{selectedComment.name}</Typography>
                                    <Typography color="text.secondary">{selectedComment.email}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(selectedComment.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>On Article:</Typography>
                            <Typography variant="body1" fontWeight="bold" gutterBottom>{selectedComment.blogTitle}</Typography>
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedComment.content}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setOpenDetail(false)}>Close</Button>
                    {selectedComment && !selectedComment.approved && (
                        <Button variant="contained" color="success" onClick={() => { handleApproveToggle(selectedComment); setOpenDetail(false); }}>Approve</Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CommentModeration;
