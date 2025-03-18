import "next-auth";
import { JWT } from "next-auth/jwt";
import { Account, Profile, User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubUsername?: string;
    };
  }

  interface User {
    githubUsername?: string;
  }

  interface JWT {
    githubUsername?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubUsername?: string;
  }
}

export interface SignInParams {
  user: User;
  account: Account | null;
  profile?: Profile;
  email?: { verificationRequest?: boolean };
  credentials?: Record<string, any>;
} 