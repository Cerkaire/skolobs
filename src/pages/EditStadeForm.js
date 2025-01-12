import React, { useState, useEffect, useContext } from 'react';
import {
    Card, TextField, FormControl, InputLabel,
    Select, MenuItem, Button, Box, Typography, Grid, Switch,
    FormControlLabel
} from '@mui/material';
import { db } from '../db/db';
import { MainContext } from '../context/MainContext';

const EditStadeForm = ({ onCancel, selectedSpecies, selectedStade }) => {
    const { formData, addOrUpdateStade, setPhase } = useContext(MainContext);
    const [observationData, setObservationData] = useState({
        collecte: '',
        comportement: '',
        denom: 'Co',
        tdenom: 'IND',
        methode: '',
        mort: '',
        protocole: '',
        stade: '',
        statutbio: '',
        rqobs: '',
        maleCount: 0,
        femaleCount: 0,
        undeterminedCount: 0,
        trouveMort: false
    });

    const [stadeOptions, setStadeOptions] = useState([]);
    const [collecteOptions, setCollecteOptions] = useState([]);
    const [comportementOptions, setComportementOptions] = useState([]);
    const [denomOptions, setDenomOptions] = useState([]);
    const [methodeOptions, setMethodeOptions] = useState([]);
    const [mortOptions, setMortOptions] = useState([]);
    const [protocoleOptions, setProtocoleOptions] = useState([]);
    const [statutbioOptions, setStatutbioOptions] = useState([]);

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
                collecte: selectedStade.collecte,
                comportement: selectedStade.comportement,
                denom: selectedStade.denom,
                tdenom: selectedStade.tdenom,
                methode: selectedStade.methode,
                mort: selectedStade.mort,
                protocole: selectedStade.protocole,
                stade: selectedStade.stade,
                statutbio: selectedStade.statutbio,
                rqobs: selectedSpecies.rqobs,
                maleCount: selectedStade.maleCount,
                femaleCount: selectedStade.femaleCount,
                undeterminedCount: selectedStade.undeterminedCount,
                trouveMort: selectedStade.trouveMort
            };
            setObservationData(defaultObservationData);
            console.log("Initial Observation Data:", defaultObservationData);
        }
    }, [selectedStade, stadeOptions, collecteOptions, comportementOptions, denomOptions, methodeOptions, mortOptions, protocoleOptions, statutbioOptions]);

    const handleSubmit = () => {
        addOrUpdateStade(selectedSpecies.cdnom, selectedStade.stade, {
            ...observationData
        });

        setPhase('synthese');
    };

    // Définir les options de dénombrement
    const denomOpt = [
        { value: 'Co', label: 'Compté' },
        { value: 'Es', label: 'Estimé' },
    ];

    const handleOptionChange = (field, value) => {
        setObservationData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    };

    return (
        <Card sx={{ padding: 2 }}>
            <Typography variant="h5">Modification du stade</Typography>
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
                                    onChange={(e) => handleOptionChange('stade', e.target.value)}
                                    label="Stade"
                                    variant="outlined"
                                >
                                    {stadeOptions.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Méthode d'observation</InputLabel>
                                <Select
                                    value={observationData.methode}
                                    onChange={(e) => handleOptionChange('methode', e.target.value)}
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
                                <InputLabel>Type de dénombrement</InputLabel>
                                <Select
                                    value={observationData.tdenom}
                                    onChange={(e) => handleOptionChange('tdenom', e.target.value)}
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
                                <InputLabel>Dénombrement</InputLabel>
                                <Select
                                    value={observationData.denom}
                                    onChange={(e) => handleOptionChange('denom', e.target.value)}
                                    label="Dénombrement"
                                >
                                    {denomOpt.map((option, index) => (
                                        <MenuItem key={index} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="number"
                                label="Mâle"
                                value={observationData.maleCount}
                                inputProps={{ min: 0 }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => handleOptionChange('maleCount', parseInt(e.target.value))}
                                fullWidth
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="number"
                                label="Femelle"
                                value={observationData.femaleCount}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{ min: 0 }}
                                onChange={(e) => handleOptionChange('femaleCount', parseInt(e.target.value))}
                                fullWidth
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                type="number"
                                label="Indéterminé"
                                value={observationData.undeterminedCount}
                                inputProps={{ min: 0 }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(e) => handleOptionChange('undeterminedCount', parseInt(e.target.value))}
                                fullWidth
                                sx={{ marginTop: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Comportement</InputLabel>
                                <Select
                                    value={observationData.comportement}
                                    onChange={(e) => handleOptionChange('comportement', e.target.value)}
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
                                    onChange={(e) => handleOptionChange('statutbio', e.target.value)}
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
                                <InputLabel>Collecte</InputLabel>
                                <Select
                                    value={observationData.collecte}
                                    onChange={(e) => handleOptionChange('collecte', e.target.value)}
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
                                <InputLabel>Protocole</InputLabel>
                                <Select
                                    value={observationData.protocole}
                                    onChange={(e) => handleOptionChange('protocole', e.target.value)}
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
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={observationData.trouveMort}
                                            onChange={(e) => handleOptionChange('trouveMort', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Trouvé mort"
                                />
                                {observationData.trouveMort && (
                                    <Select
                                        value={observationData.mort}
                                        onChange={(e) => handleOptionChange('mort', e.target.value)}
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
                        <Grid item xs={12}>
                            <TextField
                                label="Remarque"
                                value={observationData.rqobs}
                                onChange={(e) => handleOptionChange('rqobs', e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                            />
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
                            <Button variant="contained" color="primary" onClick={handleSubmit}>Mettre à jour le stade</Button>
                        </Box>
                    </Grid>
                </Box>
            </Grid>
        </Card>
    );
};

export default EditStadeForm;
