import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/transactions
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const result = await query(
    `SELECT t.*, a.name as account_name, c.name as category_name
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1
    ORDER BY t.trans_date DESC, t.created_at DESC
    LIMIT 50`,
    [session.user.id]
  );

  return NextResponse.json({ transactions: result.rows });
}

// POST /api/transactions
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, type, amount, categoryId, note, transDate } = body;

  const result = await query(
    `INSERT INTO transactions (user_id, account_id, type, amount, category_id, note, trans_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [session.user.id, accountId, type, amount, categoryId || null, note || null, transDate]
  );

  return NextResponse.json({ transaction: result.rows[0] }, { status: 201 });
}
