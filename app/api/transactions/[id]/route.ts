import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// PUT /api/transactions/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, type, amount, categoryId, note, transDate } = body;

  // Verify ownership
  const existing = await query(
    'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
    [params.id, session.user.id]
  );

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: '交易不存在' }, { status: 404 });
  }

  const result = await query(
    `UPDATE transactions
     SET account_id = $1, type = $2, amount = $3, category_id = $4, note = $5, trans_date = $6
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [accountId, type, amount, categoryId || null, note || null, transDate, params.id, session.user.id]
  );

  return NextResponse.json({ transaction: result.rows[0] });
}

// DELETE /api/transactions/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  // Verify ownership
  const existing = await query(
    'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
    [params.id, session.user.id]
  );

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: '交易不存在' }, { status: 404 });
  }

  await query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [params.id, session.user.id]
  );

  return NextResponse.json({ success: true });
}
