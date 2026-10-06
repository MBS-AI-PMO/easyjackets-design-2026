import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, TextField, Typography, Container, Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import instance from '../constant/instance'
import { toast } from 'react-toastify'
import { useAuth } from '../Context/authContext'
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate()

  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const { data } = await instance.post('/auth/login', { email, password })

      if (!data.success) {
        toast.error("please check you credentials")
        return
      }
      // the admin is for admins: a customer account signs in on the storefront, never here (its token used
      // to be kept and every admin screen shown)
      if (data.user?.role !== 1) {
        sessionStorage.removeItem('auth')
        toast.error("you are not authorised as admin")
        navigate('/')
        return
      }

      sessionStorage.setItem('auth', JSON.stringify(data))
      toast.success("login successfully")
      login()
    }
    catch (error) {
      toast.error("you are not authorised as admin")
    }
  };

  return (
    <Container component="main" maxWidth="xs" >
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          borderRadius: "25px",
          backgroundColor: 'white'
        }}

      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ color: 'primary.main' }}>
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Auth;
