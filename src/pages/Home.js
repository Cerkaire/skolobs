import React, { useContext, useState, useEffect } from 'react';
import {
  Container, Card, Button, CardActionArea, Box, Chip, Snackbar, Badge, IconButton, DialogTitle,
  DialogContent, DialogContentText, Dialog, DialogActions, Fab,
  Alert
} from '@mui/material';
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
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function Home() {
  const { user, fetchUser, obsCount, setObsCount, checkDbData } = useContext(MainContext);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const [AllParam, setAllParam] = useState('Non');
  const [openDialog, setOpenDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(null); // Version récupérée via l'API
  const [isUpToDate, setIsUpToDate] = useState(false); // Indique si la version est à jour
  const [statusCharg, setStatusCharg] = useState('Chargement de la version...'); // Statut de l'opération


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
      await db.site.clear();
      await db.observateurs.clear();
      await db.commune.clear();

      setStatus('Base de données des utilisateurs vidée');

    } catch (error) {
      setStatus(`Échec du vidage de la base de données: ${error}`);
    }
    fetchUser();
  }

  //pour déclencher le controle des tables DB dexie
  useEffect(() => {
    const verifyTables = async () => {
      const result = await checkDbData();
      setAllParam(result);
    };
    verifyTables();

    const checkForOldEntries = async () => {
      const hasOldEntries = await checkOldEntries();
      setShowSnackbar(hasOldEntries);
    };
    checkForOldEntries();

  }, []);

  //pour récupérer la date du jour au bon format
  function getTodayDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0'); // Jour du mois avec zéro en tête
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Mois (commence à 0) avec zéro en tête
    const yyyy = today.getFullYear(); // Année
    return `${yyyy}-${mm}-${dd}`;
  }

  //Vérifier si il y a des obs qui ont plus d'une journée
  async function checkOldEntries() {
    const today = getTodayDate();
    const oldEntries = await db.fiche.where('datesaisie').below(today).toArray();
    return oldEntries.length > 0;
  }

  //Pour naviguer vers la saisie en vérifiant que les parametres sont tiens chargés
  const handleSaisiClick = () => {
    if (AllParam === 'Non') {
      setOpenDialog(true);
    } else {
      navigate('/saisi');
    }
  };

  //pour fermer la snack d'alerte de synchro
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  //La snackbar de rappel de synchro
  const actionSnack = (
    <>
      <Button color="secondary" size="small" onClick={handleSnackbarClose}>
        ok
      </Button>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );


  // Fonction pour ouvrir le dialogue
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // Fonction pour fermer le dialogue
  const handleCloseDialog = () => {
    setOpen(false);
  };

  //les styles des card
  const styles = {
    card: {
      borderRadius: 3,
      background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 250, 245, 1) 30%, rgba(233, 239, 237, 1) 60%, rgba(164, 199, 191, 1) 100%)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      height: '150px'
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  };

  //fonction d'appel a l'api pour récupérer la version en cours
  async function recupVersion() {
    try {
      const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/versionskol');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.version) {
        setVersion(data.version); // Utiliser directement data.version
        setStatus(`Version récupérée : ${data.version}`);
      } else {
        throw new Error('Clé "version" manquante dans la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la version', error);
      setStatus(`Erreur : ${error.message}`);
    }
  }


  // useEffect pour déclencher la récupération de la version à chaque chargement de la page
  useEffect(() => {
    async function fetchAndCompareVersion() {
      await recupVersion();

      // Comparer avec la version de l'application après avoir récupéré la version
      if (process.env.REACT_APP_VERSION) {
        setIsUpToDate(version === process.env.REACT_APP_VERSION);
      }
    }

    fetchAndCompareVersion();
  }, [version]); // Dépendance sur `version` pour mettre à jour si elle change

  return (
    <Container sx={{
      background: 'linear-gradient(120deg, rgba(255, 255, 255, 1) 0%, rgb(241, 241, 241) 40%, rgb(226, 237, 234) 100%)',
      display: 'flex',
      flexDirection: 'column',
      height: '99vh',
    }}>
      {!user ? (
        <LoginForm />
      ) : (
        <>
          <Snackbar
            open={showSnackbar}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message="Vous avez des obs à synchroniser."
            action={actionSnack}
          />
          {/* Bouton pour ouvrir le dialogue */}
          <Fab color="primary" aria-label="help" onClick={handleOpenDialog} style={{ position: 'fixed', bottom: 16, right: 16 }}>
            <HelpOutlineIcon />
          </Fab>

          {/* Dialogue pour afficher les conseils */}
          <Dialog open={open} onClose={handleCloseDialog}>
            <DialogTitle>Conseils d'utilisation</DialogTitle>
            <DialogContent>
              <p><SettingsIcon /> Pour mettre à jours les paramètres d'utilisation, à utiliser régulièrement </p>
              <p><SyncIcon /> : Pour envoyer vos données sur la base. A faire dés que possible quand vous avez fini de saisir vos obs</p>
              <p><VisibilityIcon />Indique combien d'obs vous avez saisi dans le petit badge et vous permet de voir vos obs et de les modifier</p>
              <p> C'est l'utilisateur connecté qui sera l'observateur des données synchronisées</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Fermer</Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ flexGrow: 1, zIndex: 1000, height: '50vh' }} paddingTop={1}>
            <Grid container direction="column"
              justifyContent="center"
              alignItems="center">
              <Grid item xs={12} md={12} >
                <Typography variant="h4" style={{ color: '#016d94' }} >SKOL'OBS</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {/* <Grid item xs={6} md={6}>
                <Card elevation={3} sx={styles.card}>
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
                        <SettingsIcon style={{ fontSize: 60, color: '#016d94' }} />
                      </Badge>
                      <Typography gutterBottom variant="h6" component="div">
                        Paramètres
                      </Typography>

                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid> */}
              <Grid item xs={12} md={12}>
                <Card elevation={3} sx={styles.card}>
                  <CardActionArea onClick={handleSaisiClick}>
                    <CardContent sx={{ display: 'flex', 
                      flexDirection: 'column', alignItems: 'center',
                       justifyContent: 'center', height: '100%' }}>
                      {/*  <NoteAddIcon style={{ fontSize: 60, color: '#016d94' }} /> */}
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          backgroundImage: `url(${process.env.PUBLIC_URL + '/icones/obs.png'})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                        }}
                      />
                      <Typography variant="h6" align="center">
                        Saisir des observations
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card elevation={3} sx={styles.card}>
                  <CardActionArea onClick={() => navigate('/obs')}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Badge badgeContent={obsCount} overlap='rectangular' color="primary"
                        sx={{ zIndex: 1000, }}
                      >
                        <VisibilityIcon style={{ fontSize: 60, color: '#016d94' }} />
                      </Badge>
                      <Typography variant="h6" align="center" >
                        Mes obs'
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid><Grid item xs={6} md={6}>
                <Card elevation={3} sx={styles.card}>
                  <CardActionArea onClick={() => navigate('/synchro')}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <SyncIcon style={{ fontSize: 60, color: '#016d94' }} />
                      <Typography variant="h6" align="center" >
                        Synchroniser mes obs'
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
            <Typography fontSize={10} padding={2}>
              Version de l'application : {process.env.REACT_APP_VERSION || 'Non définie'} {isUpToDate
                ? 'A jour' : ''}
            </Typography>
            {isUpToDate === false && <Alert severity="warning">Une nouvelle version est disponible ({status}). Rechargez la page et actualisez les paramètres</Alert>}
          </Box>
          <Box
            sx={{
              border: '1px solid', borderColor: 'grey.400', borderRadius: 2, padding: 2, position: 'relative', marginTop: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ position: 'absolute', top: '-10px', left: '16px', padding: '0 8px' }}
            >
              Outils de développement
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Chip
                  label="Changer d'utilisateur"
                  onClick={handleClearDbUser}
                  onDelete={handleClearDbUser}
                  deleteIcon={<SyncIcon />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Chip
                  label="Effacer les Obs"
                  onClick={handleClearObs}
                  onDelete={handleClearObs}
                  deleteIcon={<DeleteIcon />}
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Chip
                  label="Effacer les paramètres"
                  onClick={handleClearParam}
                  onDelete={handleClearParam}
                  deleteIcon={<DeleteIcon />}
                  color="error"
                />
              </Grid>
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
    </Container >
  );
}
