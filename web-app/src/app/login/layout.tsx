'use client';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[LOGIN_LAYOUT] Login layout loaded - CLIENT COMPONENT');
  return <>{children}</>;
}

