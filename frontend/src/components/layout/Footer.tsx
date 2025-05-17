'use client';

import { Button } from '@/components/ui/button';
import { Github, Facebook, Coffee, Mail } from 'lucide-react';
import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="bg-[#0A2245] text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* XS layout (1 kolumn, allt staplat) */}
<div className="block sm:hidden space-y-4">
  <div>
    <p className="font-semibold mb-2">EVLink</p>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/status">Status</Link>
    </Button>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/roadmap">Roadmap</Link>
    </Button>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/releasenotes">Release Notes</Link>
    </Button>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/terms">Terms</Link>
    </Button>
  </div>

  <div>
    <p className="font-semibold mb-2">Connect</p>
    <div className="flex gap-2 flex-wrap">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-amber-400 hover:text-amber-300 hover:bg-[#0A2245]"
      >
        <a href="https://www.buymeacoffee.com/rogasp" target="_blank" rel="noopener noreferrer">
          <Coffee className="h-5 w-5" />
        </a>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
      >
        <a href="https://github.com/rogasp/evlink" target="_blank" rel="noopener noreferrer">
          <Github className="h-5 w-5" />
        </a>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
      >
        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
          <Facebook className="h-5 w-5" />
        </a>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
      >
        <a href="https://github.com/rogasp/evlink/issues" target="_blank" rel="noopener noreferrer">
          <Mail className="h-5 w-5" />
        </a>
      </Button>
    </div>
  </div>
</div>


        {/* SM layout (2 columns: text + ikoner) */}
<div className="hidden sm:grid md:hidden grid-cols-2 gap-6">
  {/* EVLink kolumn */}
  <div>
    <p className="font-semibold mb-2">EVLink</p>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/status">Status</Link>
    </Button>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/roadmap">Roadmap</Link>
    </Button>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/releasenotes">Release Notes</Link>
    </Button>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/terms">Terms</Link>
    </Button>
  </div>

  {/* Connect kolumn med ikoner */}
  <div>
    <p className="font-semibold mb-2">Connect</p>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-amber-400 hover:text-amber-300 hover:bg-[#0A2245]"
    >
      <a href="https://www.buymeacoffee.com/rogasp" target="_blank" rel="noopener noreferrer">
        <Coffee className="h-5 w-5" />
      </a>
    </Button>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
    >
      <a href="https://github.com/rogasp/evlink" target="_blank" rel="noopener noreferrer">
        <Github className="h-5 w-5" />
      </a>
    </Button>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
    >
      <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
        <Facebook className="h-5 w-5" />
      </a>
    </Button>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
    >
      <a href="https://github.com/rogasp/evlink/issues" target="_blank" rel="noopener noreferrer">
        <Mail className="h-5 w-5" />
      </a>
    </Button>
  </div>
</div>


        {/* MD layout (4 columns, 2 sections) */}
<div className="hidden md:grid lg:hidden grid-cols-4 gap-6">
  {/* Row 1: section titles */}
  <div className="col-span-2">
    <p className="font-semibold mb-2">EVLink</p>
  </div>
  <div className="col-span-2">
    <p className="font-semibold mb-2">Connect</p>
  </div>

  {/* Row 2–3: links */}
  <div>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/status">Status</Link>
    </Button>
  </div>
  <div>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/roadmap">Roadmap</Link>
    </Button>
  </div>
  <div>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-amber-400 hover:text-amber-300 hover:bg-[#0A2245]"
    >
      <a href="https://www.buymeacoffee.com/rogasp" target="_blank" rel="noopener noreferrer">
        <Coffee className="h-5 w-5" />
      </a>
    </Button>
  </div>
  <div>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
    >
      <a href="https://github.com/rogasp/evlink" target="_blank" rel="noopener noreferrer">
        <Github className="h-5 w-5" />
      </a>
    </Button>
  </div>

  <div>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/releasenotes">Release Notes</Link>
    </Button>
  </div>
  <div>
    <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
      <Link href="/terms">Terms</Link>
    </Button>
  </div>
  <div>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
    >
      <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
        <Facebook className="h-5 w-5" />
      </a>
    </Button>
  </div>
  <div>
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
    >
      <a href="https://github.com/rogasp/evlink/issues" target="_blank" rel="noopener noreferrer">
        <Mail className="h-5 w-5" />
      </a>
    </Button>
  </div>
</div>



        {/* LG layout (rubriker + shadcn-knappar med förbättrad hover) */}
        <div className="hidden lg:grid grid-cols-8 gap-4 items-start">
        {/* Rubriker */}
        <div className="col-span-4">
            <p className="font-semibold mb-2">EVLink</p>
        </div>
        <div className="col-span-4">
            <p className="font-semibold mb-2">Connect</p>
        </div>

        {/* EVLink: textknappar */}
        <div>
            <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
            <Link href="/status">Status</Link>
            </Button>
        </div>
        <div>
            <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
            <Link href="/roadmap">Roadmap</Link>
            </Button>
        </div>
        <div>
            <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
            <Link href="/releasenotes">Release Notes</Link>
            </Button>
        </div>
        <div>
            <Button asChild variant="ghost" className="justify-start text-left w-full text-gray-300 hover:text-white hover:bg-[#0A2245]">
            <Link href="/terms">Terms</Link>
            </Button>
        </div>

        {/* Connect: ikonknappar */}
        <div>
            <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-yellow-500 hover:text-yellow-300 hover:bg-[#0A2245]"
            >
            <a href="https://www.buymeacoffee.com/rogasp" target="_blank" rel="noopener noreferrer">
                <Coffee className="h-5 w-5" />
            </a>
            </Button>
        </div>
        <div>
            <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
            >
            <a href="https://github.com/rogasp/evlink" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
            </a>
            </Button>
        </div>
        <div>
            <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
            >
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
            </a>
            </Button>
        </div>
        <div>
            <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-[#0A2245]"
            >
            <a href="https://github.com/rogasp/evlink/issues" target="_blank" rel="noopener noreferrer">
                <Mail className="h-5 w-5" />
            </a>
            </Button>
        </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center py-4 text-xs text-gray-400 border-t border-white/10">
        © 2025 EVLinkHA/Roger Aspelin. All rights reserved.
      </div>
    </footer>
  );
}
