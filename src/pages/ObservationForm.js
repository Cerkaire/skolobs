import React, { useState, useEffect, useContext } from 'react';
import {
    Card, TextField, FormControl, InputLabel,
    Select, MenuItem, Button, Box, Typography, Autocomplete, Grid, Switch,
    IconButton, InputAdornment, Divider, Fab, Dialog, DialogTitle, DialogContent,
    DialogActions,
    FormControlLabel,
    FormLabel,
    CardContent,
    Modal,
    Badge
} from '@mui/material';
import { db } from '../db/db';
import { MainContext } from '../context/MainContext';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';


const ObservationForm = ({ speciesOptions, onCancel }) => {
    const { formData, setFormData, addOrUpdateSpecies, setPhase } = useContext(MainContext);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [observationData, setObservationData] = useState({
        collecte: 0,
        comportement: 0,
        tdenom: 'IND',
        methode: 0,
        mort: 0,
        protocole: 0,
        stade: 0,
        statutbio: 0,
        denom: 'Co'
    });
    const [trouveMort, setTrouveMort] = useState(0);
    const [mort, setMort] = useState('');
    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);
    const [undeterminedCount, setUndeterminedCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [species, setSpecies] = useState([]);
    const [showMaleCount, setShowMaleCount] = useState(true);
    const [showFemaleCount, setShowFemaleCount] = useState(true);
    const [showUndeterminedCount, setShowUndeterminedCount] = useState(true);

    // Charger les espèces depuis le fichier JSON
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/especes.json`)
            .then(response => response.json())
            .then(data => setSpecies(data))
            .catch(error => console.error('Erreur lors du chargement des espèces:', error));
    }, []);

    const handleSave = () => {
        // Construction des données d'observation pour un stade spécifique
        const formattedObservationData = {
            nom: selectedSpecies.latin,
            cdnom: selectedSpecies.cdnom,
            nomvern: selectedSpecies.espece,
            rqobs: '',
            observatoire: 'ornitho',
            stade: 2,
            trouveMort,
            mort: 0,
            maleCount,
            femaleCount,
            undeterminedCount,
            denom: 'Co',
            tdenom: 'IND',
            methode: 1,
            protocole: 1,
            statutbio: 0,
            comportement: observationData.comportement, //posé passage en vol, etc
            collecte: 1
        };
        addOrUpdateSpecies(selectedSpecies.cdnom, formattedObservationData);
        console.log('formattedObservationData', formattedObservationData);
        handleClose();
    };

    const handleCardClick = async (item) => {
        setSelectedSpecies(item);
        console.log('item', item);
        console.log('selectedSpecies', selectedSpecies);
        setMaleCount(0);
        setFemaleCount(0);
        setUndeterminedCount(0);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // Fonction pour ouvrir le dialogue
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    // Fonction pour fermer le dialogue
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleCount = (item) => {
        setShowMaleCount(!!item.imageM);
        setShowFemaleCount(!!item.imageF);
    }


    const handleValidate = () => {
        setPhase('synthese');
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
            <Card sx={{ padding: 2 }}>
                {/* Bouton pour ouvrir le dialogue */}
                <Fab size="small" color="primary" aria-label="help" onClick={handleOpenDialog} style={{ position: 'fixed', top: 50, left: 16 }}>
                    <HelpOutlineIcon />
                </Fab>
                {/* Dialogue pour afficher les conseils */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Conseils d'utilisation</DialogTitle>
                    <DialogContent>
                        <p>Vous n'êtes pas obligé de remplir tous les champs</p>
                        <p>Vous pourrez ajuster les valeurs mâles/femelles/indéterminé plus tard</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Fermer</Button>
                    </DialogActions>
                </Dialog>

                <Grid container spacing={2} padding={1}>
                    {species.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                elevation={3}
                                sx={{ height: 200, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                                onClick={() => { handleCount(item); handleCardClick(item); }}
                            >
                                <CardContent sx={{ padding: '2px', textAlign: 'center', position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                    <Typography variant="h5" sx={{ color: 'white' }}>
                                        {item.espece}
                                    </Typography>
                                    <Badge
                                        badgeContent={<CheckIcon color="success" />}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                    >
                                </CardContent>
                                <Box
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        backgroundImage: `url(${process.env.PUBLIC_URL + '/images/' + item.image})`,
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center',
                                    }}
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Card>
            <Fab sx={{ bgcolor: '#78b39e' }} variant="extended"
                onClick={handleValidate} style={{ position: 'fixed', top: 50, right: 16 }}>
                Valider vos observations
            </Fab>
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
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid item xs={12} align="center">
                            <Typography variant="h5" component="h2">
                                {selectedSpecies?.espece}
                            </Typography>
                        </Grid>
                        {selectedSpecies?.imageF ? (
                            <>
                                <Grid item xs={4} align="center">
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            backgroundImage: `url(${process.env.PUBLIC_URL + '/images/' + selectedSpecies?.image})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={4} align="center">
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            backgroundImage: `url(${process.env.PUBLIC_URL + '/images/' + selectedSpecies?.imageF})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={8} align="center">
                                <Box
                                    sx={{
                                        width: 500,
                                        height: 500,
                                        backgroundImage: `url(${process.env.PUBLIC_URL + '/images/' + selectedSpecies?.image})`,
                                        backgroundSize: 'contain',
                                        backgroundPosition: 'center',
                                    }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={4} align="left">
                            <Typography variant="h6" component="h2" sx={{ padding: 1, bottom: 0, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                                {selectedSpecies?.description}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Typography id="modal-title" variant="h5" component="h2">
                        Combien avez-vous vu de {selectedSpecies?.espece} ?
                    </Typography>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        {showMaleCount && (
                            <Grid item xs={4} align="center">
                                <IconButton onClick={() => setMaleCount(maleCount + 1)}
                                    sx={{
                                        bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' },
                                        width: 40, height: 40, borderRadius: '50%'
                                    }}>
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                        {showFemaleCount && (
                            <Grid item xs={4} align="center">
                                <IconButton onClick={() => setFemaleCount(femaleCount + 1)}
                                    sx={{
                                        bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' },
                                        width: 40, height: 40, borderRadius: '50%'
                                    }}>
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                        {showUndeterminedCount && (
                            <Grid item xs={4} align="center">
                                <IconButton onClick={() => setUndeterminedCount(undeterminedCount + 1)}
                                    sx={{
                                        bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' },
                                        width: 40, height: 40, borderRadius: '50%'
                                    }}>
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        {showMaleCount && (
                            <Grid item xs={4} align="center">
                                <Typography>Mâle</Typography>
                                <TextField value={maleCount} readOnly sx={{ width: 50, textAlign: 'center', '& .MuiInputBase-input': { textAlign: 'center' } }} />
                            </Grid>
                        )}
                        {showFemaleCount && (
                            <Grid item xs={4} align="center">
                                <Typography>Femelle</Typography>
                                <TextField value={femaleCount} readOnly sx={{ width: 50, textAlign: 'center', '& .MuiInputBase-input': { textAlign: 'center' } }} />
                            </Grid>
                        )}
                        {showUndeterminedCount && (
                            <Grid item xs={4} align="center">
                                <Typography>Indéterminé</Typography>
                                <TextField value={undeterminedCount} readOnly sx={{ width: 50, textAlign: 'center', '& .MuiInputBase-input': { textAlign: 'center' } }} />
                            </Grid>
                        )}
                    </Grid>
                    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                        {showMaleCount && (
                            <Grid item xs={4} align="center">
                                <IconButton onClick={() => maleCount > 0 && setMaleCount(maleCount - 1)}
                                    sx={{
                                        bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' },
                                        width: 40, height: 40, borderRadius: '50%'
                                    }}>
                                    <RemoveIcon />
                                </IconButton>
                            </Grid>
                        )}
                        {showFemaleCount && (
                            <Grid item xs={4} align="center">
                                <IconButton onClick={() => femaleCount > 0 && setFemaleCount(femaleCount - 1)}
                                    sx={{
                                        bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' },
                                        width: 40, height: 40, borderRadius: '50%'
                                    }}>
                                    <RemoveIcon />
                                </IconButton>
                            </Grid>
                        )}
                        {showUndeterminedCount && (
                            <Grid item xs={4} align="center">
                                <IconButton onClick={() => undeterminedCount > 0 && setUndeterminedCount(undeterminedCount - 1)}
                                    sx={{
                                        bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' },
                                        width: 40, height: 40, borderRadius: '50%'
                                    }}>
                                    <RemoveIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                    <Button onClick={handleSave} variant="contained" color="success" sx={{ mt: 2 }}>
                        Enregistrer
                    </Button>
                </Box>
            </Modal >
        </Box >
    );
};

export default ObservationForm;
