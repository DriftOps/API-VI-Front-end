import type { User, UserUpdateDTO } from '@/types/user'

const API_URL = 'http://localhost:8080/api'

export const fetchUser = async (userId: number): Promise<User> => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Erro ao carregar usuário')
  }

  return response.json()
}

export const updateUser = async (userData: UserUpdateDTO): Promise<User> => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error('Erro ao atualizar usuário')
  }

  return response.json()
}

// Para buscar o usuário atual (baseado no token)
export const fetchCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Erro ao carregar usuário atual')
  }
  const userData = await response.json()

  return {
    ...userData,
    token: token || '',
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar usuários');
  }

  return response.json();
};

export const getPendingApprovals = async (): Promise<number> => {
  const users = await getAllUsers();
  return users.filter(user => !user.approved).length;
};

export const approveUser = async (userId: number): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/users/${userId}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao aprovar usuário');
  }
};