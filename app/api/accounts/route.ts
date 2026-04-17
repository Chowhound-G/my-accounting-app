import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/accounts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const result = await query(
    `SELECT a.*,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'), 0) -
      COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) as current_balance
    FROM accounts a
    LEFT JOIN transactions t ON t.account_id = a.id
    WHERE a.user_id = $1 AND a.is_active = true
    GROUP BY a.id, a.name, a.type, a.currency
    ORDER BY a.order_index, a.created_at`,
    [session.user.id]
  );

  return NextResponse.json({ accounts: result.rows });
}

// POST /api/accounts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, currency = 'CNY', initialBalance = 0 } = body;

  const result = await query(
    `INSERT INTO accounts (user_id, name, type, currency, initial_balance)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [session.user.id, name, type, currency, initialBalance]
  );

  return NextResponse.json({ account: result.rows[0] }, { status: 201 });
}
