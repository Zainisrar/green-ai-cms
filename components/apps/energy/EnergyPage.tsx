'use client';
import React from 'react';
import EnergyPageBase from './EnergyPageBase';

interface EnergyPageProps {
  energyId?: string;
}

export default function EnergyPage({ energyId }: EnergyPageProps) {
  return <EnergyPageBase energyId={energyId} />;
}