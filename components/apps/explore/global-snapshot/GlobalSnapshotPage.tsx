'use client';
import React from 'react';
import GlobalSnapshotBase from './GlobalSnapshotBase';

interface GlobalSnapshotPageProps {
  entryId?: string;
}

export default function GlobalSnapshotPage({ entryId }: GlobalSnapshotPageProps) {
  return <GlobalSnapshotBase entryId={entryId} />;
}