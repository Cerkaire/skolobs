import Dexie from 'dexie';
export const db = new Dexie('formDataDB');
db.version(1).stores({
  user: '++id, observateur,nom,prenom,idobser,idm,commune,codecom,idsite,site,idcoord',
  ecoles: '++id, observateur,nom,prenom,idobser,idm,commune,codecom,idsite,site,idcoord',
  commune: '++id, codecom, commune, poly, geojson',
  geojson: '++id,communes',
  site: '++id, idsite, idcoord, codecom, site, idparent, wsite, typestation, idstatus, x, y, altitude, lat, lng, codel93, utm, utm1, codel935, codel931',
  species: '++id, cdnom, nom, nomvern, observatoire, rang',
  observatoire: '++id, titre, metakey, icon, couleur, nomvar, nom, nomdeux, latin, indice, saisie, categorie, description',
  orga: '++id, idorg, organisme',
  observateurs: '++id, idobser,observateur, nom, prenom',
  etude: '++id, idetude, etude',
  protocole: '++id, idprot, protocole',
  fiche: '++id, codecom, date, datef,datesaisie, flou, hdeb, hfin, idcoord, iddep, idetude, idfiche, idorg, idsite, lat, lng, site, newsite, syn, typedon',
  obs: '++id, cdnom, idetude, idfiche, idobs, nomvern, nom, observa, syn, idprotocole, nb, rqobs',
  ligne: '++id, idetatbio, mort, idligne, idobs, idstade, idmethode, male, femelle, ndiff, idpros, stade, syn, tdenom, idstbio, idcomp, denom, uuid, libstade',
  coord: '++id, codecom, geo, idcoord, iddep, idsite, lat, lng, site',
  comportement: '++id,idcomp, libcomp',
  methode: '++id,idmethode, methode',
  occstatutbio: '++id,idstbio, statutbio',
  occtype: '++id,tdenom, typedenom',
  prospection: '++id,idpros, prospection',
  stade: '++id,idstade, stade'
});
