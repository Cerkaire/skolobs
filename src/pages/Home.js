import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, Button, CardActionArea, Box, Chip, Stack, Badge, dialog, DialogTitle, DialogContent, DialogContentText, Dialog, DialogActions, CardHeader } from '@mui/material';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { MainContext } from '../context/MainContext';
import { db } from '../db/db';
import LoginForm from './LoginForm';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import SyncIcon from '@mui/icons-material/Sync';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SettingsIcon from '@mui/icons-material/Settings';

export default function Home() {
  const { user, fetchUser, obsCount, setObsCount, checkDbData } = useContext(MainContext);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const [AllParam, setAllParam] = useState('Non');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchUser();
    const fetchObsCount = async () => {
      try {
        const count = await db.obs.count();
        setObsCount(count);
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de lignes dans obs:', error);
      }
    };
    fetchObsCount();
  }, []);

  //Vider le user
  async function handleClearDbUser() {
    try {
      await db.user.clear();
      setStatus('Base de données des utilisateurs vidée');

    } catch (error) {
      setStatus(`Échec du vidage de la base de données: ${error}`);
    }
    fetchUser();
  }

  //vider les obs
  async function handleClearObs() {
    try {
      await db.obs.clear();
      await db.fiche.clear();
      await db.ligne.clear();
      setStatus('Base de données des utilisateurs vidée');

    } catch (error) {
      setStatus(`Échec du vidage de la base de données: ${error}`);
    }
    fetchUser();
  }

  //Vider les parametres
  async function handleClearParam() {
    try {
      await db.species.clear();
      await db.observatoire.clear();
      await db.etude.clear();
      await db.protocole.clear();
      await db.orga.clear();
      await db.comportement.clear();
      await db.methode.clear();
      await db.occstatutbio.clear();
      await db.occtype.clear();
      await db.prospection.clear();
      await db.stade.clear();
      setStatus('Base de données des utilisateurs vidée');

    } catch (error) {
      setStatus(`Échec du vidage de la base de données: ${error}`);
    }
    fetchUser();
  }
  useEffect(() => {
    const verifyTables = async () => {
      const result = await checkDbData();
      setAllParam(result);
    };
    verifyTables();
  }, []);

  const handleSaisiClick = () => {
    if (AllParam === 'Non') {
      setOpenDialog(true);
    } else {
      navigate('/saisi');
    }
  };



  return (
    <Container>
      {!user ? (
        <LoginForm />
      ) : (
        <>
          <Box sx={{ flexGrow: 1, zIndex: 1000 }} paddingTop={1}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={6}>
                <Card elevation={3} sx={{ height: '150px' }}>
                  <CardActionArea onClick={() => navigate('/parametre')}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Badge
                        badgeContent={
                          AllParam === 'Oui' ?
                            <CheckIcon color="success" /> :
                            <SyncProblemIcon color="error" />
                        }
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                      <SettingsIcon style={{ fontSize: 60, color: '#0e86a1' }} />
                      </Badge>
                        <Typography gutterBottom variant="h6" component="div">
                          Paramètres
                        </Typography>
                      
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card elevation={3} sx={{ height: '150px', justifyContent: 'center' }} >
                  <CardActionArea onClick={handleSaisiClick}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <NoteAddIcon style={{ fontSize: 60, color: '#0e86a1' }} />
                      <Typography gutterBottom variant="h6" component="div">
                        Saisir des obs
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card elevation={3} sx={{ height: '150px' }}>
                  <CardActionArea onClick={() => navigate('/obs')}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Badge badgeContent={obsCount} overlap='rectangular' color="primary"
                        sx={{ zIndex: 1000, }}
                      >
                      <VisibilityIcon style={{ fontSize: 60, color: '#0e86a1' }} />
                      </Badge>
                      <Typography gutterBottom variant="h6" component="div" >
                        Mes données
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid><Grid item xs={6} md={6}>
                <Card elevation={3} sx={{ height: '150px' }}>
                  <CardActionArea onClick={() => navigate('/synchro')}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <SyncIcon style={{ fontSize: 60, color: '#0e86a1' }} />
                      <Typography gutterBottom variant="h6" component="div" >
                        Synchroniser mes données
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ flexGrow: 1 }} paddingTop={1}>
            <Grid container direction="row" spacing={1}>
              <Grid item xs={6}>
                <Chip
                  label="Changer d'utilisateur"
                  onClick={handleClearDbUser}
                  onDelete={handleClearDbUser}
                  deleteIcon={<SyncIcon />}
                  color="secondary"
                /></Grid> <Grid item xs={6}>
                <Chip
                  label="Effacer les Obs"
                  onClick={handleClearObs}
                  onDelete={handleClearObs}
                  deleteIcon={<DeleteIcon />}
                  color="error"
                /></Grid> <Grid item xs={6}>
                <Chip
                  label="Effacer les paramêtres"
                  onClick={handleClearParam}
                  onDelete={handleClearParam}
                  deleteIcon={<DeleteIcon />}
                  color="error"
                /></Grid>
            </Grid>

          </Box>
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
          >
            <DialogTitle>Paramètres manquants</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Veuillez mettre à jour les paramètres avant de procéder à la saisie.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
              <Button onClick={() => navigate('/parametre')} autoFocus>
                Mettre à jour
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      <div>{status}</div>
    </Container >
  );
}
