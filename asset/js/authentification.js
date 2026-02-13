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
                id: 'user_' + Date.now() + '_1',
                email: 'admin@kinka.fr',
                // Mot de passe "admin123" hashé en base64 (simulation)
                password: btoa('admin123'),
                prenom: 'Admin',
                nom: 'Kinka',
                dateInscription: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
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
// 11. INTÉGRATION AUX FORMULAIRES (si on veut auto-attacher)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Formulaire de connexion
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const remember = document.querySelector('.form-checkbox')?.checked;

            const result = window.auth.login(email, password);
            if (result.success) {
                // Rediriger vers la page d'accueil ou la page précédente
                window.location.href = '/page_accueil.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Formulaire d'inscription
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const prenom = document.getElementById('prenom')?.value;
            const nom = document.getElementById('nom')?.value;
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;
            const confirm = document.getElementById('confirm-password')?.value;

            if (password !== confirm) {
                alert('Les mots de passe ne correspondent pas.');
                return;
            }

            const result = window.auth.register({ prenom, nom, email, password });
            if (result.success) {
                alert(result.message);
                window.location.href = '/pageLogIn.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Formulaire de demande de réinitialisation (page_mdpreinitialisation.html)
    const resetRequestForm = document.querySelector('.reset-form');
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email')?.value;
            const result = window.auth.requestPasswordReset(email);
            alert(result.message); // Dans un vrai système, on ne dirait pas "succès" mais ici on simule
        });
    }

    // Formulaire de nouveau mot de passe (page_nouveaumdp.html)
    const newPasswordForm = document.querySelector('.password-form');
    if (newPasswordForm) {
        // Récupérer le token depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        newPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newPass = document.getElementById('new-password')?.value;
            const confirmPass = document.getElementById('confirm-password')?.value;

            if (newPass !== confirmPass) {
                alert('Les mots de passe ne correspondent pas.');
                return;
            }

            if (!token) {
                alert('Token manquant.');
                return;
            }

            const result = window.auth.resetPassword(token, newPass);
            if (result.success) {
                alert(result.message);
                window.location.href = '/pageLogIn.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Bouton de déconnexion (à placer sur les pages protégées)
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.auth.logout();
            window.location.href = '/page_accueil.html';
        });
    }

    // Protéger les pages qui nécessitent une connexion
    const protectedPages = ['/page_profil.html', '/page_panier.html', '/page_suivicommande.html', '/page_confirmationcommande.html'];
    const currentPath = window.location.pathname;
    if (protectedPages.includes(currentPath)) {
        window.auth.requireAuth();
    }

    // Rediriger les pages de login/register si déjà connecté
    const guestPages = ['/pageLogIn.html', '/pageSignUp.html', '/page_mdpreinitialisation.html', '/page_nouveaumdp.html'];
    if (guestPages.includes(currentPath)) {
        window.auth.requireGuest();
    }
});