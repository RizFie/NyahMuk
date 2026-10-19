'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

interface SectionNavLinkProps {
  id: string;
  href?: string;
  className?: string;
  children: ReactNode;
}

export default function SectionNavLink({
  id,
  href = `/#${id}`,
  className,
  children,
}: SectionNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') {
      event.preventDefault();
      router.push(`/#${id}`);
      return;
    }

    const element = document.getElementById(id);
    if (!element) return;

    event.preventDefault();
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
