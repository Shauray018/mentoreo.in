"use client";

import Link from "next/link";
import GithubIcon from "@/components/ui/github-icon";
import InstagramIcon from "@/components/ui/instagram-icon";
import TwitterXIcon from "@/components/ui/twitter-x-icon";

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/mentoreo",
    Icon: TwitterXIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/mentoreo",
    Icon: GithubIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mentoreo/",
    Icon: InstagramIcon,
  },
];

const pageLinks = [
  { label: "Account deletion", href: "/account-deletion" },
  { label: "Privacy policy", href: "/privacy-policy" },
];

export default function FullWidthCTA() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-6 py-8 text-zinc-700">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-center text-sm text-zinc-500 sm:text-left">
          © 2026 Mentoreo. Made with care for students, by students.
        </p>

        <nav aria-label="Social links" className="flex items-center gap-3">
          {socialLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex size-12  items-center justify-center rounded-full text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Icon size={30} strokeWidth={1.8} />
            </a>
          ))}
        </nav>

        <nav
          aria-label="Legal links"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
        >
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
