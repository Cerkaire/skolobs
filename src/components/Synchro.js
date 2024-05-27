import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import { MainContext } from '../context/MainContext';
import { db } from '../db/db';

export default function Synchro() {
    const { formData, user } = useContext(MainContext);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);

    const syncData = async () => {
        setSyncing(true);
        setSyncError(null);
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
                throw new Error('Erreur lors de la synchronisation des données');
            }

            const result = await response.json();
            console.log('Données synchronisées avec succès:', result);
        } catch (error) {
            console.error('Erreur lors de la synchronisation des données:', error);
            setSyncError(error.message);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div>
            <Button onClick={syncData} variant="contained" color="primary" disabled={syncing}>
                {syncing ? 'Synchronisation en cours...' : 'Synchroniser les données'}
            </Button>
            {syncError && <p style={{ color: 'red' }}>Erreur : {syncError}</p>}
        </div>
    );
}
