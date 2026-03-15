// import NextAuth from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       nome: string;
//       email: string;
//       permissions: string[];
//       roles: string[];
//     };
//   }

//   interface User {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//   }
// }

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      permissions: string[];
      roles: string[];
    };
  }

  interface User {
    id: string;
    nome: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nome: string;
    permissions: string[];
    roles: string[];
  }
}
