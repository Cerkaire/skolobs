import React, { useContext, useState } from 'react';
import { Card, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Typography, Switch, IconButton, Grid, Fab, DialogContent, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { MainContext } from '../context/MainContext';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Dexie from 'dexie';
import { db } from '../db/db';


const FicheForm = ({ organismes, etudes, onCancel }) => {
    const { formData, setFormData, updatePhase, setPhase, updateFormData, clickedPosition, selectedSite } = useContext(MainContext);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await db.user.toCollection().first();
                if (user) {
                    setUserData(user);
                }
            } catch (error) {
                console.error('Failed to fetch user data from Dexie', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        console.log('userData', userData);
    }, [userData]);

    //Mise a jour a la validation
    const handleSubmit = (event) => {
        event.preventDefault();
        // Mettre à jour les données de la fiche dans le contexte
        const newFormData = {
            ...formData,
            fiche: {
                ...formData.fiche,
                date1: formData.fiche.date || null,
                date2: formData.fiche.date2 || null,
                organisme: 2,
                typeDonnee: 'Pu',
                diffusion: 0,
                site: userData.site || null,
                idsite: userData.idsite || null,
                newsite: false,
                idcoord: userData.idcoord || null,
                etude: userData.etude || null,
                idm: userData.idm || null,
                idobser: userData.idobser || null
            }
        };
        updateFormData(newFormData);
        console.log('newFormData', newFormData)
        setPhase('observation');
    };

    // Fonction pour ouvrir le dialogue
    const handleOpenDialog = () => {
        console.log('selectedsite', selectedSite)
        setOpen(true);
    };

    // Fonction pour fermer le dialogue
    const handleCloseDialog = () => {
        setOpen(false);
    };

    return (
        <Card sx={{ padding: 2 }}>
            {/* Bouton pour ouvrir le dialogue */}
            <Fab color="primary" aria-label="help" onClick={handleOpenDialog} style={{ position: 'fixed', bottom: 16, left: 16 }}>
                <HelpOutlineIcon />
            </Fab>
            {/* Dialogue pour afficher les conseils */}
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>Conseils d'utilisation</DialogTitle>
                <DialogContent>
                    <p>Vous n'etes pas obligé de mettre un date de fin. Privilégier toujours une seule date précise</p>
                    <p>Ne sélectionnez une étude que si vous réalisez des relevés protocolés en lien avec une étude</p>
                    <p>Privées : ne contriburons pas à alimenter les bases autres que Langazel</p>
                    <p>Diffusion : permet de flouter la réstitution des données</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Fermer</Button>
                </DialogActions>
            </Dialog>
            <Typography variant="h5">Dates d'observation</Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
                    <Grid item xs={6}>
                        <TextField
                            label="Date de début"
                            type="date"
                            value={formData.fiche.date}
                            onChange={(e) => setFormData({
                                ...formData,
                                fiche: { ...formData.fiche, date: e.target.value }
                            })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Date de fin"
                            type="date"
                            value={formData.fiche.date2}
                            onChange={(e) => setFormData({
                                ...formData,
                                fiche: { ...formData.fiche, date2: e.target.value }
                            })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>
            </form>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: 2 }}>
                <Grid container spacing={2} sx={{ padding: 2 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5">Comment avez-vous réaliser ces observations</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Card elevation={3} sx={{ height: 200, cursor: 'pointer' }} onClick={() => console.log('Card 1 clicked')}>
                            <Box
                                sx={{
                                    width: 200,
                                    height: 200,
                                    backgroundImage: `url(${process.env.PUBLIC_URL + '/icones/oiso.png'})`,
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </Card>
                    </Grid>
                    <Grid item xs={4} >
                        <Card elevation={3} sx={{ height: 200, cursor: 'pointer' }} onClick={() => console.log('Card 2 clicked')}>
                            <Box
                                sx={{
                                    width: 200,
                                    height: 200,
                                    height: '100%',
                                    backgroundImage: `url(${process.env.PUBLIC_URL + '/icones/nid.png'})`,
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </Card>
                    </Grid>
                    <Grid item xs={4} >
                        <Card elevation={3} sx={{ height: 200, cursor: 'pointer' }} onClick={() => console.log('Card 3 clicked')}>
                            <Box
                                sx={{
                                    width: 200,
                                    height: 200,
                                    height: '100%',
                                    backgroundImage: `url(${process.env.PUBLIC_URL + '/icones/mangeoire.png'})`,
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </Card>
                    </Grid>

                    <Grid item xs={6} md={6}>
                        <Button variant="outlined" color="secondary" onClick={() => navigate('/')}>
                            Annuler
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={6}>
                        <Button variant="contained" color="success" onClick={handleSubmit}>
                            Saisir des Obs
                        </Button>
                    </Grid>

                </Grid>
            </Box>
        </Card>
    );
};

export default FicheForm;
