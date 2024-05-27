import React, { useContext, useEffect, useState } from 'react';
import { Card, Button, Typography, Box, Container, IconButton, Grid, Modal, TextField, Chip } from '@mui/material';
import { MainContext } from '../context/MainContext';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const Synthese = ({ onAddObservation }) => {
    const { formData, setSelectedSpecies, setPhase, deleteSpecies, deleteStade, saveFormData, addOrUpdateStade } = useContext(MainContext);
    const navigate = useNavigate();

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

    return (
        <Box sx={{ width: '100%' }}>
            <Grid sx={{ paddingTop: 2 }} container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="h5">Synthèse</Typography>
                    <Typography variant="body1">Date: {formData.fiche.date1}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={onAddObservation}>
                        Ajouter espèce
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Observations</Typography>
                    {Object.entries(formData.especes).map(([cdnom, species]) => (
                        <Card key={cdnom} sx={{ marginBottom: 1, padding: 1 }} elevation={2}>
                            <Grid container alignItems="flex-start">
                                <Grid item xs={1.5}>
                                    <IconButton variant="contained" color="error" onClick={() => handleDeleteSpecie(cdnom)}>
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={7}>
                                    <Typography variant="body2">
                                        {species.nomvern} <br />
                                        <i>{species.nom}</i>
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <IconButton variant="contained" color="primary" onClick={() => handleAddStade(species)}>
                                        <Typography variant="caption"> Ajout stade  </Typography>
                                        <PlaylistAddIcon />
                                    </IconButton>
                                </Grid>
                                {species.stades && Object.entries(species.stades).map(([stade, stadeData]) => (
                                    <Grid item xs={12} key={stade} sx={{ marginTop: 2, marginLeft: 2 }}>
                                        <Grid container spacing={1} alignItems="center">
                                            <Grid item xs={1.5}>
                                                <IconButton variant="contained" color="secondary" onClick={() => handleDeleteStade(cdnom, stade)}>
                                                    <ClearIcon />
                                                </IconButton>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    Stade: {stadeData.libstade}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">
                                                    Total: {
                                                        (() => {
                                                            const maleCount = parseInt(stadeData.maleCount) || 0;
                                                            const femaleCount = parseInt(stadeData.femaleCount) || 0;
                                                            const undeterminedCount = parseInt(stadeData.undeterminedCount) || 0;
                                                            return maleCount + femaleCount + undeterminedCount;
                                                        })()
                                                    }
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={1.5}>
                                                <IconButton variant="contained" color="success" onClick={() => handleOpen({ cdnom, stade, ...stadeData })}>
                                                    <PlusOneIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </Card>
                    ))}
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <Button variant="contained" color="success" onClick={onConfirm}>
                            Valider et enregistrer
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
                    <Grid container spacing={2} justifyContent="center" alignItems="center" >
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
                    <Grid container spacing={2} justifyContent="center" alignItems="center" >
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
                    <Button onClick={handleSave} variant="contained" color="primary" sx={{ mt: 2 }}>
                        Enregistrer
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
};

export default Synthese;
