import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { query } from '@/lib/db';
import NextAuth from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码');
        }

        const result = await query(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email]
        );

        if (result.rows.length === 0) {
          throw new Error('用户不存在');
        }

        const user = result.rows[0];
        const isValid = await compare(credentials.password, user.password_hash);

        if (!isValid) {
          throw new Error('密码错误');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);

export async function getServerSession() {
  const request = new Request(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
    headers: {
      cookie: typeof document === 'undefined' ? '' : document.cookie,
    },
  });

  const response = await fetch(request);
  if (!response.ok) {
    return null;
  }

  const session = await response.json();
  return session || null;
}
