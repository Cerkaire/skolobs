import Dexie from 'dexie';
export const db = new Dexie('formDataDB');  // database is database name with 1 version 
db.version(1).stores({
  user: '++id, nom , prenom, idmembre',
  species: '++id, cdnom, nom, nomvern, observatoire, rang',
  observatoire: '++id, titre, metakey, icon, couleur, nomvar, nom, nomdeux, latin, indice, saisie, categorie, description',
  orga: '++id, idorg, organisme',
  observateurs: '++id,idobser,nom,prenom',
  etude: '++id, idetude, etude',
  protocole: '++id, idprot, protocole',
  fiche: '++id, codecom, date, datef, flou, hdeb, hfin, idcoord, iddep, idetude, idfiche, idorg, idsite, lat, lng, site, syn, typedon',
  obs: '++id, cdnom, idetude, idfiche, idobs, nomvern, nom, observa, syn, idprotocole, nb',
  ligne: '++id, idetatbio, idligne, idobs, idstade, idmethode, male, femelle, ndiff, idpros, stade, syn, tdenom, idstbio, idcomp',
  coord: '++id, codecom, geo, idcoord, iddep, idsite, lat, lng, site',
  comportement: '++id,idcomp, libcomp',
  methode: '++id,idmethode, methode',
  occstatutbio: '++id,idstbio, statutbio',
  occtype: '++id,tdenom, typedenom',
  prospection: '++id,idpros, prospection',
  stade: '++id,idstade, stade'
});
