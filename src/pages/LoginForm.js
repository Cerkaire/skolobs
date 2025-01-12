import React, { useContext, useState, useEffect } from 'react';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';


export default function LoginForm({ }) {
    const [ecoles, setEcoles] = useState([]);
    const [selectedEcole, setSelectedEcole] = useState('');
    const navigate = useNavigate();

    // Charger les écoles depuis l'API au chargement de la page

    async function fetchEcoles() {
        try {
            const response = await fetch('https://www.langazobs.langazel.asso.fr/api/v1/ecoles');
            const data = await response.json();
            const ecolesData = Object.values(data).map((item) => ({
                observateur: item.observateur,
                nom: item.nom,
                prenom: item.prenom,
                idobser: item.idobser,
                idm: item.idm,
                commune: item.commune,
                codecom: item.codecom,
                idsite: item.idsite,
                site: item.site,
                idcoord: item.idcoord,
            }));
            await db.ecoles.bulkAdd(ecolesData);
            setEcoles(ecolesData);
        } catch (error) {
            console.error('Erreur lors de la récupération des écoles:', error);
        }
    };


    // Charger les écoles au chargement de la page
    useEffect(() => {
        fetchEcoles();
    }, []);

    // Gérer la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {

            await db.table('user').clear();
            const selectedEcoleData = ecoles.find(ecole => ecole.observateur === selectedEcole);
            console.log('selectedEcole:', selectedEcoleData);
            const userData = {
                observateur: selectedEcoleData.observateur,
                nom: selectedEcoleData.nom,
                prenom: selectedEcoleData.prenom,
                idobser: selectedEcoleData.idobser,
                idm: selectedEcoleData.idm,
                commune: selectedEcoleData.commune,
                codecom: selectedEcoleData.codecom,
                idsite: selectedEcoleData.idsite,
                site: selectedEcoleData.site,
                idcoord: selectedEcoleData.idcoord,
            };

            await db.table('user').add(userData);
            navigate("/");
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des informations:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="ecole">Sélectionnez une école:</label>
            <select
                id="ecole"
                value={selectedEcole}
                onChange={(e) => setSelectedEcole(e.target.value)}
            >
                <option value="">--Choisir une école--</option>
                {ecoles.map((ecole) => (
                    <option key={ecole.id} value={ecole.observateur}>
                        {ecole.observateur}
                    </option>
                ))}
            </select>
            <button type="submit">Soumettre</button>
        </form>
    );
};

