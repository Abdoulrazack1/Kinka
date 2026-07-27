// client/assets/js/avis.js
// Branche le système d'avis sur la fiche produit.
//
// Les routes /api/avis (GET public, POST et DELETE authentifiés) existaient
// depuis le début et étaient complètes, mais aucun fichier du front ne les
// appelait : la fiche produit affichait un « (142 avis) » écrit en dur et le
// visiteur n'avait aucun moyen de lire ni de déposer un avis.
//
// Seuls les avis validés (avis.valide = 1) sont renvoyés par l'API : un avis
// déposé reste donc en attente de modération dans le back-office.
(function () {
    'use strict';

    function echapper(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function etoiles(note) {                                        // rendu ★★★★☆
        const n = Math.round(Number(note) || 0);
        return '<span class="avis-etoiles" aria-label="' + n + ' sur 5">' +
               '★'.repeat(n) + '<span style="opacity:.3">' + '★'.repeat(5 - n) + '</span></span>';
    }

    function auteur(a) {
        return a.nom_utilisateur || [a.prenom, a.nom].filter(Boolean).join(' ') || 'Client Kinka';
    }

    function dateCourte(v) {
        const d = new Date(v);
        return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const produitId = new URLSearchParams(window.location.search).get('id');

    // Un avis fraîchement déposé est en attente de validation : l'API publique
    // ne le renverra donc pas. On garde sa trace le temps de la visite pour
    // que son auteur voie où il en est, au lieu d'un formulaire vide.
    let avisEnAttente = null;

    async function charger() {
        const liste = document.getElementById('avis-liste');
        if (!liste || !produitId) return;

        let avis = [];
        try {
            avis = await KinkaAPI.avis.get(produitId);
        } catch (err) {
            liste.innerHTML = '<p style="opacity:.5;font-size:.88rem">Impossible de charger les avis pour le moment.</p>';
            return;
        }

        // Compteur de l'onglet et note moyenne affichée près du titre
        const compteur = document.getElementById('avis-compteur');
        if (compteur) compteur.textContent = avis.length ? '(' + avis.length + ')' : '';
        majNoteMoyenne(avis);

        liste.innerHTML = avis.length
            ? avis.map(a =>
                '<article class="avis-item">' +
                  '<div class="avis-entete">' +
                    '<strong>' + echapper(auteur(a)) + '</strong>' +
                    etoiles(a.note) +
                    '<span class="avis-date">' + dateCourte(a.created_at) + '</span>' +
                  '</div>' +
                  (a.commentaire ? '<p class="avis-texte">' + echapper(a.commentaire) + '</p>' : '') +
                '</article>').join('')
            : '<p style="opacity:.55;font-size:.88rem">Aucun avis publié pour ce titre. Soyez le premier à donner le vôtre.</p>';

        rendreFormulaire(avis);
    }

    // La note affichée sous le titre provient des avis réellement publiés,
    // et non plus d'un nombre décoratif.
    function majNoteMoyenne(avis) {
        const bloc = document.getElementById('produit-note');
        if (!bloc || !avis.length) return;
        const moyenne = avis.reduce((s, a) => s + (Number(a.note) || 0), 0) / avis.length;
        bloc.innerHTML = etoiles(moyenne) +
            '<span style="font-size:.82rem;color:var(--text-muted);margin-left:.4rem">' +
            moyenne.toFixed(1) + '/5 · ' + avis.length + ' avis</span>';
    }

    function rendreFormulaire(avis) {
        const zone = document.getElementById('avis-formulaire');
        if (!zone) return;

        const connecte = typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn();
        if (!connecte) {
            zone.innerHTML = '<p style="font-size:.88rem;opacity:.75">' +
                '<a href="./pageLogIn.html">Connectez-vous</a> pour donner votre avis sur ce titre.</p>';
            return;
        }

        // Un utilisateur déjà auteur d'un avis publié peut le retirer.
        let monAvis = null;
        try {
            const moi = JSON.parse(localStorage.getItem('kinka_current_user') || 'null');
            if (moi) monAvis = avis.find(a => a.user_id === moi.id) || null;
        } catch (e) { /* session illisible : on propose le formulaire */ }

        if (!monAvis && avisEnAttente) {                             // déposé, pas encore validé
            zone.innerHTML =
                '<div class="avis-mien">' +
                  '<p style="font-size:.88rem">Votre avis ' + etoiles(avisEnAttente.note) +
                  ' a bien été enregistré. Il sera visible sur cette page après validation par notre équipe.</p>' +
                '</div>';
            return;
        }

        if (monAvis) {
            zone.innerHTML =
                '<div class="avis-mien">' +
                  '<p style="font-size:.88rem">Votre avis est publié : ' + etoiles(monAvis.note) + '</p>' +
                  '<button class="btn-admin" id="avis-supprimer" style="margin-top:.5rem">Retirer mon avis</button>' +
                '</div>';
            document.getElementById('avis-supprimer').addEventListener('click', async function () {
                this.disabled = true;
                try {
                    await KinkaAPI.avis.delete(produitId);
                    if (typeof showToast === 'function') showToast('Votre avis a été retiré', 'success');
                    charger();
                } catch (err) {
                    if (typeof showToast === 'function') showToast(err.message || 'Suppression impossible', 'error');
                    this.disabled = false;
                }
            });
            return;
        }

        zone.innerHTML =
            '<form class="avis-form" id="avis-form">' +
              '<label class="avis-form-label">Votre note</label>' +
              '<div class="avis-notes" id="avis-notes">' +
                [1, 2, 3, 4, 5].map(n =>
                  '<label class="avis-note-choix"><input type="radio" name="note" value="' + n + '"' +
                  (n === 5 ? ' checked' : '') + '> ' + n + '★</label>').join('') +
              '</div>' +
              '<label class="avis-form-label" for="avis-commentaire">Votre commentaire</label>' +
              '<textarea id="avis-commentaire" rows="3" maxlength="1000" ' +
                'placeholder="Ce que vous avez pensé de ce tome…"></textarea>' +
              '<button type="submit" class="btn-primary avis-envoyer">Publier mon avis</button>' +
              '<p class="avis-moderation">Votre avis sera visible après validation par notre équipe.</p>' +
            '</form>';

        document.getElementById('avis-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const note = Number((this.querySelector('input[name="note"]:checked') || {}).value || 0);
            const commentaire = document.getElementById('avis-commentaire').value.trim();
            const bouton = this.querySelector('button[type="submit"]');
            bouton.disabled = true;
            try {
                avisEnAttente = await KinkaAPI.avis.create({ produit_id: produitId, note, commentaire });
                if (typeof showToast === 'function') showToast('Merci ! Votre avis sera publié après validation.', 'success');
                this.reset();
                charger();
            } catch (err) {
                if (typeof showToast === 'function') showToast(err.message || 'Envoi impossible', 'error');
            } finally {
                bouton.disabled = false;
            }
        });
    }

    function demarrer() {
        if (typeof KinkaAPI === 'undefined') { setTimeout(demarrer, 100); return; }
        charger();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
})();
