import React, { useEffect, useState } from 'react';
import { db } from '../db/db';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Collapse,
    Typography,
    Box
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Obs = () => {
    const [structuredData, setStructuredData] = useState([]);

    useEffect(() => {
        const fetchLibelleStade = async (stadeValue) => {
            try {
                const stadeId = Number(stadeValue);
                const stadeRecord = await db.stade.where('idstade').equals(stadeId).first();
                return stadeRecord ? stadeRecord.stade : 'Unknown'; // Default to 'Unknown' if not found
            } catch (error) {
                console.error(`Erreur lors de la récupération du libellé du stade pour la valeur ${stadeValue}:`, error);
                return 'Error';
            }
        };

        const fetchData = async () => {
            try {
                const fiches = await db.fiche.toArray();
                const observations = await db.obs.toArray();
                const lignes = await db.ligne.toArray();

                const data = await Promise.all(fiches.map(async (fiche) => {
                    const ficheObs = observations.filter((obs) => obs.idfiche === fiche.id);
                    const ficheWithEspeces = await Promise.all(ficheObs.map(async (obs) => {
                        const obsLignes = await Promise.all(lignes.filter((ligne) => ligne.idobs === obs.id).map(async (ligne) => {
                            const libelleStade = await fetchLibelleStade(ligne.stade);
                            return { ...ligne, libelleStade };
                        }));
                        return { ...obs, stades: obsLignes };
                    }));
                    return { ...fiche, especes: ficheWithEspeces, open: false };
                }));

                setStructuredData(data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        };

        fetchData();
    }, []);

    

    const toggleFicheOpen = (ficheId) => {
        setStructuredData((prevData) =>
            prevData.map((fiche) =>
                fiche.id === ficheId ? { ...fiche, open: !fiche.open } : fiche
            )
        );
    };

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Date</TableCell>
                        <TableCell>Coordonées</TableCell>
                        <TableCell>Étude</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {structuredData.length > 0 ? (
                        structuredData.map((fiche) => (
                            <React.Fragment key={fiche.id}>
                                <TableRow>
                                    <TableCell >
                                        <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() => toggleFicheOpen(fiche.id)}
                                        >
                                            {fiche.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{new Date(fiche.date).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>{parseFloat(fiche.lat).toFixed(3)} / {parseFloat(fiche.lng).toFixed(3)}</TableCell>
                                    <TableCell>{fiche.idetude}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                        <Collapse in={fiche.open} timeout="auto" unmountOnExit>
                                            <Box margin={1}>
                                                {fiche.especes.map((espece) => (
                                                    <Box key={espece.id} marginTop={2}>
                                                        <Typography variant="h6" gutterBottom component="div">
                                                            {espece.nomvern} ({espece.nom})
                                                        </Typography>
                                                        <Table size="small" aria-label="stades">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Stade</TableCell>
                                                                    <TableCell>Males</TableCell>
                                                                    <TableCell>Femelles</TableCell>
                                                                    <TableCell>Indéterminé</TableCell>
                                                                    <TableCell>Méthode</TableCell>
                                                                    <TableCell>Comportement</TableCell>
                                                                    <TableCell>Collecte</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {espece.stades.map((stade, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell>{stade.libelleStade}</TableCell>
                                                                        <TableCell>{stade.male}</TableCell>
                                                                        <TableCell>{stade.femelle}</TableCell>
                                                                        <TableCell>{stade.ndiff}</TableCell>
                                                                        <TableCell>{stade.idmethode}</TableCell>
                                                                        <TableCell>{stade.idcomp}</TableCell>
                                                                        <TableCell>{stade.idpros}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7}>Aucune observation trouvée.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Obs;
