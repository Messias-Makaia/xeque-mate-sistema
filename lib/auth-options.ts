import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.ativo) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.senha
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          name: user.nome,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Carrega permissões ao fazer login
        const userRoles = await prisma.userRole.findMany({
          where: { userId: user.id },
          include: {
            role:{
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        });

        const perms = new Set<string>();
        for (const ur of userRoles) {
          if(ur.role.ativo)
          for (const rp of ur.role.permissions) {
            if(rp.permission.ativo) perms.add(rp.permission.nome);
          }
        }

        token.id = user.id;
        token.nome = (user as any).nome;
        token.permissions = Array.from(perms);
        token.roles = userRoles.map((ur) => ur.role.nome);
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.nome = token.nome;
        session.user.permissions = token.permissions ?? [];
        session.user.roles = token.roles ?? [];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};