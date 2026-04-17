import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码必填' },
        { status: 400 }
      );
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name || email.split('@')[0]]
    );

    return NextResponse.json({
      user: {
        id: result.rows[0].id.toString(),
        email: result.rows[0].email,
        name: result.rows[0].name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
