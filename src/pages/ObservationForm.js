import React, { useState, useEffect, useContext } from 'react';
import {
    Card, TextField, FormControl, InputLabel,
    Select, MenuItem, Button, Box, Typography, Autocomplete, Grid, Switch,
    IconButton,
    InputAdornment
} from '@mui/material';
import { db } from '../db/db';
import { MainContext } from '../context/MainContext';

const ObservationForm = ({ speciesOptions, onCancel }) => {
    const { formData, setFormData, addOrUpdateSpecies, setPhase } = useContext(MainContext);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [observationData, setObservationData] = useState({
        collecte: 0,
        comportement: 0,
        denom: 0,
        methode: 0,
        mort: 0,
        protocole: 0,
        stade: 0,
        statutbio: 0
    });
    const [stadeOptions, setStadeOptions] = useState([]);
    const [collecteOptions, setCollecteOptions] = useState([]);
    const [comportementOptions, setComportementOptions] = useState([]);
    const [denomOptions, setDenomOptions] = useState([]);
    const [methodeOptions, setMethodeOptions] = useState([]);
    const [mortOptions, setMortOptions] = useState([]);
    const [protocoleOptions, setProtocoleOptions] = useState([]);
    const [statutbioOptions, setStatutbioOptions] = useState([]);
    const [trouveMort, setTrouveMort] = useState(0);
    const [mort, setMort] = useState('');
    const [stade, setStade] = useState('');
    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);
    const [undeterminedCount, setUndeterminedCount] = useState(0);

    // Mette à jour le gestionnaire de changement d'espèce   
    const handleSpeciesChange = async (event, value) => {
        setSelectedSpecies(value);
        if (value) {
            const observatoire = value.observatoire;
            const observatoireData = await db.observatoire.where('nomvar').equals(observatoire).toArray();
            const observatoireOptions = observatoireData[0]?.saisie || {};
            const newStadeOptions = Object.entries(observatoireOptions.stade || {}).map(([label, value]) => ({ label, value }));
            const newCollecteOptions = Object.entries(observatoireOptions.collecte || {}).map(([label, value]) => ({ label, value }));
            const newComportementOptions = Object.entries(observatoireOptions.comportement || {}).map(([label, value]) => ({ label, value }));
            const newDenomOptions = Object.entries(observatoireOptions.denom || {}).map(([label, value]) => ({ label, value }));
            const newMethodeOptions = Object.entries(observatoireOptions.methode || {}).map(([label, value]) => ({ label, value }));
            const newMortOptions = Object.entries(observatoireOptions.mort || {}).map(([label, value]) => ({ label, value }));
            const newProtocoleOptions = Object.entries(observatoireOptions.protocole || {}).map(([label, value]) => ({ label, value }));
            const newStatutbioOptions = Object.entries(observatoireOptions.statutbio || {}).map(([label, value]) => ({ label, value }));

            setStadeOptions(newStadeOptions);
            setCollecteOptions(newCollecteOptions);
            setComportementOptions(newComportementOptions);
            setDenomOptions(newDenomOptions);
            setMethodeOptions(newMethodeOptions);
            setMortOptions(newMortOptions);
            setProtocoleOptions(newProtocoleOptions);
            setStatutbioOptions(newStatutbioOptions);

            // Définir les valeurs par défaut pour chaque champ
            setObservationData({
                collecte: newCollecteOptions.length > 0 ? newCollecteOptions[0].value : 0,
                comportement: newComportementOptions.length > 0 ? newComportementOptions[0].value : 0,
                denom: newDenomOptions.length > 0 ? newDenomOptions[0].value : 0,
                methode: newMethodeOptions.length > 0 ? newMethodeOptions[0].value : 0,
                mort: newMortOptions.length > 0 ? newMortOptions[0].value : 0,
                protocole: newProtocoleOptions.length > 0 ? newProtocoleOptions[0].value : 0,
                stade: newStadeOptions.length > 0 ? newStadeOptions[0].value : 0,
                statutbio: newStatutbioOptions.length > 0 ? newStatutbioOptions[0].value : 0
            });
        }
    };

    // Mettre à jour les valeurs par défaut à chaque changement d'options
    useEffect(() => {
        if (selectedSpecies) {
            setObservationData((prevData) => ({
                collecte: collecteOptions.length > 0 ? collecteOptions[0].value : 0,
                comportement: comportementOptions.length > 0 ? comportementOptions[0].value : 0,
                denom: denomOptions.length > 0 ? denomOptions[0].value : 0,
                methode: methodeOptions.length > 0 ? methodeOptions[0].value : 0,
                mort: mortOptions.length > 0 ? mortOptions[0].value : 0,
                protocole: protocoleOptions.length > 0 ? protocoleOptions[0].value : 0,
                stade: stadeOptions.length > 0 ? stadeOptions[0].value : 0,
                statutbio: statutbioOptions.length > 0 ? statutbioOptions[0].value : 0
            }));
        }
    }, [stadeOptions, collecteOptions, comportementOptions, denomOptions, methodeOptions, mortOptions, protocoleOptions, statutbioOptions, selectedSpecies]);

    const handleSubmit = () => {
        // Construction des données d'observation pour un stade spécifique
        const formattedObservationData = {
            nom: selectedSpecies.nom,
            cdnom: selectedSpecies.cdnom,
            nomvern: selectedSpecies.nomvern,
            observatoire: selectedSpecies.observatoire,
            stade: observationData.stade,
            trouveMort,
            mort: trouveMort ? observationData.mort : 0,
            maleCount,
            femaleCount,
            undeterminedCount,
            denom: observationData.denom,
            methode: observationData.methode,
            protocole: observationData.protocole,
            statutbio: observationData.statutbio,
            comportement: observationData.comportement,
            collecte: observationData.collecte
        };

        console.log('formattedObservationData', formattedObservationData);
        // Utilisation de `addOrUpdateSpecies` pour ajouter ou mettre à jour l'espèce dans `formData`
        addOrUpdateSpecies(selectedSpecies.cdnom, formattedObservationData);

        setPhase('synthese');
    };

    return (
        <Card sx={{ padding: 2 }}>
            <Typography>{formData.coordonnee}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            options={speciesOptions}
                            getOptionLabel={(option) => option.nom + " (" + option.nomvern + ")"}
                            onChange={handleSpeciesChange}
                            renderInput={(params) => <TextField {...params} label="Espèce" variant="outlined" margin="normal" />}
                        />
                    </FormControl>
                </Grid>
                {selectedSpecies && (
                    <>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Stade</InputLabel>
                                <Select
                                    value={observationData.stade}
                                    onChange={(e) => setObservationData({ ...observationData, stade: e.target.value })}
                                    label="Stade"
                                    variant="outlined"
                                >
                                    {stadeOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Dénombrement</InputLabel>
                                <Select
                                    value={observationData.denom}
                                    onChange={(e) => setObservationData({ ...observationData, denom: e.target.value })}
                                    label="Dénomination"
                                    variant="outlined"
                                >
                                    {denomOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="number"
                                label="Mâle"
                                value={maleCount}
                                inputProps={{ min: 0, }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => setMaleCount(parseInt(e.target.value))}
                                fullWidth
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="number"
                                label="Femelle"
                                value={femaleCount}
                                inputProps={{ min: 0, }}
                                onChange={(e) => setFemaleCount(parseInt(e.target.value))}
                                fullWidth
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="number"
                                label="Indéterminé"
                                value={undeterminedCount}
                                inputProps={{ min: 0, }}
                                onChange={(e) => setUndeterminedCount(parseInt(e.target.value))}
                                fullWidth
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Méthode d'observation</InputLabel>
                                <Select
                                    value={observationData.methode}
                                    onChange={(e) => setObservationData({ ...observationData, methode: e.target.value })}
                                    label="Méthode"
                                    variant="outlined"
                                >
                                    {methodeOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Collecte</InputLabel>
                                <Select
                                    value={observationData.collecte}
                                    onChange={(e) => setObservationData({ ...observationData, collecte: e.target.value })}
                                    label="Collecte"
                                    variant="outlined"
                                >
                                    {collecteOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Comportement</InputLabel>
                                <Select
                                    value={observationData.comportement}
                                    onChange={(e) => setObservationData({ ...observationData, comportement: e.target.value })}
                                    label="Comportement"
                                    variant="outlined"
                                >
                                    {comportementOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Statut biologique</InputLabel>
                                <Select
                                    value={observationData.statutbio}
                                    onChange={(e) => setObservationData({ ...observationData, statutbio: e.target.value })}
                                    label="Statut biologique"
                                    variant="outlined"
                                >
                                    {statutbioOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Protocole</InputLabel>
                                <Select
                                    value={observationData.protocole}
                                    onChange={(e) => setObservationData({ ...observationData, protocole: e.target.value })}
                                    label="Protocole"
                                    variant="outlined"
                                >
                                    {protocoleOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Mort</InputLabel>
                                <Switch
                                    checked={trouveMort === 1}
                                    onChange={(e) => setTrouveMort(e.target.checked ? 1 : 0)}
                                    color="primary"
                                />
                                {trouveMort && (
                                    <Select
                                        value={observationData.mort}
                                        onChange={(e) => setObservationData({ ...observationData, mort: e.target.value })}
                                        label="Cause de Mort"
                                        variant="outlined"
                                        fullWidth
                                    >
                                        {mortOptions.map((option, index) => (
                                            <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </FormControl>
                        </Grid>
                    </>
                )}
                <Grid item xs={12}>
                    <Box
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            width: '90%',
                            backgroundColor: 'white',
                            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            padding: 2,
                        }}
                    >
                        <Box display="flex" justifyContent="space-between">
                            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                                <Grid item xs={6} container justifyContent="center">
                                    <Button variant="contained" color="secondary" onClick={onCancel} fullWidth>
                                        Annuler
                                    </Button>
                                </Grid>
                                <Grid item xs={6} container justifyContent="center">
                                    <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                                        Enregistrer
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Card >

    );
};

export default ObservationForm;
