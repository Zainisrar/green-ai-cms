/** Match the public protocol, including HTTPS terminated by a reverse proxy. */
export function usesSecureAuthCookie(request: {
    headers: { get(name: string): string | null };
    url: string;
}): boolean {
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0].trim().toLowerCase();
    return forwardedProtocol ? forwardedProtocol === 'https' : new URL(request.url).protocol === 'https:';
}
