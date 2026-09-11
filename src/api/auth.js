import apiClient from './client';

/**
 * Normalizes backend Django uppercase roles to frontend route & UI keys:
 * - 'STUDENT' / 'CANDIDATE' -> 'student'
 * - 'RECRUITER' -> 'industry'
 * - 'ACADEMIA' -> 'academician'
 */
export const toFrontendRole = (backendRole) => {
  if (!backendRole) return 'student';
  const role = backendRole.toUpperCase();
  if (role === 'STUDENT' || role === 'CANDIDATE') return 'student';
  if (role === 'RECRUITER') return 'industry';
  if (role === 'ACADEMIA') return 'academician';
  if (role === 'ADMIN') return 'admin';
  return role.toLowerCase();
};

/**
 * Normalizes frontend UI keys to backend Django uppercase roles:
 * - 'student' -> 'STUDENT'
 * - 'industry' -> 'RECRUITER'
 * - 'academician' -> 'ACADEMIA'
 */
export const toBackendRole = (frontendRole) => {
  if (!frontendRole) return 'STUDENT';
  const role = frontendRole.toLowerCase();
  if (role === 'student') return 'STUDENT';
  if (role === 'industry') return 'RECRUITER';
  if (role === 'academician') return 'ACADEMIA';
  if (role === 'admin') return 'ADMIN';
  return role.toUpperCase();
};

export const authService = {
  /**
   * Log in user with username or email and password
   */
  async login({ username, password }) {
    const response = await apiClient.post('/auth/login', {
      username: username.trim(),
      password,
    });

    const data = response.data;
    const token = data.access_token;
    const frontendRole = toFrontendRole(data.role);

    const user = {
      id: data.id,
      username: data.username || username.trim(),
      email: data.email || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      role: frontendRole,
      backend_role: data.role,
      is_email_verified: !!data.is_email_verified,
      access_token: token,
    };

    if (token) {
      sessionStorage.setItem('skillsetu_token', token);
    }
    sessionStorage.setItem('skillsetu_user', JSON.stringify(user));

    return user;
  },

  /**
   * Register a new user account across student, academician, or industry roles
   */
  async register(formData) {
    const backendRole = toBackendRole(formData.profession || formData.role);

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: backendRole,
      first_name: formData.firstname ? formData.firstname.trim() : undefined,
      last_name: formData.lastname ? formData.lastname.trim() : undefined,
      phone_number: formData.phone_number || undefined,
    };

    const response = await apiClient.post('/auth/register', payload);
    const data = response.data;

    let token = data.access_token;
    // If backend returns token directly from register
    if (token) {
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name || formData.firstname || '',
        last_name: data.last_name || formData.lastname || '',
        role: toFrontendRole(data.role),
        backend_role: data.role,
        is_email_verified: !!data.is_email_verified,
        access_token: token,
      };

      sessionStorage.setItem('skillsetu_token', token);
      sessionStorage.setItem('skillsetu_user', JSON.stringify(user));
      return user;
    }

    return await this.login({
      username: formData.username,
      password: formData.password,
    });
  },

  async getCurrentUser() {
    const token = sessionStorage.getItem('skillsetu_token');
    if (!token) return null;

    const response = await apiClient.get('/auth/me');
    const data = response.data;

    const savedUser = this.getUser() || {};
    const updatedUser = {
      ...savedUser,
      id: data.id,
      username: data.username,
      email: data.email,
      role: toFrontendRole(data.role),
      backend_role: data.role,
      avatar_url: data.avatar_url,
      first_name: data.first_name || savedUser.first_name || '',
      last_name: data.last_name || savedUser.last_name || '',
      is_email_verified: !!data.is_email_verified,
      access_token: token,
    };

    sessionStorage.setItem('skillsetu_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  /**
   * Get JWT access token from sessionStorage
   */
  getToken() {
    return sessionStorage.getItem('skillsetu_token');
  },

  /**
   * Get cached user profile from sessionStorage
   */
  getUser() {
    try {
      const userStr = sessionStorage.getItem('skillsetu_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Update cached user in sessionStorage
   */
  setUser(user) {
    if (user) {
      sessionStorage.setItem('skillsetu_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('skillsetu_user');
    }
  },

  /**
   * Request a 6-digit password reset OTP sent to the user's email
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', {
      email: email.trim(),
    });
    return response.data;
  },

  /**
   * Validate the OTP code and set a new password
   */
  async resetPassword({ email, otp, new_password }) {
    const response = await apiClient.post('/auth/reset-password', {
      email: email.trim(),
      otp: otp.trim(),
      new_password,
    });
    return response.data;
  },

  async verifyEmail({ email, otp, token }) {
    const response = await apiClient.post('/auth/verify-email', {
      email: email ? email.trim() : undefined,
      otp: otp ? otp.trim() : undefined,
      token: token ? token.trim() : undefined,
    });
    const current = this.getUser();
    if (current && response.data?.is_email_verified) {
      current.is_email_verified = true;
      this.setUser(current);
    }
    return response.data;
  },

  async resendVerification(email) {
    const response = await apiClient.post('/auth/resend-verification', {
      email: email.trim(),
    });
    return response.data;
  },

  logout() {
    sessionStorage.removeItem('skillsetu_token');
    sessionStorage.removeItem('skillsetu_user');
  },
};

export default authService;

