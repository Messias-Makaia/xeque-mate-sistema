import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from "@/lib/db";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// auth.ts (callbacks)
// callbacks: {
//   async jwt({ token, user }) {
//     if (user) {
//       // Carrega permissões do utilizador ao fazer login
//       const roles = await prisma.userRole.findMany({
//         where: { userId: user.id },
//         include: {
//           role: {
//             include: {
//               permissions: { include: { permission: true } }
//             }
//           }
//         }
//       });

//       const perms = new Set<string>();
//       for (const ur of roles) {
//         for (const rp of ur.role.permissions) {
//           if (rp.permission.ativo) perms.add(rp.permission.nome);
//         }
//       }

//       token.id = user.id;
//       token.nome = user.nome;
//       token.permissions = Array.from(perms);
//       token.roles = roles.map(ur => ur.role.nome);
//     }
//     return token;
//   },

//   async session({ session, token }) {
//     session.user.id = token.id as string;
//     session.user.nome = token.nome as string;
//     session.user.permissions = token.permissions as string[];
//     session.user.roles = token.roles as string[];
//     return session;
//   }
// }