import { NextRequest, NextResponse } from 'next/server';
import { getStore, subjectFromAuth } from '@/lib/store';

export async function GET(req: NextRequest) {
  const subject = subjectFromAuth(req.headers.get('authorization'));
  if (!subject) {
    return NextResponse.json({ status: 401, mensaje: 'No autorizado', data: null }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pagina = Math.max(0, parseInt(searchParams.get('pagina') || '0'));
  const tamano = Math.max(1, parseInt(searchParams.get('tamano') || '10'));

  const store = getStore(subject);
  const all = store.transactions; // newest-first
  const start = pagina * tamano;
  const slice = all.slice(start, start + tamano);

  const totalIngresos = all.reduce((acc, t) => (t.tipo === 'INGRESO' ? acc + t.monto : acc), 0);
  const totalGastos   = all.reduce((acc, t) => (t.tipo === 'GASTO'   ? acc + t.monto : acc), 0);

  return NextResponse.json({
    status: 200,
    mensaje: 'Historial obtenido exitosamente',
    data: {
      transacciones: slice.map(({ id, nombre, monto, movimientoEn, tipo, nombreCategoria, iconoCategoria }) => ({
        id, nombre, monto, movimientoEn, tipo, nombreCategoria, iconoCategoria,
      })),
      paginaActual: pagina,
      totalPaginas: Math.max(1, Math.ceil(all.length / tamano)),
      totalElementos: all.length,
      totalIngresos,
      totalGastos,
      balanceActual: totalIngresos - totalGastos,
    },
  });
}
