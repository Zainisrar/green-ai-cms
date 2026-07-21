'use client';
import { ReactNode, ComponentType } from 'react';
import dynamic from 'next/dynamic';

interface PerfectScrollbarProps {
    className?: string;
    children: ReactNode;
    containerRef?: (ref: HTMLElement | null) => void;
    options?: any;
    onScrollY?: (container: HTMLElement) => void;
    onScrollX?: (container: HTMLElement) => void;
    onScrollUp?: (container: HTMLElement) => void;
    onScrollDown?: (container: HTMLElement) => void;
    onScrollLeft?: (container: HTMLElement) => void;
    onScrollRight?: (container: HTMLElement) => void;
    onYReachStart?: (container: HTMLElement) => void;
    onYReachEnd?: (container: HTMLElement) => void;
    onXReachStart?: (container: HTMLElement) => void;
    onXReachEnd?: (container: HTMLElement) => void;
}

// Dynamically import with no SSR to avoid type issues
const PerfectScrollbarLib = dynamic(() => import('react-perfect-scrollbar'), {
    ssr: false,
}) as ComponentType<PerfectScrollbarProps>;

const PerfectScrollbar = ({ children, containerRef, ...props }: PerfectScrollbarProps) => {
    // Ensure containerRef is a function or provide a no-op function
    const safeContainerRef = typeof containerRef === 'function' ? containerRef : () => {};
    
    return (
        <PerfectScrollbarLib 
            {...props} 
            containerRef={safeContainerRef}
        >
            {children}
        </PerfectScrollbarLib>
    );
};

export default PerfectScrollbar;
