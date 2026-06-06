"use client";

export default function Footer() {
  const cols = [
    {
      heading: "Product",
      links: [
        { label: "Free Trial", href: "/pricing" },
        { label: "Pricing", href: "/pricing" },
        { label: "Features", href: "/features" },
        { label: "Download for iOS", href: "https://apps.apple.com/us/app/opal-screen-time-for-focus/id1497465230" },
        { label: "Download for Mac", href: "https://opal.so/mac/download" },
        { label: "Download for Android", href: "/android" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "Scrolling Kills", href: "https://scrollingkills.us/" },
        { label: "Our Story", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Merch Store", href: "https://shop.opal.so" },
        { label: "Brand Kit", href: "https://brandkit.opal.so" },
        { label: "Contact Us", href: "/help" },
      ],
    },
    {
      heading: "Learn",
      links: [
        { label: "How to Block Instagram", href: "/blog/how-to-block-instagram-on-iphone" },
        { label: "How to Block TikTok", href: "/blog/how-to-block-tiktok-on-an-iphone" },
        { label: "How to Block Twitter", href: "/blog/how-to-block-twitter-on-an-iphone" },
        { label: "How to Block Facebook", href: "/blog/how-to-block-facebook-on-an-iphone" },
        { label: "How to use Shortcuts", href: "/blog/5-ways-to-use-opal-with-shortcuts" },
        { label: "Screen Time", href: "/screentime" },
      ],
    },
    {
      heading: "Community",
      links: [
        { label: "Community Forum", href: "https://community.opal.so/" },
        { label: "Blog", href: "/blog" },
        { label: "Screen Time Blogs", href: "/screentime-blogs" },
        { label: "Focus Coaching", href: "/purchase/focus-coaching" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: "Help Centre", href: "/help" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Privacy Policy", href: "/terms" },
        { label: "For Students", href: "/students" },
        { label: "Gift Cards", href: "/gift" },
      ],
    },
  ];

  return (
    <footer className="bg-orange-400 border-t border-white/5 py-16 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-10 md:gap-6">
          {/* Left */}
          <div className="flex flex-col gap-6 md:w-[260px] flex-shrink-0">
            <div className="text-white/40 text-[13px]">© 2026 Opal OS Corporation. All rights reserved.</div>

            {/* Socials */}
            <div className="flex gap-4 items-center">
              {[
                { href: "https://www.youtube.com/@opalapp", label: "YouTube", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 28 21" fill="none">
                    <path d="M26.0796 4.11642C25.9413 3.56386 25.6596 3.05758 25.263 2.64872C24.8664 2.23986 24.3689 1.9429 23.8209 1.78783C21.8183 1.29883 13.8079 1.29883 13.8079 1.29883C13.8079 1.29883 5.79756 1.29883 3.79497 1.8344C3.24688 1.98947 2.74941 2.28643 2.35282 2.69529C1.95622 3.10415 1.67455 3.61043 1.53624 4.16299C1.16974 6.19534 0.990462 8.25702 1.00067 10.3221C0.987601 12.4028 1.16689 14.4802 1.53624 16.5278C1.68872 17.0632 1.9767 17.5502 2.37237 17.9418C2.76804 18.3334 3.25802 18.6163 3.79497 18.7633C5.79756 19.2988 13.8079 19.2988 13.8079 19.2988C13.8079 19.2988 21.8183 19.2988 23.8209 18.7633C24.3689 18.6082 24.8664 18.3112 25.263 17.9024C25.6596 17.4935 25.9413 16.9872 26.0796 16.4347C26.4433 14.4176 26.6225 12.3717 26.6152 10.3221C26.6282 8.24147 26.4489 6.16407 26.0796 4.11642Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.9261 7.01799V13.5107L17.5548 10.2643L10.9261 7.01799Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { href: "https://x.com/opalapp", label: "X", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 21" fill="none">
                    <g clipPath="url(#cx)">
                      <path d="M2.20654 1.39941L15.2728 19.2176H20.0247L6.95843 1.39941H2.20654Z" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.20654 19.2176L9.74363 11.6805M12.4832 8.94096L20.0247 1.39941" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs><clipPath id="cx"><rect width="21" height="21" fill="white" transform="translate(0.6 0.3)"/></clipPath></defs>
                  </svg>
                )},
                { href: "https://www.instagram.com/opalapp/", label: "Instagram", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                    <g clipPath="url(#ig)">
                      <rect x="2.4" y="2.2" width="18" height="18" rx="5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="11.4" cy="11.3" r="3.4" stroke="white" strokeWidth="1.7"/>
                      <circle cx="16.5" cy="6.2" r="0.6" fill="white"/>
                    </g>
                    <defs><clipPath id="ig"><rect width="21" height="21" fill="white" transform="translate(0.9 0.8)"/></clipPath></defs>
                  </svg>
                )},
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Crest */}
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663fa64fc93a0bc041c12e4d_focus-company-crest.webp"
              alt="Focus Company Crest"
              className="w-12 h-12 object-contain opacity-70"
            />

            <div className="flex gap-3 text-[12px] text-white/30">
              <span>English</span>
              <span>·</span>
              <a href="/fr" className="hover:text-white/60 transition-colors">Français</a>
            </div>
          </div>

          {/* Right cols */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-8">
            {cols.map(col => (
              <div key={col.heading}>
                <div className="gradient-text font-semibold text-[12px] tracking-wider uppercase mb-4">{col.heading}</div>
                <div className="flex flex-col gap-2">
                  {col.links.map(link => (
                    <a key={link.label} href={link.href}
                      className="text-white/45 text-[13px] hover:text-white/80 transition-colors leading-snug">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}