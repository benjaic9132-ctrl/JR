// Manejador de formulario de login
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  const loginButton = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Limpiar mensaje de error
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Validaciones
    if (!username || !password) {
      showError('Por favor completa todos los campos');
      return;
    }

    // Deshabilitar botón durante login
    loginButton.disabled = true;
    loginButton.textContent = 'Iniciando sesión...';

    // Simular delay de red
    setTimeout(() => {
      const result = auth.validateLogin(username, password);

      if (result.success) {
        // Redirigir según rol
        if (result.user.role === 'admin') {
          window.location.href = 'pages/admin/dashboard.html';
        } else {
          window.location.href = 'pages/client/dashboard.html';
        }
      } else {
        showError(result.error);
        loginButton.disabled = false;
        loginButton.textContent = 'Iniciar Sesión';
        passwordInput.value = '';
      }
    }, 500);
  });

  // Enter para enviar
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loginForm.dispatchEvent(new Event('submit'));
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.color = '#e74c3c';
    errorMessage.style.marginTop = '12px';
    errorMessage.style.fontSize = '13px';
  }
});