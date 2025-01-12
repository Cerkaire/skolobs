import React, { useContext, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { MainContext } from '../context/MainContext';

export default function Navbar() {
  const { user, fetchUser } = useContext(MainContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static"
        sx={{
          borderRadius: 2,
          background: 'linear-gradient(120deg, rgba(255, 255, 255, 1) 0%, rgba(233, 239, 237, 1) 40%, rgba(164, 199, 191, 1) 100%)',
        }}

      >
        <Toolbar>
          <Typography color={'black'} variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={() => navigate('/')}>
            Accueil
          </Typography>
          {user ? (
            <>

              <Typography color={'darkcyan'} variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {user.observateur}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>

            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
