import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Button, Typography, CircularProgress, Box, CardHeader } from '@mui/material';
import { db } from '../db/db';

export default function Parametre() {
    const [status, setStatus] = useState('');
    const [observatoireCount, setObservatoireCount] = useState(0);
    const [speciesCount, setSpeciesCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCounts();
    }, []);

    async function fetchCounts() {
        const observatoireArray = await db.observatoire.toArray();
        setObservatoireCount(observatoireArray.length);
        const speciesArray = await db.species.toArray();
        setSpeciesCount(speciesArray.length);

    }

    const handleUpdateAll = async () => {
        setLoading(true);
        await handleUpdateObservatoireApiData();
        await handleUpdateSpeciesData();
        await handleUpdateParamData();
        setLoading(false);
    };

    async function handleUpdateObservatoireApiData() {
        try {
            await db.observatoire.clear();
            setStatus('Base de données des observatoires vidée');

            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/aggregator');
            const data = await response.json();

            const observatoireData = Object.values(data).map((item) => ({
                titre: item.titre,
                metakey: item.metakey,
                icon: item.icon,
                couleur: item.couleur,
                nomvar: item.nomvar,
                nom: item.nom,
                nomdeux: item.nomdeux,
                latin: item.latin,
                indice: item.indice,
                saisie: item.saisie,
                categorie: item.categorie,
                description: item.description
            }));

            await db.observatoire.bulkAdd(observatoireData);
            setStatus('Données des observatoires API chargées avec succès');
            fetchCounts();
        } catch (error) {
            setStatus(`Erreur lors de la mise à jour des données de l'API : ${error}`);
        }
    }

    async function handleUpdateSpeciesData() {
        try {
            await db.species.clear();
            setStatus('Base de données des espèces vidée');

            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/especes');
            const data = await response.json();

            const speciesData = Object.values(data).map((item) => ({
                cdnom: item.cdnom,
                nom: item.nom,
                nomvern: item.nomvern,
                observatoire: item.observatoire, // Corrected typo here
                rang: item.rang
            }));

            await db.species.bulkAdd(speciesData);
            setStatus('Données des espèces chargées avec succès');
            fetchCounts();
        } catch (error) {
            setStatus(`Erreur lors de la mise à jour des données de l'API : ${error}`);
        }
    }

    async function handleUpdateParamData() {
        try {
            await db.etude.clear();
            await db.protocole.clear();
            await db.orga.clear();
            await db.comportement.clear();
            await db.methode.clear();
            await db.occstatutbio.clear();
            await db.occtype.clear();
            await db.prospection.clear();
            await db.stade.clear();
            setStatus('Bases de données vidées');

            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/param');
            const data = await response.json();

            const protocoleData = data.protocole.map((item) => ({
                idprotocole: item.idprotocole,
                protocole: item.protocole
            }));

            const organismeData = data.organisme.map((item) => ({
                idorg: item.idorg,
                organisme: item.organisme
            }));

            const comportementData = data.comportement.map((item) => ({
                idcomp: item.idcomp,
                libcomp: item.libcomp
            }));

            const methodeData = data.methode.map((item) => ({
                idmethode: item.idmethode,
                methode: item.methode
            }));

            const occstatutbioData = data.occstatutbio.map((item) => ({
                idstbio: item.idstbio,
                statutbio: item.statutbio
            }));

            const occtypeData = data.occtype.map((item) => ({
                tdenom: item.tdenom,
                typedenom: item.typedenom
            }));

            const prospectionData = data.prospection.map((item) => ({
                idpros: item.idpros,
                prospection: item.prospection
            }));

            const etudeData = data.etude.map((item) => ({
                idetude: item.idetude,
                etude: item.etude
            }));

            const stadeData = data.stade.map((item) => ({
                idstade: item.idstade,
                stade: item.stade
            }));

            await db.protocole.bulkAdd(protocoleData);
            await db.orga.bulkAdd(organismeData);
            await db.etude.bulkAdd(etudeData);
            await db.comportement.bulkAdd(comportementData);
            await db.methode.bulkAdd(methodeData);
            await db.occstatutbio.bulkAdd(occstatutbioData);
            await db.occtype.bulkAdd(occtypeData);
            await db.prospection.bulkAdd(prospectionData);
            await db.stade.bulkAdd(stadeData);

            setStatus('Données des paramètres API chargées avec succès');
            fetchCounts();
        } catch (error) {
            setStatus(`Erreur lors de la mise à jour des données de l'API : ${error}`);
        }
    }

    return (
        <Container>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Card>
                        <CardHeader
                            title="Si c'est votre première connexion mettez à jour les référentiels"
                            subheader="Il est prudent de remettre a jour régulièrement les référentiels pour être sur d'etre en phase avec la base de données"
                        />

                        <CardContent>
                            <Button variant="contained" onClick={handleUpdateAll} color="secondary">
                                Tout mettre à jour
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h5">Observatoires</Typography>
                            <Button onClick={handleUpdateObservatoireApiData} size="small">Mettre à jour les données des observatoires</Button>
                            <Typography variant="body1">Nombre d'observatoires : {observatoireCount}</Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">Espèces</Typography>
                            <Button onClick={handleUpdateSpeciesData} size="small">Mettre à jour la liste des espèces</Button>
                            <Typography variant="body1">Nombre d'espèces : {speciesCount}</Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">Paramètres</Typography>
                            <Button onClick={handleUpdateParamData} size="small">Mettre à jour les paramètres</Button>
                        </CardContent>
                    </Card>
                    <Typography variant="body1">{status}</Typography>
                </>
            )}
        </Container>
    );
};

