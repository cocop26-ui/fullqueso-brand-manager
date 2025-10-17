// Authentication Logic

// Check if we're on the login page or dashboard
const isLoginPage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
const isDashboardPage = window.location.pathname.includes('dashboard.html');

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (isLoginPage) {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else if (isDashboardPage) {
            // Display user email in dashboard
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
        }
    } else {
        // User is signed out
        if (isDashboardPage) {
            // Redirect to login
            window.location.href = 'index.html';
        }
    }
});

// Login page functionality
if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const cancelResetButton = document.getElementById('cancelResetButton');
    const sendResetButton = document.getElementById('sendResetButton');
    const errorMessage = document.getElementById('errorMessage');
    const resetMessage = document.getElementById('resetMessage');

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('loginButton');

        // Disable button and show loading state
        loginButton.disabled = true;
        loginButton.textContent = 'Iniciando sesión...';
        errorMessage.style.display = 'none';

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Auth state observer will handle redirect
        } catch (error) {
            console.error('Login error:', error);

            let errorText = 'Error al iniciar sesión. Por favor, intenta de nuevo.';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorText = 'Correo electrónico inválido.';
                    break;
                case 'auth/user-disabled':
                    errorText = 'Esta cuenta ha sido deshabilitada.';
                    break;
                case 'auth/user-not-found':
                    errorText = 'No existe una cuenta con este correo electrónico.';
                    break;
                case 'auth/wrong-password':
                    errorText = 'Contraseña incorrecta.';
                    break;
                case 'auth/invalid-credential':
                    errorText = 'Credenciales inválidas. Verifica tu correo y contraseña.';
                    break;
                case 'auth/too-many-requests':
                    errorText = 'Demasiados intentos fallidos. Por favor, intenta más tarde.';
                    break;
            }

            errorMessage.textContent = errorText;
            errorMessage.style.display = 'block';

            // Re-enable button
            loginButton.disabled = false;
            loginButton.textContent = 'Iniciar Sesión';
        }
    });

    // Show forgot password form
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        resetPasswordForm.style.display = 'block';
        errorMessage.style.display = 'none';
    });

    // Cancel reset password
    cancelResetButton.addEventListener('click', () => {
        resetPasswordForm.style.display = 'none';
        loginForm.style.display = 'block';
        resetMessage.style.display = 'none';
        document.getElementById('resetEmail').value = '';
    });

    // Send password reset email
    sendResetButton.addEventListener('click', async () => {
        const resetEmail = document.getElementById('resetEmail').value;

        if (!resetEmail) {
            resetMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
            resetMessage.className = 'error-message';
            resetMessage.style.display = 'block';
            return;
        }

        sendResetButton.disabled = true;
        sendResetButton.textContent = 'Enviando...';
        resetMessage.style.display = 'none';

        try {
            await auth.sendPasswordResetEmail(resetEmail);

            resetMessage.textContent = 'Correo de restablecimiento enviado. Revisa tu bandeja de entrada.';
            resetMessage.className = 'success-message';
            resetMessage.style.display = 'block';

            // Reset form after 3 seconds
            setTimeout(() => {
                resetPasswordForm.style.display = 'none';
                loginForm.style.display = 'block';
                resetMessage.style.display = 'none';
                document.getElementById('resetEmail').value = '';
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);

            let errorText = 'Error al enviar el correo. Por favor, intenta de nuevo.';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorText = 'Correo electrónico inválido.';
                    break;
                case 'auth/user-not-found':
                    errorText = 'No existe una cuenta con este correo electrónico.';
                    break;
            }

            resetMessage.textContent = errorText;
            resetMessage.className = 'error-message';
            resetMessage.style.display = 'block';
        } finally {
            sendResetButton.disabled = false;
            sendResetButton.textContent = 'Enviar Enlace';
        }
    });
}

// Dashboard page functionality
if (isDashboardPage) {
    const logoutButton = document.getElementById('logoutButton');

    // Handle logout
    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            // Auth state observer will handle redirect
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
        }
    });
}

// Helper function to get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Export for use in other files
window.getCurrentUser = getCurrentUser;
