// Utilidades compartidas

// Proteger páginas que requieren autenticación
function protectPage(requiredRole = null) {
  const session = auth.getSession();
  
  if (!session || !auth.isSessionValid()) {
    window.location.href = '../../index.html';
    return false;
  }

  if (requiredRole && session.role !== requiredRole) {
    alert('No tienes permiso para acceder a esta página');
    window.location.href = '../../index.html';
    return false;
  }

  return true;
}

// Obtener usuario actual
function getCurrentUser() {
  return auth.getSession();
}

// Logout
function logout() {
  if (confirm('¿Está seguro que desea cerrar sesión?')) {
    auth.logout();
  }
}

// Formatear fecha
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Crear elemento tabla
function createTableRow(user) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${user.username}</td>
    <td>${user.email}</td>
    <td><span class="badge badge-${user.role}">${user.role === 'admin' ? 'Admin' : 'Cliente'}</span></td>
    <td><span class="status ${user.active ? 'active' : 'inactive'}">${user.active ? 'Activo' : 'Inactivo'}</span></td>
    <td>${formatDate(user.createdAt)}</td>
    <td>
      <button class="btn-small btn-edit" onclick="editUser(${user.id})">Editar</button>
      <button class="btn-small btn-delete" onclick="deleteUserConfirm(${user.id})">Eliminar</button>
    </td>
  `;
  return tr;
}

// Mostrar notificación
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Agregar animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);