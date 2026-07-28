// client/assets/js/admin.js
// Logique du back-office. Consomme exclusivement /api/admin/*, dont chaque
// route est protégée côté serveur par authRequired + adminRequired : la garde
// ci-dessous n'est qu'un confort d'affichage, jamais une mesure de sécurité.
(function () {
    'use strict';

    // ─── Utilitaires ────────────────────────────────────────────

    const $  = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    function echapper(s) {                                          // échappe le HTML
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function dateCourte(v) {                                        // « 27/07/2026 09:14 »
        if (!v) return '—';
        const d = new Date(v);
        if (isNaN(d)) return '—';
        return d.toLocaleDateString('fr-FR') + ' ' +
               d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function euros(v) {
        const n = Number(v);
        return isNaN(n) ? '—' : n.toFixed(2) + ' €';
    }

    function notifier(message, type) {                              // repli si showToast absent
        if (typeof showToast === 'function') return showToast(message, type || 'info');
        console.log('[admin] ' + message);
    }

    // Appel API authentifié. Le client partagé (kinkaFetch) ajoute déjà le
    // Bearer et déballe `data`.
    const api = {
        get:    (chemin)         => KinkaAPI._fetch(chemin),
        post:   (chemin, corps)  => KinkaAPI._fetch(chemin, { method: 'POST',   body: JSON.stringify(corps) }),
        put:    (chemin, corps)  => KinkaAPI._fetch(chemin, { method: 'PUT',    body: JSON.stringify(corps) }),
        patch:  (chemin, corps)  => KinkaAPI._fetch(chemin, { method: 'PATCH',  body: JSON.stringify(corps) }),
        delete: (chemin)         => KinkaAPI._fetch(chemin, { method: 'DELETE' })
    };

    function requete(chemin, params) {                              // construit une query string propre
        const q = Object.entries(params || {})
            .filter(([, v]) => v !== '' && v !== null && v !== undefined)
            .map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
        return chemin + (q ? '?' + q : '');
    }

    function ligneVide(colonnes, message) {
        return '<tr><td colspan="' + colonnes + '" class="admin-vide">' + echapper(message) + '</td></tr>';
    }

    // ─── Modale ─────────────────────────────────────────────────

    const modale = {
        ouvrir(titre, corpsHtml, boutons) {
            $('#modale-titre').textContent = titre;
            $('#modale-corps').innerHTML = corpsHtml;
            const pied = $('#modale-pied');
            pied.innerHTML = '';
            (boutons || []).forEach(b => {
                const btn = document.createElement('button');
                btn.className = 'btn-admin' + (b.classe ? ' ' + b.classe : '');
                btn.textContent = b.libelle;
                btn.addEventListener('click', () => b.action(btn));
                pied.appendChild(btn);
            });
            $('#admin-modale').hidden = false;
        },
        fermer() { $('#admin-modale').hidden = true; }
    };

    // ─── Pagination ─────────────────────────────────────────────

    const etat = {};                                                // offset courant par section

    function rendrePagination(cle, conteneurId, total, limite, recharger) {
        const conteneur = $('#' + conteneurId);
        if (!conteneur) return;
        const offset = etat[cle] || 0;
        const debut  = total === 0 ? 0 : offset + 1;
        const fin    = Math.min(offset + limite, total);
        conteneur.innerHTML =
            '<span>' + debut + '–' + fin + ' sur ' + total + '</span>' +
            '<span class="admin-pagination-boutons">' +
              '<button class="btn-admin" data-pg="prec"' + (offset <= 0 ? ' disabled' : '') + '>Précédent</button>' +
              '<button class="btn-admin" data-pg="suiv"' + (fin >= total ? ' disabled' : '') + '>Suivant</button>' +
            '</span>';
        conteneur.querySelectorAll('[data-pg]').forEach(b => {
            b.addEventListener('click', () => {
                etat[cle] = b.dataset.pg === 'suiv'
                    ? offset + limite
                    : Math.max(offset - limite, 0);
                recharger();
            });
        });
    }

    // Relance une recherche après une courte pause (évite un appel par frappe)
    function differer(fn, delai) {
        let minuteur;
        return function () {
            clearTimeout(minuteur);
            minuteur = setTimeout(fn, delai || 350);
        };
    }

    const LIMITE = 25;

    // ─── Tableau de bord ────────────────────────────────────────

    const LIBELLES_STATS = {
        produits: 'Produits au catalogue',
        produits_rupture: 'En rupture de stock',
        produits_stock_faible: 'Stock faible (≤ 3)',
        utilisateurs: 'Comptes clients',
        administrateurs: 'Administrateurs',
        commandes: 'Commandes',
        commandes_en_cours: 'Commandes en cours',
        chiffre_affaires: "Chiffre d'affaires",
        avis_a_moderer: 'Avis à modérer',
        annonces: 'Annonces',
        messages_non_traites: 'Messages non traités',
        inscrits_newsletter: 'Inscrits newsletter'
    };

    async function chargerTableauBord() {
        const d = await api.get('/admin/stats');
        const c = d.chiffres;

        $('#admin-stats').innerHTML = Object.keys(LIBELLES_STATS).map(cle => {
            let valeur = c[cle];
            if (cle === 'chiffre_affaires') valeur = euros(valeur);
            else valeur = Number(valeur || 0).toLocaleString('fr-FR');
            let classe = '';
            if (cle === 'produits_rupture' && c[cle] > 0) classe = ' alerte';
            if ((cle === 'avis_a_moderer' || cle === 'messages_non_traites') && c[cle] > 0) classe = ' attention';
            return '<div class="admin-stat' + classe + '">' +
                   '<div class="admin-stat-valeur">' + valeur + '</div>' +
                   '<div class="admin-stat-libelle">' + LIBELLES_STATS[cle] + '</div></div>';
        }).join('');

        $('#tbody-recentes').innerHTML = d.commandesRecentes.length
            ? d.commandesRecentes.map(cmd =>
                '<tr><td><strong>' + echapper(cmd.id) + '</strong></td>' +
                '<td>' + echapper(cmd.email || '—') + '</td>' +
                '<td>' + pastilleStatut(cmd.statut) + '</td>' +
                '<td class="num">' + euros(cmd.total) + '</td>' +
                '<td>' + dateCourte(cmd.date) + '</td></tr>').join('')
            : ligneVide(5, 'Aucune commande pour le moment');

        // Compteurs de la navigation
        majBadge('badge-commandes', c.commandes_en_cours);
        majBadge('badge-avis', c.avis_a_moderer);
        majBadge('badge-contact', c.messages_non_traites);
    }

    function majBadge(id, valeur) {
        const el = $('#' + id);
        if (!el) return;
        el.textContent = valeur;
        el.hidden = !Number(valeur);
    }

    // ─── Produits ───────────────────────────────────────────────

    async function chargerProduits() {
        const params = {
            q: $('#produits-recherche').value.trim(),
            editeur_slug: $('#produits-editeur').value,
            rupture: $('#produits-rupture').checked ? '1' : '',
            limit: LIMITE, offset: etat.produits || 0
        };
        const r = await KinkaAPI._fetchBrut(requete('/admin/produits', params));
        $('#produits-resume').textContent = r.total.toLocaleString('fr-FR') + ' produit(s)';

        $('#tbody-produits').innerHTML = r.data.length ? r.data.map(p =>
            '<tr>' +
            '<td>' + (p.image ? '<img class="miniature" src="' + echapper(kinkaImage(p.image)) + '" alt="" loading="lazy">' : '') + '</td>' +
            '<td><strong>' + echapper(p.titre) + '</strong><br><span style="opacity:.6;font-size:.78rem">' + echapper(p.id) + '</span></td>' +
            '<td>' + echapper(p.editeur_nom || p.editeur || '—') + '</td>' +
            '<td class="num">' + euros(p.prix_promo || p.prix) + '</td>' +
            '<td class="num">' + badgeStock(p.stock) + '</td>' +
            '<td>' + echapper(p.etat || '—') + '</td>' +
            '<td style="white-space:nowrap">' +
              '<button class="btn-admin" data-modifier="' + echapper(p.id) + '">Modifier</button> ' +
              '<button class="btn-admin btn-admin-danger" data-supprimer="' + echapper(p.id) + '">Supprimer</button>' +
            '</td></tr>').join('') : ligneVide(7, 'Aucun produit ne correspond');

        $$('#tbody-produits [data-modifier]').forEach(b =>
            b.addEventListener('click', () => ouvrirFormulaireProduit(r.data.find(p => p.id === b.dataset.modifier))));
        $$('#tbody-produits [data-supprimer]').forEach(b =>
            b.addEventListener('click', () => supprimerProduit(b.dataset.supprimer)));

        rendrePagination('produits', 'pagination-produits', r.total, LIMITE, chargerProduits);
    }

    function badgeStock(stock) {
        const n = Number(stock || 0);
        if (n === 0) return '<span class="badge badge-rouge">rupture</span>';
        if (n <= 3)  return '<span class="badge badge-orange">' + n + '</span>';
        return n;
    }

    const CHAMPS_FORMULAIRE = [
        { cle: 'titre',      libelle: 'Titre',            type: 'text',   large: true },
        { cle: 'serie',      libelle: 'Série',            type: 'text' },
        { cle: 'tome',       libelle: 'Tome',             type: 'number' },
        { cle: 'auteur',     libelle: 'Auteur',           type: 'text' },
        { cle: 'categorie',  libelle: 'Catégorie',        type: 'text' },
        { cle: 'prix',       libelle: 'Prix (€)',         type: 'number', pas: '0.01' },
        { cle: 'prix_promo', libelle: 'Prix promo (€)',   type: 'number', pas: '0.01' },
        { cle: 'stock',      libelle: 'Stock',            type: 'number' },
        { cle: 'etat',       libelle: 'État',             type: 'text' },
        { cle: 'image',      libelle: 'URL de l’image',   type: 'text',   large: true },
        { cle: 'description', libelle: 'Description',     type: 'textarea', large: true }
    ];

    function ouvrirFormulaireProduit(produit) {
        const creation = !produit;
        const p = produit || {};
        const champs = CHAMPS_FORMULAIRE.map(c => {
            const valeur = echapper(p[c.cle] == null ? '' : p[c.cle]);
            const saisie = c.type === 'textarea'
                ? '<textarea data-champ="' + c.cle + '">' + valeur + '</textarea>'
                : '<input type="' + c.type + '"' + (c.pas ? ' step="' + c.pas + '"' : '') +
                  ' data-champ="' + c.cle + '" value="' + valeur + '">';
            return '<div class="admin-champ' + (c.large ? ' pleine-largeur' : '') + '">' +
                   '<label>' + c.libelle + '</label>' + saisie + '</div>';
        }).join('');

        const identifiant = creation
            ? '<div class="admin-champ pleine-largeur"><label>Identifiant</label>' +
              '<input type="text" data-champ="id" placeholder="ex : vinland-saga-12">' +
              '<span class="admin-champ-aide">Utilisé dans l’URL du produit, il ne pourra plus être modifié.</span></div>'
            : '<div class="admin-champ pleine-largeur"><label>Identifiant</label>' +
              '<input type="text" value="' + echapper(p.id) + '" disabled></div>';

        const cases = ['promo', 'nouveaute', 'bestseller', 'coup_de_coeur'].map(cle =>
            '<label class="admin-case"><input type="checkbox" data-champ="' + cle + '"' +
            (p[cle] ? ' checked' : '') + '> ' + cle.replace(/_/g, ' ') + '</label>').join('');

        modale.ouvrir(creation ? 'Nouveau produit' : 'Modifier le produit',
            '<div class="admin-grille-champs">' + identifiant + champs +
            '<div class="admin-champ pleine-largeur"><label>Mises en avant</label>' +
            '<div class="admin-cases">' + cases + '</div></div></div>',
            [
                { libelle: 'Annuler', action: () => modale.fermer() },
                { libelle: creation ? 'Créer' : 'Enregistrer', classe: 'btn-admin-principal',
                  action: (btn) => enregistrerProduit(creation, p.id, btn) }
            ]);
    }

    async function enregistrerProduit(creation, id, bouton) {
        const corps = {};
        $$('#modale-corps [data-champ]').forEach(el => {
            if (el.disabled) return;
            corps[el.dataset.champ] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : el.value;
        });
        bouton.disabled = true;
        try {
            if (creation) await api.post('/admin/produits', corps);
            else          await api.put('/admin/produits/' + encodeURIComponent(id), corps);
            modale.fermer();
            notifier(creation ? 'Produit créé' : 'Produit mis à jour', 'success');
            chargerProduits();
        } catch (err) {
            notifier(err.message || 'Enregistrement impossible', 'error');
            bouton.disabled = false;
        }
    }

    function supprimerProduit(id) {
        modale.ouvrir('Supprimer le produit',
            '<p>Le produit <strong>' + echapper(id) + '</strong> sera définitivement retiré du catalogue. ' +
            'Cette action est irréversible.</p>',
            [
                { libelle: 'Annuler', action: () => modale.fermer() },
                { libelle: 'Supprimer', classe: 'btn-admin-danger', action: async (btn) => {
                    btn.disabled = true;
                    try {
                        await api.delete('/admin/produits/' + encodeURIComponent(id));
                        modale.fermer();
                        notifier('Produit supprimé', 'success');
                        chargerProduits();
                    } catch (err) {
                        notifier(err.message || 'Suppression impossible', 'error');
                        btn.disabled = false;
                    }
                } }
            ]);
    }

    // ─── Commandes ──────────────────────────────────────────────

    const STATUTS = {
        en_cours: { libelle: 'En cours', classe: 'badge-orange' },
        validee:  { libelle: 'Validée',  classe: 'badge-bleu' },
        expediee: { libelle: 'Expédiée', classe: 'badge-bleu' },
        livree:   { libelle: 'Livrée',   classe: 'badge-vert' },
        annulee:  { libelle: 'Annulée',  classe: 'badge-rouge' }
    };

    function pastilleStatut(statut) {
        const s = STATUTS[statut] || { libelle: statut || '—', classe: 'badge-gris' };
        return '<span class="badge ' + s.classe + '">' + echapper(s.libelle) + '</span>';
    }

    async function chargerCommandes() {
        const params = {
            q: $('#commandes-recherche').value.trim(),
            statut: $('#commandes-statut').value,
            limit: LIMITE, offset: etat.commandes || 0
        };
        const r = await KinkaAPI._fetchBrut(requete('/admin/commandes', params));
        $('#commandes-resume').textContent = r.total + ' commande(s)';

        $('#tbody-commandes').innerHTML = r.data.length ? r.data.map(c =>
            '<tr>' +
            '<td><strong>' + echapper(c.id) + '</strong></td>' +
            '<td>' + echapper(c.email || '—') + '</td>' +
            '<td class="num">' + c.nb_articles + '</td>' +
            '<td class="num">' + euros(c.total) + '</td>' +
            '<td>' + pastilleStatut(c.statut) + '</td>' +
            '<td>' + (c.numero_suivi
                ? echapper(c.transporteur || '') + '<br><span style="opacity:.7;font-size:.78rem">' + echapper(c.numero_suivi) + '</span>'
                : '<span style="opacity:.5">—</span>') + '</td>' +
            '<td>' + dateCourte(c.date) + '</td>' +
            '<td><button class="btn-admin" data-commande="' + echapper(c.id) + '">Gérer</button></td>' +
            '</tr>').join('') : ligneVide(8, 'Aucune commande');

        $$('#tbody-commandes [data-commande]').forEach(b =>
            b.addEventListener('click', () => ouvrirCommande(b.dataset.commande)));

        rendrePagination('commandes', 'pagination-commandes', r.total, LIMITE, chargerCommandes);
    }

    async function ouvrirCommande(id) {
        const c = await api.get('/admin/commandes/' + encodeURIComponent(id));
        const articles = c.articles.map(a =>
            '<tr><td>' + echapper(a.titre) + '</td><td class="num">' + a.quantite +
            '</td><td class="num">' + euros(a.prix) + '</td></tr>').join('');
        const historique = c.historique.length
            ? c.historique.map(h =>
                '<li>' + dateCourte(h.created_at) + ' — ' + echapper(h.ancien_statut || '?') + ' → <strong>' +
                echapper(h.nouveau_statut) + '</strong>' +
                (h.admin_email ? ' par ' + echapper(h.admin_email) : '') +
                (h.commentaire ? '<br><span style="opacity:.7">' + echapper(h.commentaire) + '</span>' : '') +
                '</li>').join('')
            : '<li style="opacity:.6">Aucun changement de statut enregistré</li>';

        const options = Object.keys(STATUTS).map(s =>
            '<option value="' + s + '"' + (s === c.statut ? ' selected' : '') + '>' + STATUTS[s].libelle + '</option>').join('');

        modale.ouvrir('Commande ' + c.id,
            '<div class="admin-grille-champs">' +
              '<div class="admin-champ"><label>Client</label><input type="text" value="' +
                 echapper((c.prenom || '') + ' ' + (c.nom || '') + ' — ' + (c.email || '')) + '" disabled></div>' +
              '<div class="admin-champ"><label>Total</label><input type="text" value="' + euros(c.total) + '" disabled></div>' +
              '<div class="admin-champ"><label>Statut</label><select data-champ="statut">' + options + '</select></div>' +
              '<div class="admin-champ"><label>Transporteur</label><input type="text" data-champ="transporteur" value="' +
                 echapper(c.transporteur || '') + '" placeholder="Colissimo, Mondial Relay…"></div>' +
              '<div class="admin-champ"><label>Numéro de suivi</label><input type="text" data-champ="numero_suivi" value="' +
                 echapper(c.numero_suivi || '') + '"></div>' +
              '<div class="admin-champ"><label>Commentaire (historique)</label><input type="text" data-champ="commentaire" placeholder="Facultatif"></div>' +
              '<div class="admin-champ pleine-largeur"><label>Adresse de livraison</label>' +
                 '<textarea disabled>' + echapper(c.adresse_livraison || '') + '</textarea></div>' +
              '<div class="admin-champ pleine-largeur"><label>Articles</label>' +
                 '<table class="admin-tableau"><thead><tr><th>Titre</th><th class="num">Qté</th><th class="num">Prix</th></tr></thead>' +
                 '<tbody>' + articles + '</tbody></table></div>' +
              '<div class="admin-champ pleine-largeur"><label>Historique des statuts</label>' +
                 '<ul style="font-size:.82rem;line-height:1.7;padding-left:1.1rem">' + historique + '</ul></div>' +
            '</div>',
            [
                { libelle: 'Fermer', action: () => modale.fermer() },
                { libelle: 'Enregistrer', classe: 'btn-admin-principal', action: async (btn) => {
                    const corps = {};
                    $$('#modale-corps [data-champ]').forEach(el => { corps[el.dataset.champ] = el.value; });
                    btn.disabled = true;
                    try {
                        await api.patch('/admin/commandes/' + encodeURIComponent(id), corps);
                        modale.fermer();
                        notifier('Commande mise à jour', 'success');
                        chargerCommandes();
                        chargerTableauBord();
                    } catch (err) {
                        notifier(err.message || 'Mise à jour impossible', 'error');
                        btn.disabled = false;
                    }
                } }
            ]);
    }

    // ─── Avis ───────────────────────────────────────────────────

    async function chargerAvis() {
        const params = { valide: $('#avis-filtre').value, limit: LIMITE, offset: etat.avis || 0 };
        const r = await KinkaAPI._fetchBrut(requete('/admin/avis', params));
        $('#avis-resume').textContent = r.total + ' avis';

        $('#tbody-avis').innerHTML = r.data.length ? r.data.map(a =>
            '<tr>' +
            '<td>' + echapper(a.produit_titre || a.produit_id) + '</td>' +
            '<td>' + echapper(a.prenom || a.email || '—') + '</td>' +
            '<td class="num">' + (a.note != null ? a.note + '/5' : '—') + '</td>' +
            '<td style="max-width:340px">' + echapper(a.commentaire || '') + '</td>' +
            '<td>' + (a.valide ? '<span class="badge badge-vert">publié</span>' : '<span class="badge badge-orange">à modérer</span>') + '</td>' +
            '<td style="white-space:nowrap">' +
              (a.valide
                ? '<button class="btn-admin" data-avis-rejeter="' + a.id + '">Retirer</button> '
                : '<button class="btn-admin btn-admin-principal" data-avis-valider="' + a.id + '">Publier</button> ') +
              '<button class="btn-admin btn-admin-danger" data-avis-supprimer="' + a.id + '">Supprimer</button>' +
            '</td></tr>').join('') : ligneVide(6, 'Aucun avis');

        $$('#tbody-avis [data-avis-valider]').forEach(b => b.addEventListener('click', () => modererAvis(b.dataset.avisValider, true)));
        $$('#tbody-avis [data-avis-rejeter]').forEach(b => b.addEventListener('click', () => modererAvis(b.dataset.avisRejeter, false)));
        $$('#tbody-avis [data-avis-supprimer]').forEach(b => b.addEventListener('click', async () => {
            try { await api.delete('/admin/avis/' + b.dataset.avisSupprimer); notifier('Avis supprimé', 'success'); chargerAvis(); chargerTableauBord(); }
            catch (err) { notifier(err.message, 'error'); }
        }));

        rendrePagination('avis', 'pagination-avis', r.total, LIMITE, chargerAvis);
    }

    async function modererAvis(id, valide) {
        try {
            await api.patch('/admin/avis/' + id, { valide });
            notifier(valide ? 'Avis publié' : 'Avis retiré', 'success');
            chargerAvis(); chargerTableauBord();
        } catch (err) { notifier(err.message, 'error'); }
    }

    // ─── Annonces ───────────────────────────────────────────────

    async function chargerAnnonces() {
        const params = { statut: $('#annonces-filtre').value, limit: LIMITE, offset: etat.annonces || 0 };
        const r = await KinkaAPI._fetchBrut(requete('/admin/annonces', params));
        $('#annonces-resume').textContent = r.total + ' annonce(s)';

        $('#tbody-annonces').innerHTML = r.data.length ? r.data.map(a =>
            '<tr>' +
            '<td><strong>' + echapper(a.titre) + '</strong></td>' +
            '<td>' + echapper(a.prenom || a.email || '—') + '</td>' +
            '<td class="num">' + euros(a.prix) + '</td>' +
            '<td>' + echapper(a.etat || '—') + '</td>' +
            '<td><span class="badge ' + (a.statut === 'active' ? 'badge-vert' : a.statut === 'suspendue' ? 'badge-rouge' : 'badge-gris') + '">' +
                echapper(a.statut) + '</span></td>' +
            '<td>' + dateCourte(a.created_at) + '</td>' +
            '<td style="white-space:nowrap">' +
              (a.statut === 'suspendue'
                ? '<button class="btn-admin" data-annonce-reactiver="' + a.id + '">Réactiver</button> '
                : '<button class="btn-admin" data-annonce-suspendre="' + a.id + '">Suspendre</button> ') +
              '<button class="btn-admin btn-admin-danger" data-annonce-supprimer="' + a.id + '">Supprimer</button>' +
            '</td></tr>').join('') : ligneVide(7, 'Aucune annonce');

        $$('#tbody-annonces [data-annonce-suspendre]').forEach(b => b.addEventListener('click', () => statutAnnonce(b.dataset.annonceSuspendre, 'suspendue')));
        $$('#tbody-annonces [data-annonce-reactiver]').forEach(b => b.addEventListener('click', () => statutAnnonce(b.dataset.annonceReactiver, 'active')));
        $$('#tbody-annonces [data-annonce-supprimer]').forEach(b => b.addEventListener('click', async () => {
            try { await api.delete('/admin/annonces/' + b.dataset.annonceSupprimer); notifier('Annonce supprimée', 'success'); chargerAnnonces(); }
            catch (err) { notifier(err.message, 'error'); }
        }));

        rendrePagination('annonces', 'pagination-annonces', r.total, LIMITE, chargerAnnonces);
    }

    async function statutAnnonce(id, statut) {
        try { await api.patch('/admin/annonces/' + id, { statut }); notifier('Annonce mise à jour', 'success'); chargerAnnonces(); }
        catch (err) { notifier(err.message, 'error'); }
    }

    // ─── Messages de contact ────────────────────────────────────

    async function chargerContact() {
        const params = { traite: $('#contact-filtre').value, limit: LIMITE, offset: etat.contact || 0 };
        const r = await KinkaAPI._fetchBrut(requete('/admin/contact', params));
        $('#contact-resume').textContent = r.total + ' message(s)';

        $('#tbody-contact').innerHTML = r.data.length ? r.data.map(m =>
            '<tr>' +
            '<td><strong>' + echapper(m.nom) + '</strong><br><span style="opacity:.7;font-size:.78rem">' + echapper(m.email) + '</span></td>' +
            '<td>' + echapper(m.sujet || '—') + '</td>' +
            '<td style="max-width:360px">' + echapper(m.message || '') + '</td>' +
            '<td>' + dateCourte(m.created_at) + '</td>' +
            '<td style="white-space:nowrap">' +
              '<a class="btn-admin" href="mailto:' + encodeURIComponent(m.email) + '">Répondre</a> ' +
              '<button class="btn-admin" data-contact="' + m.id + '" data-traite="' + (m.traite ? '0' : '1') + '">' +
              (m.traite ? 'Rouvrir' : 'Marquer traité') + '</button>' +
            '</td></tr>').join('') : ligneVide(5, 'Aucun message');

        $$('#tbody-contact [data-contact]').forEach(b => b.addEventListener('click', async () => {
            try {
                await api.patch('/admin/contact/' + b.dataset.contact, { traite: b.dataset.traite === '1' });
                chargerContact(); chargerTableauBord();
            } catch (err) { notifier(err.message, 'error'); }
        }));

        rendrePagination('contact', 'pagination-contact', r.total, LIMITE, chargerContact);
    }

    // ─── Newsletter ─────────────────────────────────────────────

    async function chargerNewsletter() {
        const r = await KinkaAPI._fetchBrut(requete('/admin/newsletter', { limit: LIMITE, offset: etat.newsletter || 0 }));
        $('#newsletter-resume').textContent = r.total + ' inscrit(s)';
        $('#tbody-newsletter').innerHTML = r.data.length
            ? r.data.map(n => '<tr><td>' + echapper(n.email) + '</td><td>' + dateCourte(n.created_at) + '</td></tr>').join('')
            : ligneVide(2, 'Aucun inscrit');
        rendrePagination('newsletter', 'pagination-newsletter', r.total, LIMITE, chargerNewsletter);
    }

    // ─── Utilisateurs ───────────────────────────────────────────

    async function chargerUtilisateurs() {
        const params = {
            q: $('#utilisateurs-recherche').value.trim(),
            role: $('#utilisateurs-role').value,
            limit: LIMITE, offset: etat.utilisateurs || 0
        };
        const r = await KinkaAPI._fetchBrut(requete('/admin/utilisateurs', params));
        $('#utilisateurs-resume').textContent = r.total + ' compte(s)';

        $('#tbody-utilisateurs').innerHTML = r.data.length ? r.data.map(u =>
            '<tr>' +
            '<td>' + echapper(u.email) + '</td>' +
            '<td>' + echapper(((u.prenom || '') + ' ' + (u.nom || '')).trim() || '—') + '</td>' +
            '<td>' + (u.role === 'admin' ? '<span class="badge badge-bleu">administrateur</span>' : '<span class="badge badge-gris">client</span>') + '</td>' +
            '<td class="num">' + u.nb_commandes + '</td>' +
            '<td>' + dateCourte(u.date_inscription) + '</td>' +
            '<td><button class="btn-admin" data-role="' + u.id + '" data-cible="' + (u.role === 'admin' ? 'user' : 'admin') + '">' +
                (u.role === 'admin' ? 'Retirer les droits' : 'Promouvoir admin') + '</button></td>' +
            '</tr>').join('') : ligneVide(6, 'Aucun compte');

        $$('#tbody-utilisateurs [data-role]').forEach(b => b.addEventListener('click', async () => {
            try {
                await api.patch('/admin/utilisateurs/' + b.dataset.role, { role: b.dataset.cible });
                notifier('Rôle mis à jour', 'success');
                chargerUtilisateurs(); chargerTableauBord();
            } catch (err) { notifier(err.message, 'error'); }
        }));

        rendrePagination('utilisateurs', 'pagination-utilisateurs', r.total, LIMITE, chargerUtilisateurs);
    }

    // ─── Journal ────────────────────────────────────────────────

    async function chargerJournal() {
        const r = await KinkaAPI._fetchBrut(requete('/admin/logs', { limit: LIMITE, offset: etat.journal || 0 }));
        $('#tbody-journal').innerHTML = r.data.length ? r.data.map(l =>
            '<tr><td>' + dateCourte(l.created_at) + '</td>' +
            '<td>' + echapper(l.admin_email || '—') + '</td>' +
            '<td><span class="badge badge-gris">' + echapper(l.action) + '</span></td>' +
            '<td>' + echapper(l.cible_id || '—') + '</td>' +
            '<td style="max-width:300px;opacity:.75">' + echapper(l.details ? JSON.stringify(l.details) : '') + '</td></tr>').join('')
            : ligneVide(5, 'Aucune action enregistrée');
        rendrePagination('journal', 'pagination-journal', r.total, LIMITE, chargerJournal);
    }

    // ─── Navigation entre sections ──────────────────────────────

    const CHARGEURS = {
        'tableau-bord': chargerTableauBord,
        'produits':     chargerProduits,
        'commandes':    chargerCommandes,
        'avis':         chargerAvis,
        'annonces':     chargerAnnonces,
        'contact':      chargerContact,
        'newsletter':   chargerNewsletter,
        'utilisateurs': chargerUtilisateurs,
        'journal':      chargerJournal
    };

    function afficherSection(nom) {
        $$('.admin-nav-lien').forEach(b => b.classList.toggle('actif', b.dataset.section === nom));
        $$('.admin-section').forEach(s => s.classList.toggle('actif', s.id === 'section-' + nom));
        location.hash = nom;
        const charger = CHARGEURS[nom];
        if (charger) charger().catch(err => notifier(err.message || 'Chargement impossible', 'error'));
    }

    // ─── Démarrage ──────────────────────────────────────────────

    async function demarrer() {
        // Garde d'affichage : le serveur reste seul juge, mais on évite
        // d'afficher une interface vide à un visiteur non autorisé.
        try {
            const moi = await KinkaAPI.auth.me();
            if (moi.role !== 'admin') throw new Error('role');
            $('#admin-identite').textContent = moi.email;
        } catch (err) {
            $('#admin-refus').hidden = false;
            $('#admin-refus-message').textContent = (err && err.message === 'role')
                ? 'Votre compte n’a pas les droits d’administration.'
                : 'Connectez-vous avec un compte administrateur pour accéder à cette page.';
            return;
        }

        $('#admin-layout').hidden = false;

        $$('.admin-nav-lien').forEach(b =>
            b.addEventListener('click', () => { etat[b.dataset.section] = 0; afficherSection(b.dataset.section); }));

        $('#modale-fermer').addEventListener('click', () => modale.fermer());
        $('#admin-modale').addEventListener('click', (e) => { if (e.target.id === 'admin-modale') modale.fermer(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modale.fermer(); });

        $('#admin-deconnexion').addEventListener('click', () => {
            KinkaAPI.auth.logout();
            window.location.href = './page_accueil.html';
        });

        // Filtres : toute modification remet la pagination à zéro
        const relierFiltre = (selecteur, cle, evenement) => {
            const el = $(selecteur);
            if (!el) return;
            const relancer = () => { etat[cle] = 0; CHARGEURS[cle](); };
            el.addEventListener(evenement || 'change', evenement === 'input' ? differer(relancer) : relancer);
        };
        relierFiltre('#produits-recherche', 'produits', 'input');
        relierFiltre('#produits-editeur', 'produits');
        relierFiltre('#produits-rupture', 'produits');
        relierFiltre('#commandes-recherche', 'commandes', 'input');
        relierFiltre('#commandes-statut', 'commandes');
        relierFiltre('#avis-filtre', 'avis');
        relierFiltre('#annonces-filtre', 'annonces');
        relierFiltre('#contact-filtre', 'contact');
        relierFiltre('#utilisateurs-recherche', 'utilisateurs', 'input');
        relierFiltre('#utilisateurs-role', 'utilisateurs');

        $('#btn-nouveau-produit').addEventListener('click', () => ouvrirFormulaireProduit(null));
        $('#btn-export-newsletter').addEventListener('click', exporterNewsletter);
        $('#btn-sync-jikan').addEventListener('click', synchroniserCatalogue);

        // Liste des éditeurs pour le filtre produits
        try {
            const editeurs = await KinkaAPI.editeurs.getAll();
            $('#produits-editeur').innerHTML = '<option value="">Tous les éditeurs</option>' +
                editeurs.map(e => '<option value="' + echapper(e.slug) + '">' + echapper(e.nom) + '</option>').join('');
        } catch (err) { console.error('[admin] éditeurs :', err); }

        afficherSection(location.hash.replace('#', '') || 'tableau-bord');
    }

    // Export CSV : la route exige le jeton, on ne peut donc pas pointer un
    // simple lien vers l'URL — on récupère le fichier puis on déclenche le
    // téléchargement depuis le blob obtenu.
    async function exporterNewsletter() {
        const bouton = $('#btn-export-newsletter');
        bouton.disabled = true;
        try {
            const reponse = await fetch(KinkaAPI.baseUrl + '/admin/newsletter/export', {
                headers: { Authorization: 'Bearer ' + KinkaAuth.getToken() }
            });
            if (!reponse.ok) throw new Error('Export refusé (' + reponse.status + ')');
            const blob = await reponse.blob();
            const url  = URL.createObjectURL(blob);
            const lien = document.createElement('a');
            lien.href = url;
            lien.download = 'newsletter_kinka.csv';
            document.body.appendChild(lien);
            lien.click();
            lien.remove();
            URL.revokeObjectURL(url);
            notifier('Export téléchargé', 'success');
        } catch (err) {
            notifier(err.message || 'Export impossible', 'error');
        } finally {
            bouton.disabled = false;
        }
    }

    // Synchronisation Jikan : la route existait déjà mais n'était exposée par
    // aucun écran, elle n'était déclenchable qu'en appel API direct.
    function synchroniserCatalogue() {
        modale.ouvrir('Synchroniser le catalogue',
            '<p>La synchronisation interroge l’API publique Jikan pour mettre à jour les fiches du catalogue. ' +
            'Elle peut prendre plusieurs minutes et reste limitée à 2 exécutions par heure.</p>',
            [
                { libelle: 'Annuler', action: () => modale.fermer() },
                { libelle: 'Lancer', classe: 'btn-admin-principal', action: async (btn) => {
                    btn.disabled = true; btn.textContent = 'Synchronisation…';
                    try {
                        const r = await api.post('/mangas/sync', {});
                        modale.fermer();
                        notifier('Synchronisation terminée' + (r && r.total ? ' (' + r.total + ' fiches)' : ''), 'success');
                        chargerTableauBord();
                    } catch (err) {
                        notifier(err.message || 'Synchronisation impossible', 'error');
                        btn.disabled = false; btn.textContent = 'Lancer';
                    }
                } }
            ]);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
})();
