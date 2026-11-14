'use client';

import React, { ReactNode, useMemo } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient, ConvexProvider } from 'convex/react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const convex = useMemo(() => {
    if (convexUrl) {
      try {
        return new ConvexReactClient(convexUrl);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  // Graceful Fallback 1: Neither Convex nor Clerk is configured in .env yet
  if (!convex) {
    return <>{children}</>;
  }

  // Graceful Fallback 2: Convex is configured, but Clerk Publishable Key is not yet set
  if (!clerkPublishableKey) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  // Full-Stack Production Setup: Clerk + Convex Authenticated Client
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

