export interface Category {
  idCategoria: number;
  nombre: string;
  icono: string;
  tipo: 'INGRESO' | 'GASTO';
}

export interface Transaction {
  id: number;
  nombre: string;
  monto: number;
  movimientoEn: string;
  tipo: 'INGRESO' | 'GASTO';
  idCategoria: number;
  nombreCategoria: string;
  iconoCategoria: string;
  creadoEn: string;
}

interface ClientStore {
  categories: Category[];
  transactions: Transaction[];
  nextTxId: number;
}

const DEFAULT_CATEGORIES: Omit<Category, 'idCategoria'>[] = [
  { nombre: 'Salario',          icono: '💼', tipo: 'INGRESO' },
  { nombre: 'Freelance',        icono: '💻', tipo: 'INGRESO' },
  { nombre: 'Otros ingresos',   icono: '💰', tipo: 'INGRESO' },
  { nombre: 'Comida',           icono: '🍔', tipo: 'GASTO'   },
  { nombre: 'Transporte',       icono: '🚌', tipo: 'GASTO'   },
  { nombre: 'Servicios',        icono: '💡', tipo: 'GASTO'   },
  { nombre: 'Entretenimiento',  icono: '🎮', tipo: 'GASTO'   },
];

// Attached to global so hot-reload in dev doesn't wipe data
const g = global as typeof global & { __financeStore?: Map<string, ClientStore> };
if (!g.__financeStore) g.__financeStore = new Map();
const stores = g.__financeStore;

export function getStore(subject: string): ClientStore {
  if (!stores.has(subject)) {
    stores.set(subject, {
      categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, idCategoria: i + 1 })),
      transactions: [],
      nextTxId: 1,
    });
  }
  return stores.get(subject)!;
}

export function subjectFromAuth(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const parts = authHeader.slice(7).split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
