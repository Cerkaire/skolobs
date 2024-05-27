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
  }, [fetchUser]);


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={() => navigate('/')}>
            Lann'Obs Go
          </Typography>
          {user ? (
            <>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {user.nom} {user.prenom}
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
