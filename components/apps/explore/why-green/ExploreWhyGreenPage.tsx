'use client';
import React from 'react';
import ExploreWhyGreenBase from './ExploreWhyGreenBase';

interface ExploreWhyGreenPageProps {
  entryId?: string;
}

export default function ExploreWhyGreenPage({ entryId }: ExploreWhyGreenPageProps) {
  return <ExploreWhyGreenBase entryId={entryId} />;
}