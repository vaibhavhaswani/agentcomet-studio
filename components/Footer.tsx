import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link href="/" className="mb-4 flex items-center space-x-3">
            <Image src="/logo_bg.png" alt="AgentComet" width={28} height={28} className="h-7 w-7 rounded-md object-contain" />
            <span className="text-lg font-bold tracking-tight text-white">AgentComet Local</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-gray-400">
            Self-hosted registry for local agent development, versioning, and one-click publish handoff to AgentComet Hub.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Platform</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/dashboard" className="transition-colors hover:text-brand-accent">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/signup" className="transition-colors hover:text-brand-accent">
                Local signup
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Connect</h3>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" className="transition-colors hover:text-white">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="transition-colors hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="transition-colors hover:text-white">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

