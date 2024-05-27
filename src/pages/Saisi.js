import React, { useEffect, useState, useContext } from 'react';
import { Typography, Container } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { db } from '../db/db';
import FicheForm from './FicheForm';
import ObservationForm from './ObservationForm';
import Synthese from './Synthese';
import AddStadeForm from './AddStadeForm';
import MapView from './MapView';
import { MainContext } from '../context/MainContext';

export default function Saisie() {
    const { selectedSpecies, setSelectedSpecies, phase, setPhase } = useContext(MainContext);
    const [clickedPosition, setClickedPosition] = useState(null);
    const [organismes, setOrganismes] = useState([]);
    const [etudes, setEtudes] = useState([]);
    const [speciesOptions, setSpeciesOptions] = useState([]);
    const [status, setStatus] = useState('');
    const [onUpdateSelectedSpecies, setOnUpdateSelectedSpecies] = useState(null);


    // Fetch organismes, etudes and species from database
    useEffect(() => {
        async function fetchData() {
            const [organismeData, etudeData, speciesData] = await Promise.all([
                db.orga.toArray(),
                db.etude.toArray(),
                db.species.toArray(),
            ]);
            setOrganismes(organismeData);
            setEtudes(etudeData);
            setSpeciesOptions(speciesData.map(species => ({
                cdnom: species.cdnom, // Assuming cdnom is available in species
                nom: species.nom,
                nomvern: species.nomvern,
                observatoire: species.observatoire,
            })));
        }
        fetchData();
    }, [onUpdateSelectedSpecies]);



    const handleSyntheseConfirm = () => {
        setStatus('Observation enregistrée avec succès');
        setClickedPosition(null);
        setPhase('map');
    };

    const handleSyntheseEdit = () => {
        setPhase('observation');
    };

    const handleAddObservation = () => {
        setPhase('observation');
    };

    const handleAddStade = () => {
        setPhase('addstade');
    };

    return (
        <Container>
            {phase === 'map' && (
                <MapView />
            )}
            {phase === 'fiche' && (
                <FicheForm
                    organismes={organismes}
                    etudes={etudes}
                    onCancel={() => setPhase('map')}
                />
            )}
            {phase === 'observation' && (
                <ObservationForm
                    speciesOptions={speciesOptions}
                    onCancel={() => setPhase('map')}
                />
            )}
            {phase === 'synthese' && (
                <Synthese
                    selectedSpecies={selectedSpecies}
                    onConfirm={handleSyntheseConfirm}
                    onEdit={handleSyntheseEdit}
                    onAddObservation={handleAddObservation}
                    onAddStade={handleAddStade}
                />
            )}
            {phase === 'addstade' && (
                <AddStadeForm
                    speciesOptions={speciesOptions}
                    selectedSpecies={selectedSpecies}
                    onCancel={() => setPhase('synthese')}
                />
            )}
            {status && (
                <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>
                    {status}
                </Typography>
            )}
        </Container>
    );
}
