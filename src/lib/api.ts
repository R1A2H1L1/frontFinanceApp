const BASE_URL = '/api/auth';
const TX_URL = '/api/transacciones';

async function txRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${TX_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
  const data = await res.json();
  return data as T;
}

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

export interface CategoriaData {
  idCategoria: number;
  nombre: string;
  icono: string;
  tipo: 'INGRESO' | 'GASTO';
}

export interface TransaccionInput {
  nombre: string;
  monto: number;
  movimientoEn: string;
  tipo: 'INGRESO' | 'GASTO';
  idCategoria: number;
}

export interface TransaccionCreada {
  id: number;
  nombre: string;
  monto: number;
  movimientoEn: string;
  tipo: 'INGRESO' | 'GASTO';
  nombreCategoria: string;
  iconoCategoria: string;
  balanceActual: number;
  creadoEn: string;
}

export interface TransaccionHistorial {
  id: number;
  nombre: string;
  monto: number;
  movimientoEn: string;
  tipo: 'INGRESO' | 'GASTO';
  nombreCategoria: string;
  iconoCategoria: string;
}

export interface HistorialData {
  transacciones: TransaccionHistorial[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  totalIngresos: number;
  totalGastos: number;
  balanceActual: number;
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

  categorias: (token: string) =>
    txRequest<ApiResponse<CategoriaData[]>>('/categorias', token),

  registrarTransaccion: (token: string, body: TransaccionInput) =>
    txRequest<ApiResponse<TransaccionCreada>>('', token, { method: 'POST', body: JSON.stringify(body) }),

  historial: (token: string, pagina = 0, tamano = 10) =>
    txRequest<ApiResponse<HistorialData>>(`/historial?pagina=${pagina}&tamano=${tamano}`, token),
};
