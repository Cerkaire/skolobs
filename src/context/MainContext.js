import React, { createContext, useState, useEffect } from 'react';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export const MainContext = createContext();

export const MainProvider = ({ children }) => {

    const [selectedSite, setSelectedSite] = useState(null);
    const [newSite, setNewsite] = useState(null);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [selectedStade, setSelectedStade] = useState(null);
    const [stadeEdit, setStadeEdit] = useState(null);
    const [clickedPosition, setClickedPosition] = useState(null);
    const [formData, setFormData] = useState({
        fiche: {
            lat: "",
            long: "",
            site: "",
            idsite: "",
            idcoord: "",
            newsite: "",
            date: "",
            date2: "",
            organisme: 2,
            etude: 0,
            typeDonnee: 'Pu',
            diffusion: 'Point'
        },
        especes: {}
    });
    const [phase, setPhase] = useState('fiche');
    const [user, setUser] = useState(null);
    const [obsCount, setObsCount] = useState(0);
    const navigate = useNavigate();
    // Fonction pour obtenir la date du jour au format 'YYYY-MM-DD'
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];

    };

    // Initialisation des dates avec la date du jour
    useEffect(() => {
        setFormData(prevData => ({
            ...prevData,
            fiche: {
                ...prevData.fiche,
                date: getTodayDate(),
                date2: ''
            }
        }));
    }, []);

    // pour pouvoir réinitiliser les données
    const initialFormData = {
        fiche: {
            lat: "",
            long: "",
            site: "",
            idsite: "",
            idcoord: "",
            newsite: "",
            date: getTodayDate(),
            date2: '',
            organisme: '2',
            etude: 0,
            typeDonnee: 'Pu',
            diffusion: 'Point'
        },
        especes: {}
    };

    // Réinitialiser les données avec les dates du jour
    const resetFormData = () => {
        setFormData({
            ...initialFormData,
            fiche: {
                ...initialFormData.fiche,
                date: getTodayDate(),
                date2: '',
                organisme: '2',
            }
        });
    };

    //Mettre à jour le user
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const users = await db.user.toArray();
            if (users.length > 0) {
                setUser(users[0]); // Supposons qu'il y a un seul utilisateur
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user from the database", error);
        }
    };


    // Fonction pour mettre à jour la phase
    const updatePhase = (newPhase) => {
        setPhase(newPhase);
        // On recompte le nombre d'obs dans la base
        const fetchObsCount = async () => {
            try {
                const count = await db.obs.count();
                setObsCount(count);
            } catch (error) {
                console.error('Erreur lors de la récupération du nombre de lignes dans obs:', error);
            }
        };

        fetchObsCount();
    };

    // Fonction pour mettre à jour `selectedSpecies`
    const updateSelectedSpecies = (species) => {
        setSelectedSpecies(species);
    };

    // Fonction pour mettre à jour `formData`
    const updateFormData = (newData) => {
        setFormData((prevData) => {
            const newFicheData = newData.fiche || {};
            const updatedFiche = {
                ...prevData.fiche,
                ...newFicheData
            };

            const updatedData = {
                ...prevData,
                fiche: updatedFiche
            };

            return updatedData;

        });
    };

    // Fonction pour ajouter ou mettre à jour une espèce dans `formData`
    const addOrUpdateSpecies = async (cdnom, observationData) => {
        const libstade = await fetchLibelleStade(observationData.stade);
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData };

            if (!updatedFormData.especes[cdnom]) {
                updatedFormData.especes[cdnom] = {
                    nom: observationData.nom,
                    cdnom: observationData.cdnom,
                    nomvern: observationData.nomvern,
                    observatoire: observationData.observatoire,
                    etude: parseInt(observationData.etude),
                    protocole: parseInt(observationData.protocole),
                    rqobs: observationData.rqobs,
                    nb: parseInt(observationData.maleCount + observationData.femaleCount + observationData.undeterminedCount),
                    stades: {}
                };
            }

            updatedFormData.especes[cdnom].stades[observationData.stade] = {
                trouveMort: parseInt(observationData.trouveMort),
                mort: parseInt(observationData.mort),
                maleCount: observationData.maleCount,
                femaleCount: observationData.femaleCount,
                undeterminedCount: observationData.undeterminedCount,
                tdenom: observationData.tdenom,
                denom: observationData.denom,
                methode: parseInt(observationData.methode),
                protocole: parseInt(observationData.protocole),
                statutbio: parseInt(observationData.statutbio),
                comportement: parseInt(observationData.comportement),
                collecte: parseInt(observationData.collecte),
                stade: parseInt(observationData.stade),
                libstade: libstade || ''
            };

            console.log('formData', formData)
            return updatedFormData;
        });
    };

    // Fonction pour ajouter ou mettre à jour un stade pour une espèce
    const addOrUpdateStade = async (cdnom, currentStade, stadeData) => {
        const libstade = await fetchLibelleStade(stadeData.stade);
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData };

            if (!updatedFormData.especes[cdnom]) {
                updatedFormData.especes[cdnom] = {
                    nom: stadeData.nom,
                    cdnom: stadeData.cdnom,
                    nomvern: stadeData.nomvern,
                    observatoire: stadeData.observatoire,
                    protocole: stadeData.protocole,
                    etude: stadeData.etude,
                    rqobs: stadeData.rqobs,
                    nb: parseInt(stadeData.maleCount + stadeData.femaleCount + stadeData.undeterminedCount),
                    stades: {}
                };
            }
            // Mettre à jour rqobs au niveau de l'espèce
            updatedFormData.especes[cdnom].rqobs = stadeData.rqobs;
            // Mettre à jour ou ajouter le nouveau stade
            updatedFormData.especes[cdnom].stades[stadeData.stade] = {
                ...stadeData,
                libstade: libstade || ''
            };


            // Supprimer l'ancien stade si la valeur du stade a changé
            if (currentStade !== stadeData.stade) {
                delete updatedFormData.especes[cdnom].stades[currentStade];
            }

            console.log('formData', updatedFormData);
            return updatedFormData;
        });
    };

    const fetchLibelleStade = async (stadeValue) => {
        try {
            const stadeId = Number(stadeValue);
            const stadeRecord = await db.stade.where('idstade').equals(stadeId).first();
            return stadeRecord ? stadeRecord.stade : null;
        } catch (error) {
            console.error(`Erreur lors de la récupération du libellé du stade pour la valeur ${stadeValue}:`, error);
            return null;
        }
    };

    // Fonction pour supprimer une espèce dans `formData`
    const deleteSpecies = (cdnom) => {
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData };
            delete updatedFormData.especes[cdnom];
            return updatedFormData;
        });
    };

    // Fonction pour supprimer un stade pour une espèce
    const deleteStade = (cdnom, stade) => {
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData };
            if (updatedFormData.especes[cdnom] && updatedFormData.especes[cdnom].stades) {
                delete updatedFormData.especes[cdnom].stades[stade];
            }
            return updatedFormData;
        });
    };

    // Fonction pour éditer un stade pour une espèce
    const updateSelectedStade = (stadeData) => {
        setSelectedStade(stadeData);
        console.log('setSelectedStade-MainContext', selectedStade)
    };

    //Enregistrement des données
    const saveFormData = async (formData) => {
        try {
            if (!formData || !formData.fiche) {
                throw new Error("formData ou formData.fiche est indéfini");
            }
            if (formData.fiche.date2 == "") {
                formData.fiche.date2 = formData.fiche.date;
            }

            const ficheId = await db.fiche.add({
                codecom: formData.fiche.codecom || '',
                date: formData.fiche.date,
                datef: formData.fiche.date2,
                newsite: formData.fiche.newsite || false,
                flou: formData.fiche.flou || 0,
                hdeb: formData.fiche.hdeb || '',
                hfin: formData.fiche.hfin || '',
                idcoord: formData.fiche.idcoord || 0,
                iddep: formData.fiche.iddep || 0,
                idetude: formData.fiche.etude || 0,
                idfiche: formData.fiche.idfiche || 0,
                idorg: formData.fiche.organisme || 0,
                idsite: formData.fiche.idsite || null,
                idcoord: formData.fiche.idcoord || null,
                lat: formData.fiche.lat,
                lng: formData.fiche.long,
                site: formData.fiche.site || '',
                syn: formData.fiche.syn || 0,
                typedon: formData.fiche.typeDonnee,
                datesaisie: getTodayDate(),
            });

            if (!formData.especes) {
                throw new Error("formData.especes est indéfini");
            }

            for (const cdnom in formData.especes) {
                const espece = formData.especes[cdnom];

                const obsId = await db.obs.add({
                    cdnom: cdnom,
                    idetude: formData.fiche.etude || 0,
                    idfiche: ficheId,
                    nomvern: espece.nomvern,
                    nom: espece.nom,
                    observa: espece.observatoire,
                    syn: espece.syn || 0,
                    idprotocole: espece.protocole,
                    rqobs: espece.rqobs,
                    nb: espece.nb,
                });

                for (const stadeId in espece.stades) {
                    const stade = espece.stades[stadeId];

                    await db.ligne.add({
                        idetatbio: stade.trouveMort === 1 ? 3 : 2,
                        idligne: stade.idligne || 0,
                        idobs: obsId,
                        idstade: stade.stade || 0,
                        idmethode: stade.methode || 0,
                        male: stade.maleCount,
                        femelle: stade.femaleCount,
                        ndiff: stade.undeterminedCount,
                        idpros: stade.collecte || 0,
                        stade: stade.stade || 0,
                        syn: stade.syn || 0,
                        tdenom: stade.tdenom || 'IND',
                        denom: stade.denom || 'Co',
                        idstbio: stade.statutbio || 0,
                        idcomp: stade.comportement || 0,
                        uuid: uuidv4(),
                        libstade: stade.libstade,
                        mort: stade.mort,
                    });
                }
            }

            console.log('Les données ont été enregistrées avec succès.')
            setFormData(initialFormData);
            // On recompte le nombre d'obs dans la base
            const fetchObsCount = async () => {
                try {
                    const count = await db.obs.count();
                    setObsCount(count);
                } catch (error) {
                    console.error('Erreur lors de la récupération du nombre de lignes dans obs:', error);
                }
            };

            fetchObsCount();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des données:', error);
        }
    };

    //Vérifie que les table dexie sont bien remplies
    const checkDbData = async () => {
        try {
            const tables = [
                'protocole',
                'site',
                'commune',
                'orga',
                'etude',
                'comportement',
                'methode',
                'occstatutbio',
                'occtype',
                'prospection',
                'stade',
                'observatoire',
                'species'
            ];

            const checks = await Promise.all(tables.map(async (table) => {
                const count = await db[table].count();
                return count > 0;
            }));

            return checks.every(Boolean) ? 'Oui' : 'Non';
        } catch (error) {
            console.error('Erreur lors de la vérification des tables:', error);
            return 'Non';
        }
    };

    //formatage de formdata avc les données en base pour editer la fiche
    const fetchFicheDataById = async (idfiche) => {
        try {
            // Récupérer la fiche spécifique depuis Dexie
            const fiche = await db.fiche.get(idfiche);

            if (!fiche) {
                throw new Error(`Fiche with idfiche ${idfiche} not found.`);
            }
            console.log('fiche', fiche)
            // Récupérer les observations liées à cette fiche
            const obs = await db.obs.where('idfiche').equals(fiche.id).toArray();
            console.log('Observations:', obs);

            // Préparer un objet pour les espèces dans formData
            const especes = {};

            // Récupérer les lignes liées à chaque observation
            const lignesPromises = obs.map(async (observation) => {
                const lignes = await db.ligne.where('idobs').equals(observation.id).toArray();

                console.log('lignes', lignes)
                // Préparer un objet pour les stades dans chaque espèce
                const stades = {};

                lignes.forEach((ligne) => {
                    stades[ligne.stade] = {
                        trouveMort: ligne.idetatbio,
                        mort: ligne.mort,
                        maleCount: ligne.male || 0,
                        femaleCount: ligne.femelle || 0,
                        undeterminedCount: ligne.ndiff || 0,
                        tdenom: ligne.tdenom,
                        denom: ligne.denom,
                        methode: ligne.idmethode,
                        protocole: ligne.idpros,
                        statutbio: ligne.idstbio,
                        comportement: ligne.idcomp,
                        collecte: ligne.idpros,
                        stade: ligne.stade,
                        libstade: ligne.libstade
                    };
                });
                console.log('Stades for observation:', observation.cdnom, stades);
                // Ajouter l'espèce à l'objet especes
                especes[observation.cdnom] = {
                    nom: observation.nom,
                    cdnom: observation.cdnom,
                    nomvern: observation.nomvern,
                    observatoire: observation.observa,
                    etude: observation.idetude,
                    protocole: observation.idprotocole,
                    rqobs: observation.rqobs,
                    nb: observation.nb,
                    stades: stades
                };
            });

            // Attendre la résolution de toutes les promesses dans lignesPromises
            await Promise.all(lignesPromises);
            console.log('especes', especes)
            // Construire l'objet formData avec les données récupérées
            const newFormData = {
                fiche: {
                    lat: fiche.lat,
                    long: fiche.lng,
                    date: fiche.date,
                    date2: fiche.datef,
                    organisme: fiche.idorg,
                    etude: fiche.idetude,
                    typeDonnee: fiche.typedon,
                    diffusion: fiche.syn,
                },
                especes: especes
            };


            setFormData(newFormData);
            console.log('New FormData:', newFormData);

            // Supprimer les lignes, les observations et la fiche pour éviter les doublons
            const deletePromises = obs.map(async (observation) => {
                await db.ligne.where('idobs').equals(observation.id).delete();
                await db.obs.delete(observation.id);
            });

            await Promise.all(deletePromises);
            await db.fiche.delete(idfiche);

            setPhase('synthese');
            navigate('/saisi');
        } catch (error) {
            console.error('Error fetching fiche data:', error);
        }
    };


    return (
        <MainContext.Provider value={{
            checkDbData,
            selectedSpecies,
            selectedStade,
            formData,
            setSelectedSpecies: updateSelectedSpecies,
            setSelectedStade: updateSelectedStade,
            setFormData: updateFormData,
            addOrUpdateSpecies,
            phase,
            setPhase: updatePhase,
            updateFormData,
            setClickedPosition,
            clickedPosition,
            addOrUpdateStade,
            deleteSpecies,
            deleteStade,
            saveFormData,
            user,
            fetchUser,
            obsCount,
            setObsCount,
            fetchFicheDataById,
            setSelectedSite,
            selectedSite,
            newSite,
            setNewsite

        }}>
            {children}
        </MainContext.Provider>
    );
};
