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

    // Un avis est du texte écrit par un inconnu, réinjecté en innerHTML :
    // sans échappement, « <script> » dans un commentaire deviendrait du code
    // exécuté chez tous les lecteurs de la fiche. Les cinq caractères traités
    // sont ceux qui ont un sens en HTML.
    function echapper(s) {
        return String(s == null ? '' : s)                           // null et undefined -> chaîne vide
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // & en premier, sinon il
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');        // ré-échapperait les autres
    }

    function etoiles(note) {                                        // rendu ★★★★☆
        const n = Math.round(Number(note) || 0);                    // « 4.3 » -> 4 ; texte invalide -> 0
        // Les étoiles sont décoratives : c'est aria-label qui porte la note
        // pour un lecteur d'écran, sinon il énoncerait cinq fois « étoile ».
        return '<span class="avis-etoiles" aria-label="' + n + ' sur 5">' +
               '★'.repeat(n) + '<span style="opacity:.3">' + '★'.repeat(5 - n) + '</span></span>'; // pleines puis pâlies
    }

    // Trois sources, de la plus précise à la plus vague : le pseudo choisi,
    // le nom civil, puis un repli anonyme. Un avis sans nom d'auteur ferait
    // douter de son authenticité.
    function auteur(a) {
        return a.nom_utilisateur || [a.prenom, a.nom].filter(Boolean).join(' ') || 'Client Kinka'; // filter : évite « undefined »
    }

    function dateCourte(v) {
        const d = new Date(v);
        return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); // « 3 mars 2026 »
    }

    const produitId = new URLSearchParams(window.location.search).get('id'); // ?id=… de la fiche produit

    // Un avis fraîchement déposé est en attente de validation : l'API publique
    // ne le renverra donc pas. On garde sa trace le temps de la visite pour
    // que son auteur voie où il en est, au lieu d'un formulaire vide.
    let avisEnAttente = null;

    async function charger() {
        const liste = document.getElementById('avis-liste');
        if (!liste || !produitId) return;                           // pas sur une fiche produit : on sort

        let avis = [];
        try {
            avis = await KinkaAPI.avis.get(produitId);              // seuls les avis validés reviennent
        } catch (err) {
            // Un message plutôt qu'une zone vide : sans cela, l'échec réseau
            // et l'absence d'avis se ressemblent à l'écran.
            liste.innerHTML = '<p style="opacity:.5;font-size:.88rem">Impossible de charger les avis pour le moment.</p>';
            return;
        }

        // Compteur de l'onglet et note moyenne affichée près du titre
        const compteur = document.getElementById('avis-compteur');
        if (compteur) compteur.textContent = avis.length ? '(' + avis.length + ')' : ''; // « (0) » n'apporte rien
        majNoteMoyenne(avis);

        liste.innerHTML = avis.length
            ? avis.map(a =>                                         // un <article> par avis
                '<article class="avis-item">' +
                  '<div class="avis-entete">' +
                    '<strong>' + echapper(auteur(a)) + '</strong>' + // échappé : vient de l'utilisateur
                    etoiles(a.note) +
                    '<span class="avis-date">' + dateCourte(a.created_at) + '</span>' +
                  '</div>' +
                  (a.commentaire ? '<p class="avis-texte">' + echapper(a.commentaire) + '</p>' : '') + // note seule possible
                '</article>').join('')
            : '<p style="opacity:.55;font-size:.88rem">Aucun avis publié pour ce titre. Soyez le premier à donner le vôtre.</p>'; // invitation, pas un constat

        rendreFormulaire(avis);                                     // le formulaire dépend de ce qu'on vient de lire
    }

    // La note affichée sous le titre provient des avis réellement publiés,
    // et non plus d'un nombre décoratif.
    function majNoteMoyenne(avis) {
        const bloc = document.getElementById('produit-note');
        if (!bloc || !avis.length) return;                          // aucun avis : on laisse l'affichage en place
        const moyenne = avis.reduce((s, a) => s + (Number(a.note) || 0), 0) / avis.length; // somme / nombre
        bloc.innerHTML = etoiles(moyenne) +
            '<span style="font-size:.82rem;color:var(--text-muted);margin-left:.4rem">' +
            moyenne.toFixed(1) + '/5 · ' + avis.length + ' avis</span>';
    }

    // Quatre états possibles, dans cet ordre : visiteur, avis en attente,
    // avis déjà publié, formulaire vierge. Chacun sort par un return, donc
    // un seul est rendu — pas d'imbrication de conditions.
    function rendreFormulaire(avis) {
        const zone = document.getElementById('avis-formulaire');
        if (!zone) return;

        const connecte = typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn();
        if (!connecte) {
            // 1 · visiteur : on explique pourquoi il n'y a pas de formulaire,
            // avec le lien pour y remédier. Un formulaire qui refuserait à
            // l'envoi serait plus frustrant que pas de formulaire du tout.
            zone.innerHTML = '<p style="font-size:.88rem;opacity:.75">' +
                '<a href="./pageLogIn.html">Connectez-vous</a> pour donner votre avis sur ce titre.</p>';
            return;
        }

        // Un utilisateur déjà auteur d'un avis publié peut le retirer.
        let monAvis = null;
        try {
            const moi = JSON.parse(localStorage.getItem('kinka_current_user') || 'null');
            if (moi) monAvis = avis.find(a => a.user_id === moi.id) || null; // le mien parmi les publiés
        } catch (e) { /* session illisible : on propose le formulaire */ }

        if (!monAvis && avisEnAttente) {                             // déposé, pas encore validé
            // 2 · l'API publique ne le renvoie pas encore. Sans ce cas, la
            // personne verrait un formulaire vierge et croirait son envoi perdu.
            zone.innerHTML =
                '<div class="avis-mien">' +
                  '<p style="font-size:.88rem">Votre avis ' + etoiles(avisEnAttente.note) +
                  ' a bien été enregistré. Il sera visible sur cette page après validation par notre équipe.</p>' +
                '</div>';
            return;
        }

        if (monAvis) {
            // 3 · avis publié : un seul par personne et par produit, donc on
            // propose de le retirer plutôt que d'en déposer un second.
            zone.innerHTML =
                '<div class="avis-mien">' +
                  '<p style="font-size:.88rem">Votre avis est publié : ' + etoiles(monAvis.note) + '</p>' +
                  '<button class="btn-admin" id="avis-supprimer" style="margin-top:.5rem">Retirer mon avis</button>' +
                '</div>';
            document.getElementById('avis-supprimer').addEventListener('click', async function () {
                this.disabled = true;                                // évite le double clic pendant l'appel
                try {
                    await KinkaAPI.avis.delete(produitId);
                    if (typeof showToast === 'function') showToast('Votre avis a été retiré', 'success');
                    charger();                                       // recharge : compteur et moyenne suivent
                } catch (err) {
                    if (typeof showToast === 'function') showToast(err.message || 'Suppression impossible', 'error');
                    this.disabled = false;                           // échec : on rend la main
                }
            });
            return;
        }

        // 4 · le formulaire. Chaque note est un <input type="radio"> enveloppé
        // dans son <label> : le libellé est donc cliquable et l'étiquette est
        // liée au champ sans avoir à inventer un id par étoile.
        zone.innerHTML =
            '<form class="avis-form" id="avis-form">' +
              '<label class="avis-form-label">Votre note</label>' +
              '<div class="avis-notes" id="avis-notes">' +
                [1, 2, 3, 4, 5].map(n =>                             // cinq boutons radio, même name
                  '<label class="avis-note-choix"><input type="radio" name="note" value="' + n + '"' +
                  (n === 5 ? ' checked' : '') + '> ' + n + '★</label>').join('') + // 5 coché par défaut
              '</div>' +
              '<label class="avis-form-label" for="avis-commentaire">Votre commentaire</label>' + // for= : étiquette liée
              '<textarea id="avis-commentaire" rows="3" maxlength="1000" ' + // borne aussi vérifiée côté serveur
                'placeholder="Ce que vous avez pensé de ce tome…"></textarea>' +
              '<button type="submit" class="btn-primary avis-envoyer">Publier mon avis</button>' +
              '<p class="avis-moderation">Votre avis sera visible après validation par notre équipe.</p>' + // annoncé avant l'envoi
            '</form>';

        document.getElementById('avis-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const note = Number((this.querySelector('input[name="note"]:checked') || {}).value || 0);
            const commentaire = document.getElementById('avis-commentaire').value.trim();
            const bouton = this.querySelector('button[type="submit"]');
            bouton.disabled = true;
            try {
                avisEnAttente = await KinkaAPI.avis.create({ produit_id: produitId, note, commentaire }); // mémorisé pour l'état 2
                if (typeof showToast === 'function') showToast('Merci ! Votre avis sera publié après validation.', 'success');
                this.reset();                                        // vide le formulaire
                charger();                                           // rerend : passe à l'état « en attente »
            } catch (err) {
                if (typeof showToast === 'function') showToast(err.message || 'Envoi impossible', 'error'); // message du serveur si présent
            } finally {
                bouton.disabled = false;                             // finally : rendu dans les deux cas
            }
        });
    }

    // L'ordre de chargement des scripts n'est pas garanti : si la façade API
    // n'est pas encore là, on repasse dans 100 ms plutôt que d'échouer.
    function demarrer() {
        if (typeof KinkaAPI === 'undefined') { setTimeout(demarrer, 100); return; }
        charger();
    }

    // Le script peut être chargé avant ou après le DOM selon la page : on
    // couvre les deux cas plutôt que de dépendre de la position du <script>.
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
})();
