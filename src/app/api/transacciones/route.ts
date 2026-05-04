import { NextRequest, NextResponse } from 'next/server';
import { getStore, subjectFromAuth } from '@/lib/store';

export async function POST(req: NextRequest) {
  const subject = subjectFromAuth(req.headers.get('authorization'));
  if (!subject) {
    return NextResponse.json({ status: 401, mensaje: 'No autorizado', data: null }, { status: 401 });
  }

  const body = await req.json();
  const { nombre, movimientoEn, tipo, idCategoria } = body;
  const monto = Number(body.monto);

  if (!body.monto || isNaN(monto) || monto <= 0.01) {
    return NextResponse.json({ status: 400, mensaje: 'El monto es obligatorio', data: null }, { status: 400 });
  }
  if (tipo !== 'INGRESO' && tipo !== 'GASTO') {
    return NextResponse.json({ status: 400, mensaje: 'El tipo debe ser INGRESO o GASTO', data: null }, { status: 400 });
  }

  const store = getStore(subject);
  const categoria = store.categories.find(c => c.idCategoria === Number(idCategoria));

  if (!categoria) {
    return NextResponse.json({ status: 403, mensaje: 'No tienes permiso para usar esta categoria', data: null }, { status: 403 });
  }
  if (categoria.tipo !== tipo) {
    return NextResponse.json({ status: 400, mensaje: 'El tipo de la transacción no coincide con el tipo de la categoría', data: null }, { status: 400 });
  }

  const now = new Date().toISOString().slice(0, 19);
  const id = store.nextTxId++;
  const tx = {
    id,
    nombre: nombre || '',
    monto,
    movimientoEn: movimientoEn || now,
    tipo,
    idCategoria: categoria.idCategoria,
    nombreCategoria: categoria.nombre,
    iconoCategoria: categoria.icono,
    creadoEn: now,
  };
  store.transactions.unshift(tx);

  const balance = store.transactions.reduce(
    (acc, t) => (t.tipo === 'INGRESO' ? acc + t.monto : acc - t.monto),
    0
  );

  return NextResponse.json({
    status: 200,
    mensaje: 'Transaccion registrada exitosamente',
    data: { ...tx, balanceActual: balance },
  });
}
