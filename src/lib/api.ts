const BASE_URL = 'http://98.84.30.134:8080/api/auth';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  return data as T;
}

export interface ApiResponse<T = null> {
  status: number;
  mensaje: string;
  data: T;
}

export interface RegistroData {
  id: number;
  correo: string;
  correoVerificado: boolean;
  mensaje: string;
}

export interface LoginData {
  accessToken: string;
  tokenType: string;
  expiraEn: number;
  usuario: {
    id: number;
    correo: string;
    estado: string;
    cliente: {
      idCliente: number;
      nombre: string;
      email: string;
      descripcion: string;
    };
  };
}

export interface DescripcionData {
  idCliente: number;
  nombre: string;
  email: string;
  descripcion: string;
  idUsuario: number;
  correo: string;
  estado: string;
}

export const api = {
  registro: (body: { correo: string; contrasena: string; confirmarContrasena: string }) =>
    request<ApiResponse<RegistroData>>('/registro', { method: 'POST', body: JSON.stringify(body) }),

  verificar: (body: { correo: string; codigo: string }) =>
    request<ApiResponse<null>>('/verificar', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { correo: string; contrasena: string }) =>
    request<ApiResponse<LoginData>>('/login', { method: 'POST', body: JSON.stringify(body) }),

  descripcion: (body: { correo: string; contrasena: string; descripcion: string }) =>
    request<ApiResponse<DescripcionData>>('/descripcion', { method: 'POST', body: JSON.stringify(body) }),

  reenviarCodigo: (correo: string) =>
    request<ApiResponse<null>>(`/reenviar-codigo?correo=${encodeURIComponent(correo)}`, { method: 'POST' }),
};
