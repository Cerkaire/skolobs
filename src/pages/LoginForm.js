import React, { useContext, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { db } from '../db/db';
import { MainContext } from '../context/MainContext';
import { CardMedia, Grid } from '@mui/material';
import prefImage1 from '../icons/pref1.png';
import prefImage2 from '../icons/pref2.png';
import { useNavigate } from 'react-router-dom';


export default function LoginForm({ }) {
    const { fetchUser } = useContext(MainContext);
    const [status, setStatus] = useState('');
    const [id, setId] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        const input = event.target.value.toUpperCase(); // Convertir en majuscules
        if (input.length <= 5) { // Limiter à 5 caractères
            setId(input);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await requestUser(id);
        navigate('/parametre')
    };

    async function requestUser(id) {
        try {
            await db.user.clear();  // Effacer la base de données des utilisateurs
            setStatus('Base de données des utilisateurs vidée');
            const response = await fetch(`https://www.langazobs.langazel.asso.fr/api/v1/user?resourceid=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur réseau ou serveur');
            }

            const data = await response.json();

            // Enregistrer les données de l'utilisateur dans la base de données IndexedDB
            await db.user.add({
                nom: data.nom,
                prenom: data.prenom,
                idmembre: data.idmembre
            });

            setStatus('Données de l\'utilisateur API chargées avec succès');
            fetchUser();
        } catch (error) {
            setStatus(`Erreur lors de la mise à jour des données de l'API : ${error.message}`);
        }
    }

    async function handleAddFictitiousUser() {
        const fictitiousUser = {
            email: 'fictitious@user.com',
            password: 'hashed_password',
            firstName: 'John',
            lastName: 'Doe'
        };
        try {
            const id = await db.user.add(fictitiousUser);
            setStatus(`Utilisateur fictif ajouté avec l'ID ${id}`);
            fetchUser();
        } catch (error) {
            setStatus(`Échec de l'ajout de l'utilisateur fictif: ${error}`);
        }
    }

    async function handleClearDatabase() {
        try {
            await db.user.clear();
            setStatus('Base de données des utilisateurs vidée');
            fetchUser();
        } catch (error) {
            setStatus(`Échec du vidage de la base de données: ${error}`);
        }
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <Card sx={{ marginBottom: "10px" }}>
                    <Typography variant="h6">
                        Pour vous connecter, récupérer votre ID d'utilisateur<br />
                        Sur le site, en haut à droite, cliquez sur votre nom<br />
                        Choisisez "Vos Préférences"<br />
                        Votre identifiant unique se trouve en haut à gauche<br />
                        <img src={prefImage1} alt="preferences" />
                        <img src={prefImage2} alt="preferences" />
                    </Typography>
                </Card>
            </Grid>
            <Grid item>
                <Card sx={{ height: "450px", width: "100%", marginBottom: "20px" }}>
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <TextField
                                label="Identifiant"
                                name="Identifiant"
                                value={id}
                                onChange={handleInputChange}
                                inputProps={{ maxLength: 5 }} // Limiter à 5 caractères
                                style={{ textTransform: 'uppercase' }} // Afficher en majuscules

                            />
                        </CardContent>
                        <CardActions>
                            <Button type="submit" size="small">Valider</Button>
                            <Button onClick={handleAddFictitiousUser} size="small">Ajouter un utilisateur fictif</Button>
                            <Button onClick={handleClearDatabase} size="small">Vider la base de données</Button>
                        </CardActions>
                    </form>
                    {status && (
                        <Typography variant="body1" color="error" sx={{ marginTop: "20px" }}>
                            {status}
                        </Typography>
                    )}
                </Card>
            </Grid>
        </Grid>
    );
}
