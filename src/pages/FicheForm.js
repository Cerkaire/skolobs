import React, { useContext } from 'react';
import { Card, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Typography, Switch, IconButton, Grid } from '@mui/material';
import { MainContext } from '../context/MainContext';

const FicheForm = ({ organismes, etudes, onCancel }) => {
    const { formData, setFormData, updatePhase, setPhase, updateFormData, clickedPosition } = useContext(MainContext);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Mettre à jour les données de la fiche dans le contexte
        const newFormData = {
            fiche: {
                lat: clickedPosition.lat,
                long: clickedPosition.lng,
                date1: formData.fiche.date1,
                date2: formData.fiche.date2,
                organisme: formData.fiche.organisme,
                etude: formData.fiche.etude,
                typeDonnee: formData.fiche.typeDonnee,
                diffusion: formData.fiche.diffusion,
            }
        };
        updateFormData(newFormData);
        console.log('newFormData', newFormData);
        setPhase('observation');
    };

    return (
        <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Fiche d'observation</Typography>
            {clickedPosition && (
                <Typography>{clickedPosition.lat.toFixed(5)}, {clickedPosition.lng.toFixed(5)}</Typography>
            )}

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
                <FormControl fullWidth margin="normal">
                    <InputLabel>Organisme</InputLabel>
                    <Select
                        value={formData.fiche.organisme}
                        onChange={(e) => setFormData({
                            ...formData,
                            fiche: { ...formData.fiche, organisme: e.target.value }
                        })}
                    >
                        {organismes.map((org) => (
                            <MenuItem key={org.idorg} value={org.idorg}>{org.organisme}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Etude</InputLabel>
                    <Select
                        value={formData.fiche.etude}
                        onChange={(e) => setFormData({
                            ...formData,
                            fiche: { ...formData.fiche, etude: e.target.value }
                        })}
                    >
                        {etudes.map((et) => (
                            <MenuItem key={et.idetude} value={et.idetude}>{et.etude}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Grid container spacing={2} direction="row" justifyContent="center" alignItems="center">
                    <Grid item xs={6}>
                        <FormControl margin="normal">
                            <Typography>Type de donnée</Typography>
                            <Switch
                                checked={formData.fiche.typeDonnee === 'Pr'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    fiche: { ...formData.fiche, typeDonnee: e.target.checked ? 'Pr' : 'Pu' }
                                })}
                            />
                            <Typography>{formData.fiche.typeDonnee === 'Pr' ? 'Privé' : 'Public'}</Typography>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Diffusion</InputLabel>
                            <Select
                                value={formData.fiche.diffusion}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    fiche: { ...formData.fiche, diffusion: e.target.value }
                                })}
                            >
                                <MenuItem value="Point">Point</MenuItem>
                                <MenuItem value="Maille">Maille</MenuItem>
                                <MenuItem value="Commune">Commune</MenuItem>
                                <MenuItem value="Département">Département</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Button variant="outlined" color="secondary" onClick={onCancel}>
                                Retour carte
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button variant="contained" color="success" type="submit">
                                Saisir des Obs
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </form>

        </Card>
    );
};

export default FicheForm;
