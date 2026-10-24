/**
 * TalentHunt API Client
 */
class ApiClient {
  constructor() {
    this.token = localStorage.getItem('talenthunt_token') || null;
    this.adminToken = localStorage.getItem('talenthunt_admin_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('talenthunt_user') || 'null');
    this.currentAdmin = JSON.parse(localStorage.getItem('talenthunt_admin') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.currentUser = user;
    if (token) {
      localStorage.setItem('talenthunt_token', token);
    } else {
      localStorage.removeItem('talenthunt_token');
    }
    if (user) {
      localStorage.setItem('talenthunt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('talenthunt_user');
    }
  }

  setAdminSession(token, admin) {
    this.adminToken = token;
    this.currentAdmin = admin;
    if (token) {
      localStorage.setItem('talenthunt_admin_token', token);
    } else {
      localStorage.removeItem('talenthunt_admin_token');
    }
    if (admin) {
      localStorage.setItem('talenthunt_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('talenthunt_admin');
    }
  }

  logout() {
    this.setSession(null, null);
  }

  adminLogout() {
    this.setAdminSession(null, null);
  }

  async request(endpoint, options = {}, useAdmin = false) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const authToken = useAdmin ? (this.adminToken || this.token) : this.token;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server request failed');
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth Methods
  async getMe() {
    if (!this.token) return null;
    try {
      const data = await this.request('/api/auth/me');
      if (data.user) {
        this.currentUser = data.user;
        localStorage.setItem('talenthunt_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  async guestLogin(displayName, avatar) {
    const data = await this.request('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ display_name: displayName, avatar })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async register(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async login(credentials) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async recoverPassword(payload) {
    return this.request('/api/auth/recover-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateProfile(profileData) {
    const data = await this.request('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
    this.currentUser = { ...this.currentUser, ...data.user };
    localStorage.setItem('talenthunt_user', JSON.stringify(this.currentUser));
    return data;
  }

  // Admin Methods
  async adminLogin(credentials) {
    const data = await this.request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    this.setAdminSession(data.token, data.admin);
    return data;
  }

  async adminGetUsers() {
    return this.request('/api/auth/admin/users', { method: 'GET' }, true);
  }

  async adminResetPassword(userId, newPassword) {
    return this.request('/api/auth/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, new_password: newPassword })
    }, true);
  }

  // Content Methods
  async getSubjects() {
    return this.request('/api/content/subjects');
  }

  async getTopics(subjectId) {
    return this.request(`/api/content/topics/${subjectId}`);
  }

  async getLesson(topicId) {
    return this.request(`/api/content/lesson/${topicId}`);
  }

  async getOlympiads() {
    return this.request('/api/content/olympiads');
  }

  // Quiz Methods
  async getPracticeQuestions(topicId) {
    return this.request(`/api/quiz/practice/${topicId}`);
  }

  async getOlympiadExam(olympiadId) {
    return this.request(`/api/quiz/olympiad/${olympiadId}`);
  }

  async submitQuiz(payload) {
    return this.request('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Progress Methods
  async getLeaderboard() {
    return this.request('/api/progress/leaderboard');
  }

  async getHistory() {
    return this.request('/api/progress/history');
  }

  async getCertificate(attemptId) {
    return this.request(`/api/progress/certificate/${attemptId}`);
  }
}

window.api = new ApiClient();
