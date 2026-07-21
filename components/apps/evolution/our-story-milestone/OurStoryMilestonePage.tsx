'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OurStoryMilestoneBase from './OurStoryMilestoneBase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface OurStoryMilestonePageProps {
  contentKey: string;
}

export default function OurStoryMilestonePage({ contentKey }: OurStoryMilestonePageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <OurStoryMilestoneBase contentKey={contentKey} />
      </div>
    </QueryClientProvider>
  );
}