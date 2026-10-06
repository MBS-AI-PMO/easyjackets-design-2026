import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from "@mui/material";
import { Visibility, VisibilityOff, LockReset, Security } from "@mui/icons-material";
import { toast } from "react-toastify";
import instance from "../constant/instance";

function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.currentPassword) {
            toast.error("Please enter your current password");
            return;
        }
        if (!formData.newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New password and confirmation do not match");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await instance.put("/auth/change-password", formData);
            if (data.success) {
                // the change ended every other session; this one continues with the fresh token
                if (data.token) {
                    try {
                        const auth = JSON.parse(sessionStorage.getItem("auth")) || {};
                        sessionStorage.setItem("auth", JSON.stringify({ ...auth, token: data.token }));
                    } catch { /* keep the old one: the next request will ask to sign in again */ }
                }
                toast.success(data.message || "Password changed successfully!");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                toast.error(data.message || "Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(
                error?.response?.data?.message || "Error changing password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: '#fff',
            color: '#333',
            '& fieldset': { borderColor: '#ddd' },
            '&:hover fieldset': { borderColor: '#37a6ff' },
            '&.Mui-focused fieldset': { borderColor: '#37a6ff' },
        },
        '& .MuiInputLabel-root': {
            color: '#666',
            '&.Mui-focused': { color: '#37a6ff' },
        },
        '& .MuiOutlinedInput-input': { color: '#333' }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f4f7fa' }}>

            {/* Header Card - Light Blue Theme */}
            <Card
                sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(55, 166, 255, 0.2)',
                    maxWidth: 600,
                    mx: 'auto'
                }}
            >
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                            <Security sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Authentication Security
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Update your administrative password regularly
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Paper
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                        maxWidth: 600,
                        width: '100%'
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <LockReset sx={{ fontSize: 32, color: "#37a6ff", mr: 2 }} />
                        <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
                            Change Your Password
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <form onSubmit={handleSubmit}>
                        {/* Current Password */}
                        <TextField
                            fullWidth
                            label="Current Password"
                            name="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={handleChange}
                            sx={{ ...textFieldStyle, mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => toggleVisibility("current")}
                                            edge="end"
                                            sx={{ color: "#37a6ff" }}
                                        >
                                            {showPasswords.current ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* New Password */}
                        <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={handleChange}
                            sx={{ ...textFieldStyle, mb: 3 }}
                            helperText="Must be at least 6 characters"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => toggleVisibility("new")}
                                            edge="end"
                                            sx={{ color: "#37a6ff" }}
                                        >
                                            {showPasswords.new ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Confirm New Password */}
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            sx={{ ...textFieldStyle, mb: 4 }}
                            error={
                                formData.confirmPassword &&
                                formData.newPassword !== formData.confirmPassword
                            }
                            helperText={
                                formData.confirmPassword &&
                                    formData.newPassword !== formData.confirmPassword
                                    ? "Passwords do not match"
                                    : ""
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => toggleVisibility("confirm")}
                                            edge="end"
                                            sx={{ color: "#37a6ff" }}
                                        >
                                            {showPasswords.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            sx={{
                                py: 1.5,
                                bgcolor: '#37a6ff',
                                "&:hover": {
                                    bgcolor: '#1e88e5'
                                },
                                fontWeight: "bold",
                                fontSize: "16px",
                                color: "white",
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(55, 166, 255, 0.2)'
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: "white" }} />
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#888' }}>
                            Forget your current password? Please contact the system administrator.
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default ChangePassword;
