import React, { useEffect, useState, useContext } from 'react';
import { db } from '../db/db';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Typography, Box,
    Fab, Dialog, DialogTitle, DialogContent, Button, DialogActions
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { MainContext } from '../context/MainContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Obs = () => {
    const [structuredData, setStructuredData] = useState([]);
    const [openDial, setOpenDial] = useState(false);
    const { fetchFicheDataById } = useContext(MainContext);
    useEffect(() => {
        const fetchLibelleStade = async (stadeValue) => {
            try {
                const stadeId = Number(stadeValue);
                const stadeRecord = await db.stade.where('idstade').equals(stadeId).first();
                return stadeRecord ? stadeRecord.stade : 'Unknown';
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

    const handleDeleteStade = async (stadeId) => {
        try {
            // Trouver l'obsId et idFiche avant de supprimer le stade
            const ligneToDelete = await db.ligne.where('id').equals(stadeId).first();
            const obsId = ligneToDelete.idobs;

            // Supprimer le stade
            await db.ligne.where('id').equals(stadeId).delete();

            // Compter le nombre de lignes restantes avec le même obsId
            const remainingLignes = await db.ligne.where('idobs').equals(obsId).count();

            // Si aucune ligne restante, supprimer l'observation
            if (remainingLignes === 0) {
                // Trouver l'idFiche avant de supprimer l'observation
                const obsToDelete = await db.obs.where('id').equals(obsId).first();
                const idFiche = obsToDelete.idfiche;

                // Supprimer l'observation
                await db.obs.where('id').equals(obsId).delete();

                // Compter le nombre d'observations restantes avec le même idFiche
                const remainingObs = await db.obs.where('idfiche').equals(idFiche).count();

                // Si aucune observation restante, supprimer la fiche
                if (remainingObs === 0) {
                    await db.fiche.where('id').equals(idFiche).delete();
                }
            }

            // Mettre à jour l'état
            setStructuredData((prevData) =>
                prevData.map((fiche) => ({
                    ...fiche,
                    especes: fiche.especes.map((espece) => ({
                        ...espece,
                        stades: espece.stades.filter((stade) => stade.id !== stadeId)
                    })).filter((espece) => espece.stades.length > 0) // Supprimer les especes vides
                })).filter((fiche) => fiche.especes.length > 0) // Supprimer les fiches vides
            );
        } catch (error) {
            console.error('Erreur lors de la suppression du stade:', error);
        }
    };

    const handleEditClick = async (ficheId) => {
        await fetchFicheDataById(ficheId);
    };

    // Fonction pour ouvrir le dialogue
    const handleOpenDialog = () => {
        setOpenDial(true);
    };

    // Fonction pour fermer le dialogue
    const handleCloseDialog = () => {
        setOpenDial(false);
    };
    return (
        <TableContainer component={Paper}>
            < Fab size="small" color="primary" aria-label="help" onClick={handleOpenDialog} style={{ position: 'fixed', bottom: 16, right: 16 }
            }>
                <HelpOutlineIcon />
            </Fab >
            {/* Dialogue pour afficher les conseils */}
            < Dialog open={openDial} onClose={handleCloseDialog} >
                <DialogTitle>Conseils d'utilisation</DialogTitle>
                <DialogContent>
                    <p><EditNoteIcon color='secondary' />Permet d'éditer toutes les espèces de la fiche</p>
                    <p><DeleteIcon color='error' />Permet de supprimer un stade. Si vous supprimez tous les stades d'une espèce, cela supprime l'espèce</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Fermer</Button>
                </DialogActions>
            </Dialog >
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell > </TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Coordonées</TableCell>
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
                                    <TableCell>
                                        <IconButton variant="contained" color="secondary" onClick={() => handleEditClick(fiche.id)}>
                                            <EditNoteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
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
                                                                    <TableCell>M</TableCell>
                                                                    <TableCell>F</TableCell>
                                                                    <TableCell>Ind</TableCell>
                                                                    <TableCell></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {espece.stades.map((stade, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell>{stade.libelleStade}</TableCell>
                                                                        <TableCell>{stade.male}</TableCell>
                                                                        <TableCell>{stade.femelle}</TableCell>
                                                                        <TableCell>{stade.ndiff}</TableCell>
                                                                        <TableCell>
                                                                            <IconButton
                                                                                aria-label="delete"
                                                                                size="small"
                                                                                color='error'
                                                                                onClick={() => handleDeleteStade(stade.id)}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </TableCell>
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
