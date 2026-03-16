import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { ADMIN_CONFIG } from '@/packages/config/admin';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Farcaster',
      credentials: {
        fid: { label: 'FID', type: 'text' },
        username: { label: 'Username', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.fid || !credentials?.username) {
          return null;
        }

        const fid = parseInt(credentials.fid, 10);
        const username = credentials.username;

        let user = await db.user.findUnique({
          where: { fid },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              fid,
              username,
              isAdmin: fid === ADMIN_CONFIG.fid || username === ADMIN_CONFIG.username,
            },
          });
        } else {
          await db.user.update({
            where: { id: user.id },
            data: { username },
          });
        }

        return {
          id: user.id,
          fid: user.fid,
          name: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fid = user.fid;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.fid = token.fid as number;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
