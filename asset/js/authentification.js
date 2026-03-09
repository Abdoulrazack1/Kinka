// ============================================
// auth.js - Système d'authentification complet
// Stockage simulé dans localStorage
// ============================================

// ============================================
// 1. STRUCTURE DES DONNÉES
// ============================================

// Clés localStorage
const STORAGE_KEYS = {
    USERS: 'kinka_users',           // Tableau des utilisateurs enregistrés
    CURRENT_USER: 'kinka_current_user', // Utilisateur connecté (session)
    RESET_TOKENS: 'kinka_reset_tokens'  // Tokens de réinitialisation (simulés)
};

// ============================================
// 2. INITIALISATION – CRÉATION D'UN ADMIN PAR DÉFAUT (optionnel)
// ============================================

function initAuth() {
    // Créer la base utilisateurs si elle n'existe pas
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
            {
                id: 'user_admin_kinka',
                email: 'admin@kinka.fr',
                password: btoa('admin123'),
                prenom: 'Admin',
                nom: 'Kinka',
                dateInscription: new Date('2023-01-15').toISOString(),
                abonnement: 'premium'
            },
            {
                // ── COMPTE DÉMO ──────────────────────────────────
                id: 'user_demo_kinka',
                email: 'demo@kinka.fr',
                password: btoa('demo1234'),
                prenom: 'Sakura',
                nom: 'Tanaka',
                dateInscription: new Date('2024-03-20').toISOString(),
                adresse: '42 Rue du Manga',
                ville: 'Lyon',
                codePostal: '69001',
                telephone: '06 12 34 56 78',
                abonnement: 'premium',
                avatar: '',
                commandes: [
                    {
                        id: 'CMD-2024-0891',
                        date: '2025-02-14',
                        statut: 'livree',
                        total: 38.90,
                        articles: [
                            { titre: 'Jujutsu Kaisen — Tome 20', prix: 7.20, qte: 1, image: '/asset/image/Jujutsu Kaisen Tome 20.jpg' },
                            { titre: 'Chainsaw Man — Tome 12', prix: 7.70, qte: 2, image: '/asset/image/Chainsaw Man Tome 12.jpg' },
                            { titre: 'My Hero Academia — Tome 37', prix: 7.35, qte: 2, image: '/asset/image/My Hero Academia Tome 37.jpg' }
                        ]
                    },
                    {
                        id: 'CMD-2025-0124',
                        date: '2025-03-01',
                        statut: 'en_cours',
                        total: 24.55,
                        articles: [
                            { titre: 'One Piece — Tome 105', prix: 7.20, qte: 1, image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg' },
                            { titre: 'Vinland Saga — Tome 27', prix: 8.95, qte: 1, image: '/asset/image/Vinland Saga Tome 27.jpg' },
                            { titre: 'Spy x Family — Tome 12', prix: 8.40, qte: 1, image: '/asset/image/Spy x Family Tome 12.jpg' }
                        ]
                    }
                ]
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    } else {
        // Vérifier que le compte démo existe toujours (migration)
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
        const hasDemo = users.some(u => u.email === 'demo@kinka.fr');
        if (!hasDemo) {
            users.push({
                id: 'user_demo_kinka',
                email: 'demo@kinka.fr',
                password: btoa('demo1234'),
                prenom: 'Sakura',
                nom: 'Tanaka',
                dateInscription: new Date('2024-03-20').toISOString(),
                adresse: '42 Rue du Manga',
                ville: 'Lyon',
                codePostal: '69001',
                abonnement: 'premium',
                avatar: '',
                commandes: [
                    {
                        id: 'CMD-2024-0891',
                        date: '2025-02-14',
                        statut: 'livree',
                        total: 38.90,
                        articles: [
                            { titre: 'Jujutsu Kaisen — Tome 20', prix: 7.20, qte: 1 },
                            { titre: 'Chainsaw Man — Tome 12', prix: 7.70, qte: 2 }
                        ]
                    }
                ]
            });
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    }

    // Initialiser les tokens de reset
    if (!localStorage.getItem(STORAGE_KEYS.RESET_TOKENS)) {
        localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify({}));
    }
}

// Appeler l'initialisation au chargement du script
initAuth();

// ============================================
// 3. FONCTIONS UTILITAIRES
// ============================================

// Récupérer tous les utilisateurs
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

// Sauvegarder les utilisateurs
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Récupérer l'utilisateur connecté (ou null)
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Sauvegarder l'utilisateur connecté
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

// Simuler un hash de mot de passe (simple encodage base64)
function hashPassword(password) {
    return btoa(password);
}

// Vérifier un mot de passe
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// Générer un ID unique
function generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// 4. INSCRIPTION
// ============================================

/**
 * Inscription d'un nouvel utilisateur
 * @param {Object} userData - { email, password, prenom, nom, ... }
 * @returns {Object} { success: boolean, message: string, user: object? }
 */
function register(userData) {
    const users = getUsers();

    // Vérifier si l'email existe déjà
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    // Créer le nouvel utilisateur
    const newUser = {
        id: generateId(),
        email: userData.email,
        password: hashPassword(userData.password),
        prenom: userData.prenom || '',
        nom: userData.nom || '',
        dateInscription: new Date().toISOString(),
        // Autres champs optionnels (adresse, téléphone, etc.) pourront être ajoutés plus tard
    };

    users.push(newUser);
    saveUsers(users);

    // Connecter automatiquement après inscription (optionnel)
    // setCurrentUser({ ...newUser, password: undefined }); // on enlève le hash pour la session
    // return { success: true, message: 'Inscription réussie.', user: { ...newUser, password: undefined } };

    // Ou simplement retourner succès sans connexion automatique
    return { success: true, message: 'Inscription réussie. Vous pouvez maintenant vous connecter.' };
}

// ============================================
// 5. CONNEXION
// ============================================

/**
 * Connecter un utilisateur
 * @param {string} email
 * @param {string} password
 * @returns {Object} { success: boolean, message: string, user: object? }
 */
function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return { success: false, message: 'Email incorrect.' };
    }

    if (!verifyPassword(password, user.password)) {
        return { success: false, message: 'Mot de passe incorrect.' };
    }

    // Créer une copie sans le mot de passe pour la session
    const sessionUser = { ...user };
    delete sessionUser.password;

    setCurrentUser(sessionUser);
    return { success: true, message: 'Connexion réussie.', user: sessionUser };
}

// ============================================
// 6. DÉCONNEXION
// ============================================

function logout() {
    setCurrentUser(null);
    // Optionnel : rediriger vers la page d'accueil ou de connexion
    // window.location.href = '/page_accueil.html';
}

// ============================================
// 7. VÉRIFICATION D'AUTHENTIFICATION
// ============================================

function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Rediriger si non connecté (pour pages protégées)
 * @param {string} redirectUrl - URL de redirection si non authentifié
 */
function requireAuth(redirectUrl = '/pageLogIn.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
    }
}

/**
 * Rediriger si déjà connecté (pour pages login/register)
 * @param {string} redirectUrl - URL de redirection si déjà connecté
 */
function requireGuest(redirectUrl = '/page_profil.html') {
    if (isAuthenticated()) {
        window.location.href = redirectUrl;
    }
}

// ============================================
// 8. RÉINITIALISATION DE MOT DE PASSE
// ============================================

// Demander un lien de réinitialisation (simulé)
function requestPasswordReset(email) {
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
        return { success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }

    // Générer un token unique
    const token = btoa(email + Date.now() + Math.random()).replace(/=/g, '');

    // Stocker le token avec une expiration (1 heure)
    const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS)) || {};
    resetTokens[token] = {
        email: email,
        expires: Date.now() + 3600000 // 1 heure
    };
    localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens));

    // Simuler l'envoi d'email : afficher le lien dans la console (pour test)
    console.log(`Lien de réinitialisation (simulé) : /page_nouveaumdp.html?token=${token}`);

    return { success: true, message: 'Un lien de réinitialisation a été envoyé à votre adresse email.' };
}

// Valider un token de réinitialisation
function validateResetToken(token) {
    const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS)) || {};
    const tokenData = resetTokens[token];

    if (!tokenData) {
        return { valid: false, message: 'Token invalide.' };
    }

    if (tokenData.expires < Date.now()) {
        delete resetTokens[token];
        localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens));
        return { valid: false, message: 'Token expiré.' };
    }

    return { valid: true, email: tokenData.email, token };
}

// Réinitialiser le mot de passe
function resetPassword(token, newPassword) {
    const validation = validateResetToken(token);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === validation.email);
    if (userIndex === -1) {
        return { success: false, message: 'Utilisateur introuvable.' };
    }

    // Mettre à jour le mot de passe
    users[userIndex].password = hashPassword(newPassword);
    saveUsers(users);

    // Supprimer le token utilisé
    const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS)) || {};
    delete resetTokens[token];
    localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens));

    return { success: true, message: 'Mot de passe mis à jour avec succès.' };
}

// ============================================
// 9. GESTION DU PROFIL (mise à jour des informations)
// ============================================

function updateProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, message: 'Non authentifié.' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
        return { success: false, message: 'Utilisateur introuvable.' };
    }

    // Mettre à jour les champs autorisés (sauf email et mot de passe)
    const allowedFields = ['prenom', 'nom', 'telephone', 'adresse', 'ville', 'codePostal', 'pays'];
    allowedFields.forEach(field => {
        if (updatedData[field] !== undefined) {
            users[userIndex][field] = updatedData[field];
        }
    });

    saveUsers(users);

    // Mettre à jour la session
    const updatedUser = { ...users[userIndex] };
    delete updatedUser.password;
    setCurrentUser(updatedUser);

    return { success: true, message: 'Profil mis à jour.', user: updatedUser };
}

// ============================================
// 10. EXPOSITION DES FONCTIONS DANS WINDOW
// ============================================

window.auth = {
    register,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    requireAuth,
    requireGuest,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    updateProfile
};

// ============================================
// 11. INTÉGRATION AUX FORMULAIRES
// Scripts chargés en bas de body → DOM déjà prêt → appel direct
// ============================================
(function initForms() {
    // ── Formulaire de connexion ───────────────────────────────
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email    = document.getElementById('email')?.value?.trim();
            const password = document.getElementById('password')?.value;
            const remember = document.querySelector('.form-checkbox')?.checked;

            if (!email || !password) {
                showToast('Veuillez remplir tous les champs.', 'error');
                return;
            }

            const result = window.auth.login(email, password);
            if (result.success) {
                window.location.href = '/page_accueil.html';
            } else {
                showToast(result.message, result.success ? 'success' : 'error');
            }
        });
    }

    // ── Formulaire d'inscription ──────────────────────────────
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const prenom   = document.getElementById('prenom')?.value?.trim();
            const nom      = document.getElementById('nom')?.value?.trim();
            const email    = document.getElementById('email')?.value?.trim();
            const password = document.getElementById('password')?.value;
            const confirm  = document.getElementById('confirm-password')?.value;

            if (password !== confirm) {
                showToast('Les mots de passe ne correspondent pas.', 'error');
                return;
            }

            const result = window.auth.register({ prenom, nom, email, password });
            if (result.success) {
                showToast(result.message);
                window.location.href = '/pageLogIn.html';
            } else {
                showToast(result.message, result.success ? 'success' : 'error');
            }
        });
    }

    // ── Formulaire réinitialisation mot de passe ──────────────
    const resetForm = document.querySelector('.reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email  = document.getElementById('email')?.value?.trim();
            const result = window.auth.requestPasswordReset(email);
            showToast(result.message, result.success ? 'success' : 'error');
        });
    }

    // ── Formulaire nouveau mot de passe ───────────────────────
    const newPwdForm = document.querySelector('.password-form');
    if (newPwdForm) {
        const token = new URLSearchParams(window.location.search).get('token');
        newPwdForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newPass  = document.getElementById('new-password')?.value;
            const confirm  = document.getElementById('confirm-password')?.value;
            if (newPass !== confirm) { showToast('Les mots de passe ne correspondent pas.', 'error'); return; }
            if (!token)              { showToast('Token manquant.', 'error'); return; }
            const result = window.auth.resetPassword(token, newPass);
            if (result.success) { showToast(result.message); window.location.href = '/pageLogIn.html'; }
            else                 { showToast(result.message, result.success ? 'success' : 'error'); }
        });
    }

    // ── Bouton déconnexion ────────────────────────────────────
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.auth.logout();
            window.location.href = '/page_accueil.html';
        });
    }

    // ── Protection des pages ──────────────────────────────────
    const currentPath  = window.location.pathname;
    const protectedPages = ['/page_profil.html', '/page_panier.html', '/page_suivicommande.html', '/page_confirmationcommande.html'];
    const guestPages     = ['/pageLogIn.html', '/pageSignUp.html', '/page_mdpreinitialisation.html', '/page_nouveaumdp.html'];

    if (protectedPages.includes(currentPath)) window.auth.requireAuth();
    if (guestPages.includes(currentPath))     window.auth.requireGuest();
})();