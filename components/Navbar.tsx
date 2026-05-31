'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: '/cook', label: 'Cook' },
    { href: '/history', label: 'History' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <Link href="/cook" className="font-bold text-orange-600 text-lg">क्या बनाना है?</Link>
      <div className="flex items-center gap-4">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${pathname.startsWith(l.href) ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}>
            {l.label}
          </Link>
        ))}
        {session?.user?.image && (
          <button onClick={() => signOut({ callbackUrl: '/' })} title="Sign out">
            <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full" />
          </button>
        )}
      </div>
    </nav>
  )
}
