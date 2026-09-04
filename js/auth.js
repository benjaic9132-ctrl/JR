// Sistema de Autenticación JR
class AuthSystem {
  constructor() {
    this.users = this.initializeUsers();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
    this.sessionCheckInterval = null;
  }

  initializeUsers() {
    // Intentar cargar usuarios de localStorage
    const stored = localStorage.getItem('jr_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored users', e);
      }
    }
    
    // Usuarios por defecto
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: this.hashPassword('admin123'),
        email: 'admin@jr.com',
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date().toISOString(),
        active: true
      },
      {
        id: 2,
        username: 'cliente1',
        password: this.hashPassword('cliente123'),
        email: 'cliente@jr.com',
        name: 'Cliente Prueba',
        role: 'client',
        createdAt: new Date().toISOString(),
        active: true
      }
    ];
    
    this.saveUsers(defaultUsers);
    return defaultUsers;
  }

  hashPassword(pass) {
    // ⚠️ ADVERTENCIA: Base64 es SOLO para desarrollo
    // En producción DEBE ser bcrypt o Argon2 en el servidor
    return btoa(pass);
  }

  validatePassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  validateLogin(username, password) {
    // Validaciones básicas
    if (!username || !password) {
      return { success: false, error: 'Usuario y contraseña requeridos' };
    }

    if (username.length < 3) {
      return { success: false, error: 'Usuario debe tener al menos 3 caracteres' };
    }

    // Buscar usuario
    const user = this.users.find(u => u.username === username);
    if (!user) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    // Validar contraseña
    if (!this.validatePassword(password, user.password)) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    if (!user.active) {
      return { success: false, error: 'Usuario desactivado' };
    }

    // Crear sesión
    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name,
      loginTime: Date.now(),
      token: this.generateToken()
    };

    localStorage.setItem('jr_session', JSON.stringify(session));
    this.startSessionTimeout();
    
    return { success: true, user: session };
  }

  generateToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  getSession() {
    const session = localStorage.getItem('jr_session');
    return session ? JSON.parse(session) : null;
  }

  isSessionValid() {
    const session = this.getSession();
    if (!session) return false;
    
    const elapsed = Date.now() - session.loginTime;
    return elapsed < this.sessionTimeout;
  }

  logout() {
    localStorage.removeItem('jr_session');
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    window.location.href = 'index.html';
  }

  startSessionTimeout() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Verificar cada minuto
    this.sessionCheckInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        this.logout();
        alert('Sesión expirada por inactividad');
      }
    }, 60000);
  }

  saveUsers(users) {
    localStorage.setItem('jr_users', JSON.stringify(users));
  }

  getAllUsers() {
    return this.users;
  }

  getUser(userId) {
    return this.users.find(u => u.id === userId);
  }

  getClientUsers() {
    return this.users.filter(u => u.role === 'client');
  }

  // Crear nuevo usuario
  createUser(username, email, password, role = 'client') {
    // Validaciones
    if (!username || !email || !password) {
      return { success: false, error: 'Todos los campos son requeridos' };
    }

    if (username.length < 3) {
      return { success: false, error: 'Usuario debe tener al menos 3 caracteres' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Contraseña debe tener al menos 6 caracteres' };
    }

    // Validar email
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Email no válido' };
    }

    // Verificar si usuario ya existe
    if (this.users.find(u => u.username === username)) {
      return { success: false, error: 'Usuario ya existe' };
    }

    if (this.users.find(u => u.email === email)) {
      return { success: false, error: 'Email ya está registrado' };
    }

    const newUser = {
      id: Math.max(...this.users.map(u => u.id), 0) + 1,
      username,
      email,
      password: this.hashPassword(password),
      name: username,
      role,
      createdAt: new Date().toISOString(),
      active: true
    };

    this.users.push(newUser);
    this.saveUsers(this.users);

    return { success: true, user: { ...newUser, password: undefined } };
  }

  // Actualizar usuario
  updateUser(userId, updates) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // No permitir cambiar ID o username
    delete updates.id;
    delete updates.username;

    // Validar email si se actualiza
    if (updates.email && updates.email !== user.email) {
      if (!this.validateEmail(updates.email)) {
        return { success: false, error: 'Email no válido' };
      }
      if (this.users.find(u => u.email === updates.email && u.id !== userId)) {
        return { success: false, error: 'Email ya está registrado' };
      }
    }

    // Validar contraseña si se actualiza
    if (updates.password) {
      if (updates.password.length < 6) {
        return { success: false, error: 'Contraseña debe tener al menos 6 caracteres' };
      }
      updates.password = this.hashPassword(updates.password);
    }

    Object.assign(user, updates);
    this.saveUsers(this.users);

    return { success: true, user: { ...user, password: undefined } };
  }

  // Eliminar usuario
  deleteUser(userId) {
    // No permitir eliminar el último admin
    if (this.users.find(u => u.id === userId)?.role === 'admin') {
      const adminCount = this.users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'No se puede eliminar el último administrador' };
      }
    }

    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    this.users.splice(index, 1);
    this.saveUsers(this.users);

    return { success: true };
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Instancia global
const auth = new AuthSystem();