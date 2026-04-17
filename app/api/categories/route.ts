import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/categories
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const result = await query(
    `SELECT c.*,
      COUNT(t.id) as transaction_count
    FROM categories c
    LEFT JOIN transactions t ON t.category_id = c.id
    WHERE c.user_id = $1
    GROUP BY c.id
    ORDER BY c.type, c.order_index, c.name`,
    [session.user.id]
  );

  return NextResponse.json({ categories: result.rows });
}

// POST /api/categories
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, icon, color } = body;

  const result = await query(
    `INSERT INTO categories (user_id, name, type, icon, color)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [session.user.id, name, type, icon || null, color || null]
  );

  return NextResponse.json({ category: result.rows[0] }, { status: 201 });
}
