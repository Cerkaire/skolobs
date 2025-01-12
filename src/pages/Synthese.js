import React, { useContext, useEffect, useState } from 'react';
import { Card, Button, Typography, Box, Container, IconButton, Grid, Modal, TextField, Chip, Fab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { MainContext } from '../context/MainContext';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditNoteIcon from '@mui/icons-material/EditNote';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Synthese = ({ onAddObservation }) => {
    const { formData, setSelectedSpecies, setPhase, deleteSpecies, deleteStade, setSelectedStade, saveFormData, addOrUpdateStade } = useContext(MainContext);
    const navigate = useNavigate();
    const [openDial, setOpenDial] = useState(false);
    const [especes, setEspeces] = useState([]);

    // Charger les espèces depuis le fichier JSON
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/especes.json`)
            .then(response => response.json())
            .then(data => setEspeces(data))
            .catch(error => console.error('Erreur lors du chargement des espèces:', error));
    }, []);

    const handleAddStade = (species) => {
        setSelectedSpecies(species);
        setPhase('addstade');
    };

    const handleDeleteSpecie = (species) => {
        deleteSpecies(species);
    };

    const handleDeleteStade = (cdnom, stade) => {
        deleteStade(cdnom, stade);
    };

    const handleEditStade = (species, stadeData) => {
        setSelectedSpecies(species);
        setSelectedStade(stadeData);
        setPhase('editstade');
    };

    const onConfirm = () => {
        saveFormData(formData);
        setPhase('map');
        navigate("/lannobsgo");
    };

    const [open, setOpen] = useState(false);
    const [currentStadeData, setCurrentStadeData] = useState({});
    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);
    const [undeterminedCount, setUndeterminedCount] = useState(0);

    const handleOpen = (stadeData) => {
        setCurrentStadeData(stadeData);
        setMaleCount(stadeData.maleCount || 0);
        setFemaleCount(stadeData.femaleCount || 0);
        setUndeterminedCount(stadeData.undeterminedCount || 0);
        setOpen(true);
        console.log(stadeData)
    };

    const handleClose = () => setOpen(false);

    //Sauvegarde des modifs de valeur de la modal
    const handleSave = () => {
        const { cdnom, stade } = currentStadeData;

        // Utilisation de la fonction addOrUpdateStade pour sauvegarder les nouvelles valeurs
        addOrUpdateStade(cdnom, stade, {
            ...currentStadeData,
            maleCount,
            femaleCount,
            undeterminedCount
        });

        handleClose();
    };

    //pour formater la date
    function formatDateToEuropean(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }
    // Fonction pour ouvrir le dialogue
    const handleOpenDialog = () => {
        setOpenDial(true);
    };

    // Fonction pour fermer le dialogue
    const handleCloseDialog = () => {
        setOpenDial(false);
    };

    // Fonction pour trouver l'image correspondante pour chaque cdnom
    const findImageForCdnom = (cdnom) => {
        const species = especes.find(species => species.cdnom === cdnom);
        return species ? species.image : null;
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Bouton pour ouvrir le dialogue */}
            <Fab size="small" color="primary" aria-label="help" onClick={handleOpenDialog} style={{ position: 'fixed', bottom: 16, right: 16 }}>
                <HelpOutlineIcon />
            </Fab>
            {/* Dialogue pour afficher les conseils */}
            <Dialog open={openDial} onClose={handleCloseDialog}>
                <DialogTitle>Conseils d'utilisation</DialogTitle>
                <DialogContent>
                    <p><DeleteForeverIcon color='error' />Supprime l'espèce et tous les stades associés</p>
                    <p><PlaylistAddIcon color='success' />Permet d'ajouter un stade</p>
                    <p><EditNoteIcon color='secondary' />Permet d'éditer le stade</p>
                    <p><ClearIcon color='error' />Permet de supprimer le stade</p>
                    <p><PlusOneIcon color='primary' />Permet de modifier les nombres de males/femelles/Indeterminés</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Fermer</Button>
                </DialogActions>
            </Dialog>
            <Grid sx={{ paddingTop: 2 }} container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="h5">Fiche d'obs</Typography>
                    <Typography variant="body1">Date: {formatDateToEuropean(formData.fiche.date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="success" onClick={onAddObservation}>
                        Ajouter une espèce
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Observations</Typography>
                    {Object.entries(formData.especes).map(([cdnom, species]) => (

                        <Card key={cdnom} sx={{ marginBottom: 1, padding: 1 }} elevation={2}>
                            <Grid container alignItems="flex-start">
                                <Grid item xs={1}>
                                    <IconButton variant="contained" color="error" onClick={() => handleDeleteSpecie(cdnom)}>
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <div
                                        style={{
                                            width: 100,
                                            height: 100,
                                            backgroundImage: `url(${process.env.PUBLIC_URL + '/images/' + findImageForCdnom(cdnom)})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        {species.nomvern} <br />
                                        <i>{species.nom}</i>
                                    </Typography>
                                </Grid>
                               
                                {Object.entries(species.stades).map(([stadeKey, stades], index) => (
                                    <React.Fragment key={index}>
                                        <Grid item xs={1}>
                                            <Typography variant="body2">
                                                Total: {
                                                    (() => {
                                                        const maleCount = parseInt(stades.maleCount) || 0;
                                                        const femaleCount = parseInt(stades.femaleCount) || 0;
                                                        const undeterminedCount = parseInt(stades.undeterminedCount) || 0;
                                                        return maleCount + femaleCount + undeterminedCount;
                                                    })()
                                                }
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <IconButton variant="contained" color="primary" onClick={() => handleOpen({ cdnom, stade: stades.stade, ...stades })}>
                                                <PlusOneIcon />
                                            </IconButton>
                                        </Grid>
                                    </React.Fragment>
                                ))}
                            </Grid>
                        </Card>
                    ))}
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <Button variant="contained" color="primary" onClick={onConfirm}>
                            Enregistrer vos obs
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Modifier les valeurs
                    </Typography>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid item xs={4} align="center">
                            <IconButton onClick={() => setMaleCount(maleCount + 1)}
                                sx={{
                                    bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'primary.dark', },
                                    width: 40, height: 40, borderRadius: '50%'
                                }}>
                                <AddIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={4} align="center">
                            <IconButton onClick={() => setFemaleCount(femaleCount + 1)}
                                sx={{
                                    bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'primary.dark', },
                                    width: 40, height: 40, borderRadius: '50%'
                                }}>
                                <AddIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={4} align="center">
                            <IconButton onClick={() => setUndeterminedCount(undeterminedCount + 1)}
                                sx={{
                                    bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'primary.dark', },
                                    width: 40, height: 40, borderRadius: '50%'
                                }}>
                                <AddIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid item xs={4} align="center">
                            <Typography>Mâle</Typography>
                            <TextField value={maleCount} readOnly />
                        </Grid>
                        <Grid item xs={4} align="center">
                            <Typography>Femelle</Typography>
                            <TextField value={femaleCount} readOnly />
                        </Grid>
                        <Grid item xs={4} align="center">
                            <Typography>Indéterminé</Typography>
                            <TextField value={undeterminedCount} readOnly />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                        <Grid item xs={4} align="center">
                            <IconButton onClick={() => maleCount > 0 && setMaleCount(maleCount - 1)}
                                sx={{
                                    bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark', },
                                    width: 40, height: 40, borderRadius: '50%'
                                }}>
                                <RemoveIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={4} align="center">
                            <IconButton onClick={() => femaleCount > 0 && setFemaleCount(femaleCount - 1)}
                                sx={{
                                    bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark', },
                                    width: 40, height: 40, borderRadius: '50%'
                                }}>
                                <RemoveIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={4} align="center">
                            <IconButton onClick={() => undeterminedCount > 0 && setUndeterminedCount(undeterminedCount - 1)}
                                sx={{
                                    bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark', },
                                    width: 40, height: 40, borderRadius: '50%'
                                }}>
                                <RemoveIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Button onClick={handleSave} variant="contained" color="success" sx={{ mt: 2 }}>
                        Enregistrer
                    </Button>
                </Box>
            </Modal>
        </Box >
    );
};

export default Synthese;
