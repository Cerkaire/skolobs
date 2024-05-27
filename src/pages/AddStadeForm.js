import React, { useState, useEffect, useContext } from 'react';
import {
    Card, TextField, FormControl, InputLabel,
    Select, MenuItem, Button, Box, Typography, Grid, Switch, Autocomplete
} from '@mui/material';
import { db } from '../db/db';
import { MainContext } from '../context/MainContext';

const AddStadeForm = ({ onCancel, speciesOptions }) => {
    const { formData, setFormData, addOrUpdateStade, setPhase, selectedSpecies, setSelectedSpecies } = useContext(MainContext);
    const [observationData, setObservationData] = useState({
        collecte: '',
        comportement: '',
        denom: '',
        methode: '',
        mort: '',
        protocole: '',
        stade: '',
        statutbio: ''
    });
    const [stadeOptions, setStadeOptions] = useState([]);
    const [collecteOptions, setCollecteOptions] = useState([]);
    const [comportementOptions, setComportementOptions] = useState([]);
    const [denomOptions, setDenomOptions] = useState([]);
    const [methodeOptions, setMethodeOptions] = useState([]);
    const [mortOptions, setMortOptions] = useState([]);
    const [protocoleOptions, setProtocoleOptions] = useState([]);
    const [statutbioOptions, setStatutbioOptions] = useState([]);
    const [trouveMort, setTrouveMort] = useState(false);
    const [mort, setMort] = useState('');
    const [stade, setStade] = useState('');
    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);
    const [undeterminedCount, setUndeterminedCount] = useState(0);

    useEffect(() => {
        const initializeOptions = async (observatoire) => {
            const observatoireData = await db.observatoire.where('nomvar').equals(observatoire).toArray();
            const observatoireOptions = observatoireData[0]?.saisie || {};
            setStadeOptions(Object.entries(observatoireOptions.stade || {}).map(([label, value]) => ({ label, value })));
            setCollecteOptions(Object.entries(observatoireOptions.collecte || {}).map(([label, value]) => ({ label, value })));
            setComportementOptions(Object.entries(observatoireOptions.comportement || {}).map(([label, value]) => ({ label, value })));
            setDenomOptions(Object.entries(observatoireOptions.denom || {}).map(([label, value]) => ({ label, value })));
            setMethodeOptions(Object.entries(observatoireOptions.methode || {}).map(([label, value]) => ({ label, value })));
            setMortOptions(Object.entries(observatoireOptions.mort || {}).map(([label, value]) => ({ label, value })));
            setProtocoleOptions(Object.entries(observatoireOptions.protocole || {}).map(([label, value]) => ({ label, value })));
            setStatutbioOptions(Object.entries(observatoireOptions.statutbio || {}).map(([label, value]) => ({ label, value })));
        };

        if (selectedSpecies) {
            initializeOptions(selectedSpecies.observatoire);
        }
    }, [selectedSpecies]);

    useEffect(() => {
        if (stadeOptions.length > 0 &&
            collecteOptions.length > 0 &&
            comportementOptions.length > 0 &&
            denomOptions.length > 0 &&
            methodeOptions.length > 0 &&
            mortOptions.length > 0 &&
            protocoleOptions.length > 0 &&
            statutbioOptions.length > 0) {
            const defaultObservationData = {
                collecte: collecteOptions[0].value,
                comportement: comportementOptions[0].value,
                denom: denomOptions[0].value,
                methode: methodeOptions[0].value,
                mort: mortOptions[0].value,
                protocole: protocoleOptions[0].value,
                stade: stadeOptions[0].value,
                statutbio: statutbioOptions[0].value
            };
            setObservationData(defaultObservationData);
        }
    }, [stadeOptions, collecteOptions, comportementOptions, denomOptions, methodeOptions, mortOptions, protocoleOptions, statutbioOptions]);

    const handleSubmit = () => {
        // Construction des données d'observation pour un stade spécifique
        const formattedObservationData = {
            nom: selectedSpecies.nom,
            nomvern: selectedSpecies.nomvern,
            cdnom: selectedSpecies.cdnom,
            observatoire: selectedSpecies.observatoire,
            stade: stade,
            trouveMort,
            mort: trouveMort ? mort : null,
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


        // Utilisation de `addOrUpdateStade` pour ajouter ou mettre à jour l'espèce dans `formData`
        addOrUpdateStade(selectedSpecies.cdnom, formattedObservationData.stade, formattedObservationData);

        setPhase('synthese');
    };

    return (
        <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Saisie des observations</Typography>
            <Typography>{formData.coordonnee}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <TextField
                            value={selectedSpecies.nom}
                            disabled
                            getOptionLabel={(option) => option.nom + " (" + option.nomvern + ")"}
                            renderInput={(params) => <TextField {...params} label="Espèce" variant="outlined" margin="normal" />}
                        />
                    </FormControl>
                </Grid>
                {selectedSpecies && (
                    <>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Stade</InputLabel>
                                <Select
                                    value={observationData.stade}
                                    onChange={(e) => {
                                        setObservationData({ ...observationData, stade: e.target.value });
                                        setStade(e.target.value); // Mettre à jour l'état 'stade'
                                    }}
                                    label="Stade"
                                    variant="outlined"
                                >
                                    {stadeOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <TextField
                            type="number"
                            label="Mâle"
                            value={maleCount}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => setMaleCount(parseInt(e.target.value))}
                            fullWidth
                            sx={{ marginTop: 2 }}
                        />
                        <TextField
                            type="number"
                            label="Femelle"
                            value={femaleCount}
                            onChange={(e) => setFemaleCount(parseInt(e.target.value))}
                            fullWidth
                            sx={{ marginTop: 2 }}
                        />
                        <TextField
                            type="number"
                            label="Indéterminé"
                            value={undeterminedCount}
                            onChange={(e) => setUndeterminedCount(parseInt(e.target.value))}
                            fullWidth
                            sx={{ marginTop: 2 }}
                        />
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
                                <InputLabel>Dénomination</InputLabel>
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
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Méthode</InputLabel>
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
                            {/*                          <FormControl fullWidth>
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
                            </FormControl> */}
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
                                <InputLabel>Mort</InputLabel>
                                <Switch
                                    checked={trouveMort}
                                    onChange={(e) => setTrouveMort(e.target.checked)}
                                    color="primary"
                                />
                                {trouveMort && (
                                    <Select
                                        value={mort}
                                        onChange={(e) => setMort(e.target.value)}
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
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between">
                            <Button variant="contained" color="secondary" onClick={onCancel}>Annuler</Button>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>Ajouter le stade</Button>
                        </Box>
                    </Grid>
                </Box>
            </Grid>
        </Card>
    );
};
export default AddStadeForm;
