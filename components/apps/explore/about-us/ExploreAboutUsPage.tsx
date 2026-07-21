'use client';
import React from 'react';
import ExploreAboutUsBase from './ExploreAboutUsBase';

interface ExploreAboutUsPageProps {
  contentKey?: string;
}

export default function ExploreAboutUsPage({ contentKey }: ExploreAboutUsPageProps) {
  return <ExploreAboutUsBase contentKey={contentKey} />;
}