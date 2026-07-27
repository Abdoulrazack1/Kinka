// client/assets/js/annonces.js
// Parcours des annonces entre membres et gestion de ses propres annonces.
//
// L'API exposait déjà getAll / mesAnnonces / getOne / create / update / delete,
// mais seule `create` était appelée par le site : une annonce publiée devenait
// aussitôt invisible et ingérable pour son auteur. Cette page rend la
// fonctionnalité utilisable de bout en bout.
(function () {
    'use strict';

    function echapper(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function euros(v) {
        const n = Number(v);
        return isNaN(n) ? '—' : n.toFixed(2).replace('.', ',') + ' €';
    }

    function dateCourte(v) {
        const d = new Date(v);
        return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function vendeur(a) {
        return a.nom_utilisateur || [a.prenom, a.nom].filter(Boolean).join(' ') || 'Membre Kinka';
    }

    const IMAGE_DEFAUT = '../assets/images/LogoProjetFilRouge.png';

    function carte(a, options) {
        const mienne = options && options.mienne;
        const image = a.image ? echapper(a.image) : IMAGE_DEFAUT;
        const statut = a.statut === 'active'
            ? ''
            : '<span class="annonce-statut annonce-statut-' + echapper(a.statut) + '">' + echapper(a.statut) + '</span>';

        return '<article class="annonce-carte" data-id="' + a.id + '">' +
            '<div class="annonce-image">' +
                '<img src="' + image + '" alt="' + echapper(a.titre) + '" loading="lazy" ' +
                'onerror="this.src=\'' + IMAGE_DEFAUT + '\'">' +
                statut +
            '</div>' +
            '<div class="annonce-corps">' +
                '<h3>' + echapper(a.titre) + '</h3>' +
                (a.serie ? '<p class="annonce-serie">' + echapper(a.serie) +
                    (a.tome ? ' — tome ' + echapper(a.tome) : '') + '</p>' : '') +
                '<p class="annonce-description">' + echapper((a.description || '').slice(0, 140)) + '</p>' +
                '<div class="annonce-pied">' +
                    '<span class="annonce-prix">' + euros(a.prix) + '</span>' +
                    '<span class="annonce-etat">' + echapper(a.etat || '') + '</span>' +
                '</div>' +
                (mienne
                    ? '<div class="annonce-actions">' +
                        '<button class="btn-annonce" data-modifier="' + a.id + '">Modifier</button>' +
                        (a.statut === 'vendue'
                            ? '<button class="btn-annonce" data-remettre="' + a.id + '">Remettre en vente</button>'
                            : '<button class="btn-annonce" data-vendue="' + a.id + '">Marquer vendue</button>') +
                        '<button class="btn-annonce btn-annonce-danger" data-supprimer="' + a.id + '">Supprimer</button>' +
                      '</div>'
                    : '<p class="annonce-vendeur">Vendu par <strong>' + echapper(vendeur(a)) + '</strong>' +
                      '<span class="annonce-date"> · ' + dateCourte(a.created_at) + '</span></p>') +
            '</div>' +
        '</article>';
    }

    // ─── Onglet « Toutes les annonces » ─────────────────────────

    async function chargerPubliques() {
        const grille = document.getElementById('annonces-grille');
        if (!grille) return;
        grille.innerHTML = '<p class="annonces-info">Chargement…</p>';

        const filtres = {
            serie: (document.getElementById('annonces-recherche') || {}).value || '',
            etat:  (document.getElementById('annonces-etat') || {}).value || ''
        };
        try {
            const liste = await KinkaAPI.annonces.getAll(filtres);
            document.getElementById('annonces-total').textContent =
                liste.length + ' annonce' + (liste.length > 1 ? 's' : '') + ' en ligne';
            grille.innerHTML = liste.length
                ? liste.map(a => carte(a, { mienne: false })).join('')
                : '<p class="annonces-info">Aucune annonce ne correspond à votre recherche.</p>';
        } catch (err) {
            grille.innerHTML = '<p class="annonces-info">Impossible de charger les annonces pour le moment.</p>';
        }
    }

    // ─── Onglet « Mes annonces » ────────────────────────────────

    async function chargerMiennes() {
        const grille = document.getElementById('mes-annonces-grille');
        if (!grille) return;

        if (typeof KinkaAuth === 'undefined' || !KinkaAuth.isLoggedIn()) {
            grille.innerHTML = '<p class="annonces-info">' +
                '<a href="./pageLogIn.html">Connectez-vous</a> pour retrouver et gérer vos annonces.</p>';
            return;
        }

        grille.innerHTML = '<p class="annonces-info">Chargement…</p>';
        try {
            const liste = await KinkaAPI.annonces.mesAnnonces();
            grille.innerHTML = liste.length
                ? liste.map(a => carte(a, { mienne: true })).join('')
                : '<p class="annonces-info">Vous n’avez encore publié aucune annonce. ' +
                  '<a href="./page_creation_annonce.html">Déposer une annonce</a>.</p>';
            brancherActions(liste);
        } catch (err) {
            grille.innerHTML = '<p class="annonces-info">Impossible de charger vos annonces.</p>';
        }
    }

    function brancherActions(liste) {
        document.querySelectorAll('#mes-annonces-grille [data-supprimer]').forEach(b =>
            b.addEventListener('click', () => supprimer(b.dataset.supprimer)));
        document.querySelectorAll('#mes-annonces-grille [data-vendue]').forEach(b =>
            b.addEventListener('click', () => changerStatut(b.dataset.vendue, 'vendue')));
        document.querySelectorAll('#mes-annonces-grille [data-remettre]').forEach(b =>
            b.addEventListener('click', () => changerStatut(b.dataset.remettre, 'active')));
        document.querySelectorAll('#mes-annonces-grille [data-modifier]').forEach(b =>
            b.addEventListener('click', () => ouvrirEdition(liste.find(a => String(a.id) === b.dataset.modifier))));
    }

    async function changerStatut(id, statut) {
        try {
            await KinkaAPI.annonces.update(id, { statut });
            if (typeof showToast === 'function') showToast('Annonce mise à jour', 'success');
            chargerMiennes();
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message || 'Mise à jour impossible', 'error');
        }
    }

    async function supprimer(id) {
        if (!confirm('Supprimer définitivement cette annonce ?')) return;
        try {
            await KinkaAPI.annonces.delete(id);
            if (typeof showToast === 'function') showToast('Annonce supprimée', 'success');
            chargerMiennes();
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message || 'Suppression impossible', 'error');
        }
    }

    // ─── Édition ────────────────────────────────────────────────

    function ouvrirEdition(annonce) {
        if (!annonce) return;
        const boite = document.getElementById('annonce-modale');
        document.getElementById('edit-titre').value       = annonce.titre || '';
        document.getElementById('edit-serie').value       = annonce.serie || '';
        document.getElementById('edit-tome').value        = annonce.tome || '';
        document.getElementById('edit-prix').value        = annonce.prix || '';
        document.getElementById('edit-etat').value        = annonce.etat || 'bon';
        document.getElementById('edit-description').value = annonce.description || '';
        boite.dataset.id = annonce.id;
        boite.hidden = false;
    }

    async function enregistrerEdition() {
        const boite  = document.getElementById('annonce-modale');
        const bouton = document.getElementById('edit-enregistrer');
        const corps = {
            titre:       document.getElementById('edit-titre').value.trim(),
            serie:       document.getElementById('edit-serie').value.trim(),
            tome:        document.getElementById('edit-tome').value,
            prix:        document.getElementById('edit-prix').value,
            etat:        document.getElementById('edit-etat').value,
            description: document.getElementById('edit-description').value.trim()
        };
        if (!corps.titre)          { if (typeof showToast === 'function') showToast('Le titre est requis.', 'error'); return; }
        if (!(Number(corps.prix) > 0)) { if (typeof showToast === 'function') showToast('Le prix doit être supérieur à 0.', 'error'); return; }

        bouton.disabled = true;
        try {
            await KinkaAPI.annonces.update(boite.dataset.id, corps);
            boite.hidden = true;
            if (typeof showToast === 'function') showToast('Annonce modifiée', 'success');
            chargerMiennes();
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message || 'Enregistrement impossible', 'error');
        } finally {
            bouton.disabled = false;
        }
    }

    // ─── Onglets et démarrage ───────────────────────────────────

    function afficherOnglet(nom) {
        document.querySelectorAll('.annonces-onglet').forEach(b =>
            b.classList.toggle('actif', b.dataset.onglet === nom));
        document.querySelectorAll('.annonces-panneau').forEach(p =>
            p.classList.toggle('actif', p.id === 'panneau-' + nom));
        if (nom === 'toutes') chargerPubliques();
        else chargerMiennes();
    }

    function demarrer() {
        if (typeof KinkaAPI === 'undefined') { setTimeout(demarrer, 100); return; }
        if (!document.getElementById('annonces-grille')) return;    // pas sur cette page

        document.querySelectorAll('.annonces-onglet').forEach(b =>
            b.addEventListener('click', () => afficherOnglet(b.dataset.onglet)));

        let minuteur;
        const rech = document.getElementById('annonces-recherche');
        if (rech) rech.addEventListener('input', () => {
            clearTimeout(minuteur);
            minuteur = setTimeout(chargerPubliques, 350);
        });
        const etat = document.getElementById('annonces-etat');
        if (etat) etat.addEventListener('change', chargerPubliques);

        document.getElementById('edit-enregistrer').addEventListener('click', enregistrerEdition);
        document.getElementById('edit-annuler').addEventListener('click', () => {
            document.getElementById('annonce-modale').hidden = true;
        });

        afficherOnglet(location.hash === '#mes-annonces' ? 'mes-annonces' : 'toutes');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
})();
