import React, { useContext, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import SyncIcon from '@mui/icons-material/Sync';
import Typography from '@mui/material/Typography';
import { MainContext } from '../context/MainContext';
import { db } from '../db/db';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Dialog, DialogActions, DialogContent, DialogTitle, Fab } from '@mui/material';

export default function Synchro() {
    const { obsCount, setObsCount } = useContext(MainContext);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [openDial, setOpenDial] = useState(false);

    const syncData = async () => {
        setSyncing(true);
        setSyncError(null);
        setSyncSuccess(false);

        try {
            // Récupérer les données de toutes les tables
            const fiches = await db.fiche.toArray();
            const obs = await db.obs.toArray();
            const lignes = await db.ligne.toArray();
            const users = await db.user.toArray();

            // Créer un objet pour contenir toutes les données
            const dataToSync = {
                fiches,
                obs,
                lignes,
                users
            };

            console.log('Data to sync:', dataToSync);

            // Envoyer les données à l'API
            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSync)
            });

            if (!response.ok) {
                const errorData = await response.json();
            
                // Récupère le message d'erreur en tenant compte de la structure de la réponse
                const errorMessage = errorData.message || 'Erreur inconnue';
                const errorDetails = errorData.error;
            
                console.error('Détails de l\'erreur:', errorDetails);
            
                // Inclure les détails d'erreur directement dans le message d'erreur pour pouvoir les récupérer ensuite
                throw new Error(`${errorMessage}: ${errorDetails}`);
            }
            
            const result = await response.json();
            console.log('Données synchronisées avec succès:', result);
            
            // Si la synchronisation est réussie, effacer les données des tables
            await db.fiche.clear();
            await db.obs.clear();
            await db.ligne.clear();
            setSyncSuccess(true);
            } catch (error) {
                console.error('Erreur lors de la synchronisation des données:', error);
            
                // error.message contient désormais les détails
                setSyncError(error.message);
            } finally {
                setSyncing(false); // Terminer l'état de synchronisation
            }
            
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
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, height: '100vh' }}>
            < Fab size="small" color="primary" aria-label="help" onClick={handleOpenDialog} style={{ position: 'fixed', bottom: 16, right: 16 }
            }>
                <HelpOutlineIcon />
            </Fab >
            {/* Dialogue pour afficher les conseils */}
            < Dialog open={openDial} onClose={handleCloseDialog} >
                <DialogTitle>Conseils d'utilisation</DialogTitle>
                <DialogContent>
                    <p>Assurez vous d'avoir du réseau ou d'etre connecté en wifi avant de synchroniser</p>
                    <p>Synchroniser les données les suppriment de votre téléphone</p>
                    <p>Mais rassurez vous, elles sont transférées sur la base de données principale</p>
                    <p>Pour revenir sur la page d'accueil, cliquer sur lannObs'go en haut à gauche</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Fermer</Button>
                </DialogActions>
            </Dialog >
            <Card sx={{ width: 300, height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <SyncIcon style={{ fontSize: 60, color: '#0e86a1' }} />
                    <Typography variant="h5" component="div">
                        Synchronisation
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Nombre d'observations à synchroniser : {obsCount}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={syncData} variant="contained" color="primary" disabled={syncing} fullWidth>
                        {syncing ? 'Synchronisation en cours...' : 'Synchroniser les données'}
                    </Button>
                </CardActions>
                {syncSuccess && <Typography variant="body2" color="green">Synchronisation réussie!</Typography>}
                {syncError && <Typography variant="body2" color="red">Erreur : {syncError}</Typography>}
            </Card>
        </div>
    );
}
