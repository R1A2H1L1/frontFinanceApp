import { NextRequest, NextResponse } from 'next/server';
import { getStore, subjectFromAuth } from '@/lib/store';

export async function GET(req: NextRequest) {
  const subject = subjectFromAuth(req.headers.get('authorization'));
  if (!subject) {
    return NextResponse.json({ status: 401, mensaje: 'No autorizado', data: null }, { status: 401 });
  }

  const store = getStore(subject);

  return NextResponse.json({
    status: 200,
    mensaje: 'Categorias obtenidas exitosamente',
    data: store.categories,
  });
}
