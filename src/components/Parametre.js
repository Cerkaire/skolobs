import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Button, Typography, CircularProgress, Box, CardHeader } from '@mui/material';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import proj4 from 'proj4';

export default function Parametre() {
    const [status, setStatus] = useState('');
    const [observatoireCount, setObservatoireCount] = useState(0);
    const [observateursCount, setObservateursCount] = useState(0);
    const [speciesCount, setSpeciesCount] = useState(0);
    const [siteCount, setSiteCount] = useState(0);
    const [communeCount, setCommuneCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // Définir les systèmes de projection
    const lambert93 = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
    const wgs84 = 'EPSG:4326';

    useEffect(() => {
        fetchCounts();
    }, []);

    async function fetchCounts() {
        const observatoireArray = await db.observatoire.toArray();
        setObservatoireCount(observatoireArray.length);
        const speciesArray = await db.species.toArray();
        setSpeciesCount(speciesArray.length);
        const communeArray = await db.commune.toArray();
        setCommuneCount(communeArray.length);
        const siteArray = await db.site.toArray();
        setSiteCount(siteArray.length);
        const observateursArray = await db.observateurs.toArray();
        setObservateursCount(observateursArray.length);

    }

    const handleUpdateAll = async () => {
        setLoading(true);
        await handleUpdateObservatoireApiData();
        await handleUpdateSpeciesData();
        await handleUpdateParamData();
        await handleUpdateSiteData();
        await handleUpdateCommuneData();
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
                observatoire: item.observatoire,
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
            navigate("/lannobsgo");
        } catch (error) {
            setStatus(`Erreur lors de la mise à jour des données de l'API : ${error}`);
        }
    }

    async function handleUpdateSiteData() {
        try {
            await db.site.clear();
            await db.observateurs.clear();
            setStatus('Bases de données vidées');

            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/site');
            const data = await response.json();

            const observateursData = data.observateurs.map((item) => ({
                idobser: item.idobser,
                observateur: item.observateur,
                nom: item.nom,
                prenom: item.prenom
            }));

            const siteData = data.site.map((item) => ({
                idsite: item.idsite,
                idcoord: item.idcoord,
                codecom: item.codecom,
                site: item.site,
                idparent: item.idparent,
                wsite: item.wsite,
                typestation: item.typestation,
                idstatus: item.idstatus,
                x: item.x,
                y: item.y,
                altitude: item.altitude,
                lat: item.lat,
                lng: item.lng,
                codel93: item.codel93,
                utm: item.utm,
                utm1: item.utm1,
                codel935: item.codel935,
                codel931: item.codel931
            }));

            await db.site.bulkAdd(siteData);
            await db.observateurs.bulkAdd(observateursData);

            setStatus('Données des sites chargées avec succès');
            fetchCounts();
            navigate("/lannobsgo");
        } catch (error) {
            setStatus(`Erreur lors de la mise à jour des données de l'API : ${error}`);
        }
    }

    async function handleUpdateCommuneData() {
        try {
            // Nettoyez les bases de données existantes
            await db.commune.clear();
            await db.geojson.clear(); // Vider la table 'geojson' si elle existe
            setStatus('Bases de données vidées');

            // Récupérez les données depuis l'API
            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/commune');
            const data = await response.json();

            // Préparer les projections
            const lambert93 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
            const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

            // Préparez les données pour la table 'commune'
            const communeData = Object.values(data).map((item) => ({
                codecom: item.codecom,
                commune: item.commune,
                poly: item.poly,
                geojson: item.geojson, // Coordonnées brutes
            }));
            // Transformez les coordonnées en WGS84
            const multiPolygon = Object.values(data).map((item) => {
                const rawCoordinates = JSON.parse(item.geojson); // Coordonnées brutes
                return rawCoordinates.map((polygon) =>
                    polygon.map((coord) => {
                        const [lng, lat] = proj4(lambert93, wgs84, coord); // Conversion Lambert93 → WGS84
                        return [lat, lng]; // Inverser lng/lat pour obtenir [lat, lng]
                    })
                );
            });

            // Stockez les données dans les tables Dexie
            await db.commune.bulkAdd(communeData); // Ajouter les données des communes
            await db.geojson.add(multiPolygon); // Ajouter le MultiPolygon dans la table 'geojson'

            // Mettez à jour l'état
            setStatus('Données des communes chargées avec succès');
            fetchCounts(); // Mettez à jour les compteurs
            navigate("/lannobsgo"); // Redirection après succès
        } catch (error) {
            // Gestion des erreurs
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
                            <Typography variant="caption">(Etudes, protocoles, stades, etc)</Typography>
                            <Button onClick={handleUpdateParamData} size="small">Mettre à jour les paramètres</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">Communes</Typography>
                            <Button onClick={handleUpdateCommuneData} size="small">Mettre à jour les communes</Button>
                            <Typography variant="body1">Nombre de commune : {communeCount}</Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">Sites et observateurs</Typography>
                            <Button onClick={handleUpdateSiteData} size="small">Mettre à jour les sites</Button>
                            <Typography variant="body1">Nombre de sites : {siteCount}</Typography>
                            <Typography variant="body1">Nombre d'observateurs : {observateursCount}</Typography>
                        </CardContent>
                    </Card>
                    <Typography variant="body1">{status}</Typography>
                </>
            )}
        </Container>
    );
};

