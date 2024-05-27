import React, { createContext, useState, useEffect } from 'react';
import { db } from '../db/db';

export const MainContext = createContext();

export const MainProvider = ({ children }) => {
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [clickedPosition, setClickedPosition] = useState(null);
    const [formData, setFormData] = useState({
        fiche: {
            lat: "",
            long: "",
            date: "",
            date2: "",
            organisme: 1,
            etude: 0,
            typeDonnee: 'Pu',
            diffusion: 'Point'
        },
        especes: {}
    });
    const [phase, setPhase] = useState('map');
    const [user, setUser] = useState(null);
    const [obsCount, setObsCount] = useState(0);

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
                date2: getTodayDate()
            }
        }));
    }, []);

    // pour pouvoir réinitiliser les données
    const initialFormData = {
        fiche: {
            lat: "",
            long: "",
            date: getTodayDate(),
            date2: getTodayDate(),
            organisme: '',
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
                date2: getTodayDate()
            }
        });
    };

    //Mettre à jour le user
    useEffect(() => {
        console.log('date', formData)
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
    };

    // Fonction pour mettre à jour `selectedSpecies`
    const updateSelectedSpecies = (species) => {
        setSelectedSpecies(species);
        console.log('selectedSpecies', selectedSpecies)
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
    const addOrUpdateStade = async (cdnom, stade, stadeData) => {
        const libstade = await fetchLibelleStade(stade);
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData };

            if (!updatedFormData.especes[cdnom]) {
                updatedFormData.especes[cdnom] = {
                    nom: stadeData.nom,
                    cdnom: stadeData.cdnom,
                    nomvern: stadeData.nomvern,
                    observatoire: stadeData.observatoire,
                    protocole: stadeData.protocole,
                    stades: {}
                };
            }

            updatedFormData.especes[cdnom].stades[stade] = {
                ...stadeData,
                libstade: libstade || ''
            };

            console.log('formData', formData);
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

    //Enregistrement des données
    const saveFormData = async (formData) => {
        try {
            if (!formData || !formData.fiche) {
                throw new Error("formData ou formData.fiche est indéfini");
            }

            const ficheId = await db.fiche.add({
                codecom: formData.fiche.codecom || '',
                date: formData.fiche.date,
                datef: formData.fiche.date2,
                flou: formData.fiche.flou || 0,
                hdeb: formData.fiche.hdeb || '',
                hfin: formData.fiche.hfin || '',
                idcoord: formData.fiche.idcoord || 0,
                iddep: formData.fiche.iddep || 0,
                idetude: formData.fiche.etude || 0,
                idfiche: formData.fiche.idfiche || 0,
                idorg: formData.fiche.organisme || 0,
                idsite: formData.fiche.idsite || 0,
                lat: formData.fiche.lat,
                lng: formData.fiche.long,
                site: formData.fiche.site || '',
                syn: formData.fiche.syn || 0,
                typedon: formData.fiche.typeDonnee
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
                    nb: espece.nb,
                });

                for (const stadeId in espece.stades) {
                    const stade = espece.stades[stadeId];

                    await db.ligne.add({
                        idetatbio: stade.trouveMort || 0,
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
                        tdenom: stade.denom || 'Co',
                        idstbio: stade.statutbio || 0,
                        idcomp: stade.comportement || 0
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

    const checkDbData = async () => {
        try {
            const tables = [
                'protocole',
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


    return (
        <MainContext.Provider value={{
            checkDbData,
            selectedSpecies,
            formData,
            setSelectedSpecies: updateSelectedSpecies,
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
            setObsCount

        }}>
            {children}
        </MainContext.Provider>
    );
};
