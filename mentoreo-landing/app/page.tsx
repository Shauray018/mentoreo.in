// "use client"

// import { useState } from "react"
// import {
//   Apple,
//   Globe2,
//   Lock,
//   Menu,
//   Mic,
//   Play,
//   Plus,
//   Sparkles,
//   X,
// } from "lucide-react"
// import ArcNavbar from "@/components/arc-navbar"
// const navItems = ["Max", "Mobile", "Developers", "Students", "Blog"]
// import Header from "@/components/Header"

// const cleanerFeatures = [
//   {
//     title: (
//       <>
//         <strong>Auto-archives</strong> old tabs.
//         <br />
//         No more virtual dust bunnies.
//       </>
//     ),
//     icon: "/search/icon-archive.svg",
//     image: "/search/cleaner/archiving.png",
//     badge: "Archive inactive tabs",
//     meta: "After 1 day",
//   },
//   {
//     title: (
//       <>
//         Sync your passwords across iCloud keychain
//         <br />
//         or your preferred password extension.
//       </>
//     ),
//     icon: "/search/icon-key.svg",
//     image: "/search/cleaner/passwords.png",
//     badge: "Password for literal.club",
//     meta: "••••••••••••",
//   },
//   {
//     title: (
//       <>
//         A clean and crisp reader mode
//         <br />
//         for every article.
//       </>
//     ),
//     icon: "/search/icon-book.svg",
//     image: "/search/cleaner/reader-mode.png",
//     badge: "Reader mode",
//     meta: "On",
//   },
//   {
//     title: (
//       <>
//         Go completely undercover
//         <br />
//         with incognito mode.
//       </>
//     ),
//     icon: null,
//     image: "/search/cleaner/incognito.png",
//     badge: null,
//     meta: null,
//   },
//   {
//     title: (
//       <>
//         Break language barriers with
//         <br />
//         translations on any page.
//       </>
//     ),
//     icon: "/search/icon-globe.svg",
//     image: "/search/cleaner/translations.png",
//     badge: "Translation",
//     meta: "On",
//   },
// ]

// const answerCards = [
//   {
//     title: (
//       <>
//         Get the gist
//         <br />
//         in a pinch - literally.
//       </>
//     ),
//     icon: Sparkles,
//     video: "/search/hero/hero-loop.mp4",
//   },
//   {
//     title: (
//       <>
//         Search with your voice for
//         <br />
//         lengthy questions on the go.
//       </>
//     ),
//     icon: Mic,
//     video: "/search/b4m/instant-answers.mp4",
//   },
//   {
//     title: (
//       <>
//         Lift your phone to your ear to
//         <br />
//         have a conversation with the internet.
//       </>
//     ),
//     icon: Globe2,
//     video: "/search/hero/hero-loop.mp4",
//   },
// ]

// const faqs = [
//   {
//     q: "How do I install Arc Search?",
//     a: "Download Arc Search from the Apple App Store or Google Play using the buttons at the top of this page.",
//   },
//   {
//     q: "What devices are supported?",
//     a: "Arc Search is available for iPhone and Android mobile devices.",
//   },
//   {
//     q: "How do I set Arc Search as my default mobile browser?",
//     a: "Open your device settings, choose default browser app, and select Arc Search.",
//   },
//   {
//     q: "How do I sync across mobile and desktop?",
//     a: "Sign in to Arc and enable Arc Sync to keep tabs available across Mac, Windows, and iOS.",
//   },
//   {
//     q: "How do I share feedback?",
//     a: "Use Arc's feedback options in the app or visit the Browser Company resources page.",
//   },
// ]

// function StoreButton({
//   children,
//   icon,
// }: {
//   children: React.ReactNode
//   icon: React.ReactNode
// }) {
//   return (
//     <a
//       href="#scan"
//       className="group flex w-full items-center justify-center gap-3 rounded-[10px] bg-black px-8 py-[18px] text-[18px] font-semibold leading-5 text-white transition duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
//     >
//       <span className="shrink-0">{icon}</span>
//       {children}
//       <span className="opacity-50 transition group-hover:translate-x-0.5 group-hover:scale-110 group-hover:opacity-90">
//         {"->"}
//       </span>
//     </a>
//   )
// }

// function PhoneFrame({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode
//   className?: string
// }) {
//   return (
//     <div className={`relative ${className}`}>
//       <div className="absolute -inset-2 z-10 rounded-[40px] border-8 border-white/90 shadow-[0_1.8px_8.5px_rgba(0,0,0,0.15),inset_0_0_1px_1px_rgba(0,0,0,0.12)]" />
//       <div className="h-full w-full overflow-hidden rounded-[30px] bg-white">
//         {children}
//       </div>
//     </div>
//   )
// }

// function Announcement() {
//   return (
//     <a
//       href="https://diabrowser.com?ref=arc.net"
//       className="left-0  z-50 flex h-[81px] w-full items-center justify-center overflow-hidden bg-[#2702c2] px-4 text-center font-arc-soft text-[13px] font-bold leading-4 text-white transition hover:opacity-90 sm:text-[18px] sm:leading-5 md:h-[88px] md:text-[24px] md:leading-none"
//       style={{
//         WebkitMaskImage: "url('/desktop-banner-mask-small.svg')",
//         maskImage: "url('/desktop-banner-mask-small.svg')",
//         WebkitMaskSize: "120px 88px",
//         maskSize: "120px 88px",
//       }}
//     >
//       <span className="max-w-[65ch]">
//         Meet Dia, a new AI browser from the makers of Arc {"->"}
//       </span>
//       <img
//         src="/dia-icon.png"
//         alt=""
//         className="absolute -top-4 right-3 h-[92px] w-[92px] rotate-[15deg] md:-right-[75px] md:left-[calc(50%+390px)] md:h-[100px] md:w-[100px]"
//       />
//     </a>
//   )
// }

// // function Header() {
// //   const [open, setOpen] = useState(false)

// //   return (
// //     <header className="fixed left-0 top-0 z-40 w-full px-6">
// //       <div className="flex h-14 justify-between">
// //       <div className="flex pl-60 flex-row justify-between gap-3 pt-8">
// //         <a href="#" className="flex items-center gap-2 font-arc-soft font-bold">
// //           <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm text-[#3139fb]">
// //             Arc
// //           </span>
// //         </a>
// //         <nav className="hidden items-center gap-1 md:flex">
// //           {navItems.map((item) => (
// //             <a
// //               key={item}
// //               href="#"
// //               className="rounded-lg px-3 py-2 font-arc-soft text-sm font-medium transition hover:scale-105 hover:bg-white/10"
// //             >
// //               {item}
// //             </a>
// //           ))}
// //         </nav>
// //         </div>
// //           <div className="flex flex-col justify-center items-center top-0 bg-white p-6 pb-10 rounded-b-md text-orange-600">
// //             <span className="text-[8px]">
// //               DOWNLOAD
// //             </span>
// //             hello
// //           </div>
// //         <button
// //           aria-label="Toggle navigation"
// //           onClick={() => setOpen((value) => !value)}
// //           className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-white/10 md:hidden"
// //         >
// //           {open ? <X size={18} /> : <Menu size={18} />}
// //         </button>
// //       </div>
// //       {open ? (
// //         <nav className="mx-auto mt-2 flex max-w-[1138px] flex-col rounded-2xl border border-white/20 bg-black/40 p-2 text-white shadow-2xl backdrop-blur-xl md:hidden">
// //           {navItems.map((item) => (
// //             <a key={item} href="#" className="rounded-xl px-4 py-3 text-sm">
// //               {item}
// //             </a>
// //           ))}
// //         </nav>
// //       ) : null}
// //     </header>
// //   )
// // }

// function Hero() {
//   const [paused, setPaused] = useState(false)

//   return (
//     <section className="relative flex w-full flex-col items-center gap-[42px] px-3 pt-24 sm:gap-0 sm:pt-[130px]">
//       <h1 className="mb-2 text-center font-arc-soft text-[32px] font-bold leading-[1.15] tracking-[-2.2px] text-white sm:mb-[37px] sm:text-[60px] sm:leading-[0.95] sm:tracking-[-3px]">
//         Fastest way to search.
//         <br />
//         Cleanest way to browse.
//       </h1>
//       <div className="flex w-full max-w-[520px] flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row">
//         <StoreButton icon={<Apple size={18} fill="currentColor" />}>
//           Apple App Store
//         </StoreButton>
//         <StoreButton
//           icon={
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
//               <path d="m8.415 8.5-6.3-6.115A1.146 1.146 0 0 0 2 2.912V14.09c0 .214.044.392.119.534L8.415 8.5ZM8.78 8.146l1.94-1.887-7.398-4.087A1.213 1.213 0 0 0 2.738 2a.723.723 0 0 0-.247.043l6.288 6.103ZM13.456 7.771l-2.268-1.253-2.04 1.985 2.04 1.98 2.268-1.254c.726-.4.726-1.057 0-1.458ZM8.784 8.858l-6.275 6.105c.224.074.505.039.813-.13l7.402-4.093-1.94-1.882Z" />
//             </svg>
//           }
//         >
//           Google Play
//         </StoreButton>
//       </div>
//       <button
//         aria-label={paused ? "Play video" : "Pause video"}
//         onClick={() => setPaused((value) => !value)}
//         className="absolute bottom-24 right-3 z-20 grid h-7 w-7 place-items-center rounded-full border border-black/5 bg-black/10 text-white backdrop-blur transition hover:bg-black/15 sm:bottom-[8.75rem] sm:left-[calc(50%+172px)] sm:h-8 sm:w-8"
//       >
//         <Play size={14} fill="currentColor" />
//       </button>
//       <div className="flex w-full justify-center pt-8 [mask-image:linear-gradient(to_bottom,#000_250px,transparent_360px)] sm:pb-12 sm:[mask-image:linear-gradient(to_bottom,#000_200px,transparent_440px)]">
//         <PhoneFrame className="aspect-[0.6888889] w-[276px] sm:w-[308px]">
//           <video
//             className="h-full w-full object-cover"
//             muted
//             loop
//             playsInline
//             autoPlay={!paused}
//           >
//             <source src="/search/hero/hero-loop.mp4" type="video/mp4" />
//           </video>
//         </PhoneFrame>
//       </div>
//       <div className="absolute bottom-[-10px] flex w-full justify-center px-3 sm:bottom-[38px]">
//         <div className="flex w-full max-w-[400px] shrink-0 items-start gap-2 rounded-t-[40px] border border-white bg-white p-2 pb-[18px] shadow-[0_0_60px_20px_rgba(255,255,255,0.2)_inset,0_0_1px_rgba(29,43,72,0.3),0_0_30px_rgba(29,43,72,0.4)]">
//           <div className="mx-2 mt-2 flex w-full items-center gap-1 rounded-full border border-black/20 bg-black/10 px-5 py-3 text-[22px] font-medium leading-[25px] tracking-[-0.513px] text-black">
//             <span className="h-[25px]" />
//             <span className="h-full w-0.5 self-stretch bg-[#0c50ff]" />
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// function SectionTitle({ children }: { children: React.ReactNode }) {
//   return (
//     <h2 className="mb-6 text-center font-arc-soft text-[32px] font-bold leading-none tracking-[-1.6px] text-[#0e0f10] sm:mb-10 sm:text-[48px] sm:tracking-[-2.4px]">
//       {children}
//     </h2>
//   )
// }

// function BrowseForMe() {
//   const tabs = ["Instant Answers", "Recommendations", "Comparisons", "Step-by-step"]
//   const [active, setActive] = useState(0)

//   return (
//     <section className="w-full max-w-[1138px] px-3">
//       <img
//         src="/app-icon-search.png"
//         alt="Arc Icon"
//         className="mx-auto mb-3 h-[50px] w-[50px] sm:hidden"
//       />
//       <SectionTitle>
//         <span className="arc-gradient">Arc Search</span>
//         <img
//           src="/app-icon-search.png"
//           alt="Arc Icon"
//           className="mx-2 -mt-1 hidden h-[50px] w-[50px] align-middle sm:inline-block"
//         />
//         <span>is a mobile browser</span> <span>for <i>you</i></span>
//       </SectionTitle>
//       <div className="rounded-t-[30px] bg-gradient-to-t from-black/15 to-transparent p-px sm:rounded-b-[40px] sm:rounded-t-none sm:bg-gradient-to-b">
//         <div className="rounded-[inherit] bg-white bg-gradient-to-t from-[#f3f2f6]/40 to-transparent sm:bg-gradient-to-b">
//           <div className="rounded-[inherit] bg-[url('/search/grad-glow-flip.png')] bg-top bg-no-repeat px-3 py-9 sm:bg-[url('/search/grad-glow.png')] sm:bg-bottom sm:px-12 sm:py-10">
//             <div className="grid gap-[22px] lg:grid-cols-[1fr_361px_1fr] lg:items-center lg:gap-x-[52px]">
//               <p className="mx-auto max-w-[280px] px-4 text-center text-[16px] font-medium leading-[1.3] tracking-[-0.32px] text-[#0e0f10]/60 lg:text-left">
//                 Generate the perfect answer to any question with{" "}
//                 <strong className="font-medium text-[#0e0f10]">
//                   Browse for Me.
//                 </strong>
//               </p>
//               <div className="flex justify-center px-11 py-4 lg:px-2">
//                 <PhoneFrame className="aspect-[0.4630872483] w-full max-w-[276px]">
//                   <video
//                     className="h-full w-full object-cover"
//                     muted
//                     loop
//                     playsInline
//                     autoPlay
//                   >
//                     <source
//                       src="/search/b4m/instant-answers.mp4"
//                       type="video/mp4"
//                     />
//                   </video>
//                 </PhoneFrame>
//               </div>
//               <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,#000_100px,#000_calc(100%-100px),transparent_100%)] lg:col-span-3">
//                 <div className="flex justify-center gap-1.5">
//                   {tabs.map((tab, index) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActive(index)}
//                       className={`rounded-full px-5 py-[11px] pb-[9px] font-mono text-[12px] uppercase tracking-[0.6px] transition hover:opacity-100 ${
//                         active === index
//                           ? "bg-white text-[#0e0f10] opacity-100 shadow-sm"
//                           : "text-[#0e0f10] opacity-50"
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// function AdBlocker() {
//   const [position, setPosition] = useState(80)

//   return (
//     <section className="w-full max-w-[1138px] px-3">
//       <SectionTitle>
//         <span>Get what you want,</span> <span>without the noise.</span>
//       </SectionTitle>
//       <div className="rounded-b-[30px] bg-gradient-to-b from-transparent to-black/15 p-px sm:rounded-b-[40px]">
//         <div className="rounded-[inherit] bg-white bg-gradient-to-b from-transparent to-[#f3f2f6]/40">
//           <div className="rounded-[inherit] bg-[url('/search/grad-glow.png')] bg-bottom bg-no-repeat px-3 py-9 sm:px-12 sm:py-10">
//             <p className="mx-auto mb-6 max-w-[420px] text-center text-[16px] font-medium leading-6 tracking-[-0.32px] text-[#0e0f10]/60 sm:mb-8">
//               Our <strong className="font-medium text-[#0e0f10]">built-in ad blocker</strong>{" "}
//               blocks ads, trackers, pop-ups, and cookie banners.
//             </p>
//             <div className="mb-1.5 flex justify-center gap-1.5 sm:mb-6">
//               <span className="rounded-full px-5 py-[11px] pb-[9px] font-mono text-[12px] uppercase tracking-[0.6px] text-[#0e0f10] opacity-50">
//                 Other Browsers
//               </span>
//               <span className="rounded-full bg-white px-5 py-[11px] pb-[9px] font-mono text-[12px] uppercase tracking-[0.6px] text-[#0e0f10] shadow-sm">
//                 Arc Search
//               </span>
//             </div>
//             <div className="mx-auto flex w-full max-w-[276px] justify-center px-11 py-10 sm:pt-10 lg:px-2">
//               <div className="relative aspect-[0.4618473896] w-full max-w-[276px] select-none">
//                 <div
//                   className="absolute -top-[30px] z-30 h-[calc(100%+60px)] w-[37px] -translate-x-[18px] rounded-full bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur"
//                   style={{ left: `${position}%` }}
//                 />
//                 <PhoneFrame className="h-full w-full">
//                   <div className="relative h-full w-full">
//                     <img
//                       src="/search/before.png"
//                       alt="before Arc ad-blocker applied"
//                       className="absolute inset-0 h-full w-full object-cover"
//                     />
//                     <img
//                       src="/search/after.png"
//                       alt="after Arc ad-blocker applied"
//                       className="absolute inset-0 h-full w-full object-cover"
//                       style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
//                     />
//                   </div>
//                 </PhoneFrame>
//                 <input
//                   aria-label="Compare ad blocker"
//                   type="range"
//                   min="0"
//                   max="100"
//                   value={position}
//                   onChange={(event) => setPosition(Number(event.target.value))}
//                   className="absolute inset-0 z-40 h-full w-full cursor-grab opacity-0 active:cursor-grabbing"
//                 />
//               </div>
//             </div>
//             <div className="mx-3 mt-6 flex flex-col items-center gap-3 border-t border-black/10 px-3 pt-6 text-center lg:mt-[68px] lg:flex-row lg:items-start lg:gap-6 lg:px-0 lg:pt-12 lg:text-left">
//               <Lock size={18} className="mt-0.5 shrink-0 text-[#0e0f10]" />
//               <p className="shrink-0 whitespace-nowrap text-[16px] font-medium leading-6 tracking-[-0.32px]">
//                 Arc Search protects your data.
//               </p>
//               <div className="flex w-full flex-col gap-3">
//                 <p className="text-[16px] font-medium leading-[1.3] tracking-[-0.32px] text-[#0e0f10]/60">
//                   google.com contains 17 trackers watching your every move. We
//                   block every single <span className="whitespace-nowrap">one of them.</span>
//                 </p>
//                 <a
//                   href="#"
//                   className="font-mono text-[12px] uppercase leading-6 tracking-[0.6px] text-[#0c50ff] hover:underline"
//                 >
//                   learn about our privacy policy {"->"}
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// function FeatureCard({
//   feature,
// }: {
//   feature: (typeof cleanerFeatures)[number]
// }) {
//   return (
//     <article className="relative min-w-[calc(100vw-1.5rem)] scroll-mx-3 snap-center rounded-[30px] bg-gradient-to-b from-[#e0e0e0] to-transparent p-px sm:min-w-[418px] sm:max-w-[418px] sm:rounded-[40px]">
//       <div className="h-full rounded-[inherit] bg-[#f7f7f7]">
//         <div className="relative flex h-full flex-col items-center justify-between gap-3.5 rounded-[inherit] p-5 sm:gap-[22px]">
//           <p className="mt-8 text-center text-[16px] font-medium leading-[1.3] tracking-[-0.32px] text-[#0e0f10]/60">
//             {feature.title}
//           </p>
//           <div className="relative flex aspect-[0.9955752212] w-full justify-center">
//             <img
//               src={feature.image}
//               alt=""
//               className="h-full w-full object-contain"
//             />
//           </div>
//           {feature.badge ? (
//             <div className="absolute bottom-3 z-10 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-[22px] bg-white p-5 text-[14px] font-medium leading-[1.3] tracking-[-0.48px] text-black shadow-[0_0_9.443px_rgba(0,0,0,0.15)] sm:bottom-[18px] sm:w-[calc(100%-4.5rem)] sm:text-[16px]">
//               {feature.icon ? (
//                 <img src={feature.icon} alt="" className="h-8 w-8 shrink-0" />
//               ) : null}
//               <span>{feature.badge}</span>
//               <span className="ml-auto opacity-50">{feature.meta}</span>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </article>
//   )
// }

// function Cleaner() {
//   return (
//     <section className="w-full overflow-hidden">
//       <div className="px-3">
//         <SectionTitle>A lighter browsing experience</SectionTitle>
//       </div>
//       <div className="no-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto px-3 sm:justify-center sm:gap-4">
//         {cleanerFeatures.map((feature) => (
//           <FeatureCard key={feature.image} feature={feature} />
//         ))}
//       </div>
//     </section>
//   )
// }

// function AnswerCards() {
//   return (
//     <section className="w-full overflow-hidden">
//       <div className="px-3">
//         <SectionTitle>
//           With answers that meet you where you&apos;re at
//         </SectionTitle>
//       </div>
//       <div className="no-scrollbar flex snap-x snap-mandatory gap-0 overflow-x-auto px-3 sm:justify-center sm:gap-4">
//         {answerCards.map(({ title, icon: Icon, video }) => (
//           <article
//             key={video + String(title)}
//             className="min-w-[calc(100vw-1.5rem)] snap-center rounded-[30px] bg-gradient-to-b from-[#e0e0e0] to-transparent p-px transition hover:scale-[1.01] sm:min-w-[418px] sm:max-w-[418px] sm:rounded-[40px]"
//           >
//             <div className="rounded-[inherit] bg-[#f7f7f7]">
//               <div className="flex min-h-[450px] flex-col items-center justify-between gap-[30px] rounded-[inherit] p-5">
//                 <p className="mt-8 text-center text-[16px] font-medium leading-[1.3] tracking-[-0.32px] text-[#0e0f10]/60">
//                   {title}
//                 </p>
//                 <div className="relative w-full px-[59px] pb-11">
//                   <PhoneFrame className="aspect-[0.4630872483] w-full max-w-[276px]">
//                     <video
//                       className="h-full w-full object-cover"
//                       muted
//                       loop
//                       playsInline
//                       autoPlay
//                     >
//                       <source src={video} type="video/mp4" />
//                     </video>
//                   </PhoneFrame>
//                 </div>
//                 <div className="absolute bottom-5 grid h-10 w-10 place-items-center rounded-full bg-white text-[#0c50ff] shadow-md">
//                   <Icon size={19} />
//                 </div>
//               </div>
//             </div>
//           </article>
//         ))}
//       </div>
//     </section>
//   )
// }

// function SyncSection() {
//   return (
//     <section className="w-full max-w-[1138px] px-3">
//       <SectionTitle>Pick up where you left off, on any device</SectionTitle>
//       <div className="rounded-b-[30px] bg-gradient-to-b from-transparent to-black/15 p-px sm:rounded-b-[40px]">
//         <div className="rounded-[inherit] bg-white bg-gradient-to-b from-transparent to-[#f3f2f6]/40">
//           <div className="rounded-[inherit] px-3 pb-0 pt-2 sm:px-12 sm:pt-10">
//             <p className="mx-auto mb-4 max-w-[500px] text-center text-[16px] font-medium leading-[20.8px] tracking-[-0.32px] text-[#0e0f10]/60">
//               Your Arc tabs sync instantly across Mac, Windows and iOS using{" "}
//               <strong className="text-[#0e0f10]">Arc Sync</strong>.
//             </p>
//             <p className="mb-6 text-center font-mono text-[12px] uppercase leading-6 tracking-[0.6px] text-[#0c50ff]">
//               Learn more about Arc sync {"->"}
//             </p>
//             <div className="aspect-[3.4315068493] max-h-[292px] w-full bg-[url('/search/sync-screens.png')] bg-contain bg-bottom bg-no-repeat" />
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// function QrCode() {
//   return (
//     <div className="grid h-[178px] w-[178px] grid-cols-[repeat(29,1fr)] grid-rows-[repeat(29,1fr)] rounded-[22px] border border-black/10 bg-[#f3f2f6]/40 p-[18px] transition hover:scale-[1.02]">
//       {Array.from({ length: 29 * 29 }).map((_, index) => {
//         const x = index % 29
//         const y = Math.floor(index / 29)
//         const finder =
//           (x < 7 && y < 7) || (x > 21 && y < 7) || (x < 7 && y > 21)
//         const dot = finder
//           ? x === 0 ||
//             y === 0 ||
//             x === 6 ||
//             y === 6 ||
//             (x > 1 && x < 5 && y > 1 && y < 5) ||
//             (x > 23 && x < 27 && y > 1 && y < 5) ||
//             (x > 1 && x < 5 && y > 23 && y < 27)
//           : (x * 7 + y * 11 + x * y) % 5 === 0 ||
//             (x + y * 3) % 7 === 0 ||
//             (x > 10 && x < 19 && y > 10 && y < 19 && (x + y) % 2 === 0)
//         return (
//           <span
//             key={index}
//             className={dot ? "rounded-[1px] bg-[#0c50ff]" : ""}
//           />
//         )
//       })}
//     </div>
//   )
// }

// function Faq() {
//   const [open, setOpen] = useState<number | null>(null)

//   return (
//     <section className="w-full max-w-[1138px] px-3">
//       <div className="rounded-[30px] border border-black/10 bg-[#f3f2f6]/40 px-6 py-5 sm:rounded-[40px] sm:px-12 sm:py-10">
//         <div className="flex flex-col gap-12">
//           <div className="flex flex-col items-center gap-6 text-center">
//             <h2 id="scan" className="font-arc-soft text-[32px] font-bold leading-[0.975] tracking-[-0.05em] text-[#0e0f10] sm:text-[45.51px] sm:leading-[42.25px]">
//               Better is possible.
//               <br />
//               Meet the internet again.
//             </h2>
//             <p className="text-[16px] font-medium leading-5 tracking-[-0.32px] text-[#0e0f10]/60">
//               Scan this QR code with your phone
//               <br />
//               to download Arc Search.
//             </p>
//             <QrCode />
//           </div>
//           <div className="flex flex-col gap-3">
//             {faqs.map((faq, index) => (
//               <div key={faq.q} className="rounded-2xl bg-white/70">
//                 <button
//                   onClick={() => setOpen(open === index ? null : index)}
//                   className="flex w-full items-stretch gap-2 px-5 py-4 text-left text-[16px] font-medium tracking-[-0.32px] text-[#0e0f10] transition hover:text-[#0c50ff]"
//                 >
//                   <Plus
//                     size={16}
//                     className={`mt-1 shrink-0 text-[#0c50ff] transition ${
//                       open === index ? "rotate-45" : ""
//                     }`}
//                   />
//                   <span>{faq.q}</span>
//                 </button>
//                 <div
//                   className={`grid transition-all duration-200 ${
//                     open === index
//                       ? "grid-rows-[1fr] opacity-100"
//                       : "grid-rows-[0fr] opacity-0"
//                   }`}
//                 >
//                   <p className="overflow-hidden px-10 pb-4 text-[14px] leading-5 text-[#0e0f10]/60">
//                     {faq.a}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// function Footer() {
//   return (
//     <footer className="w-full bg-[#3139fb] bg-[url('/noise-light.png')] px-8 py-12 text-[#fffcec] sm:px-16">
//       <div className="mx-auto flex max-w-[1138px] flex-col gap-8 text-[12px] font-semibold tracking-[0.025rem] sm:flex-row sm:items-start">
//         <a href="#" className="font-arc-soft text-3xl font-bold">
//           Arc
//         </a>
//         <div className="flex flex-col gap-8 sm:flex-row">
//           <div className="flex flex-col items-start gap-2">
//             <p className="font-mono uppercase">Product</p>
//             {["Download", "Privacy Policy", "Terms of Use", "Security", "Arc Max"].map(
//               (item) => (
//                 <a key={item} href="#" className="hover:underline">
//                   {item}
//                 </a>
//               ),
//             )}
//           </div>
//           <div className="flex flex-col items-start gap-2">
//             <p className="font-mono uppercase">Resources</p>
//             {["Resource Center", "Release Notes", "Students", "FAQ", "Careers @ BCNY"].map(
//               (item) => (
//                 <a key={item} href="#" className="hover:underline">
//                   {item}
//                 </a>
//               ),
//             )}
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }

// export default function Page() {
//   return (
//     <>
//       <Header />
//       <main className="arc-page relative flex min-h-screen flex-col items-center gap-[42px] overflow-hidden bg-white bg-[url('/search/grad-smooth.png')] bg-[center_-60px] bg-no-repeat pb-20 pt-24 text-[#0e0f10] before:absolute before:inset-0 before:bg-[url('/noise-light.png')] before:opacity-40 before:content-[''] sm:gap-[82px] sm:bg-[center_top]">
//         <div className="relative z-10 flex w-full flex-col items-center gap-[82px]">
//           <Hero />
//           <BrowseForMe />
//           <AdBlocker />
//           <Cleaner />
//           <AnswerCards />
//           <SyncSection />
//           <Faq />
//         </div>
//       </main>
//       <Footer />
//     </>
//   )
// }
import Navbar from "@/components/arc-navbar";
import CoreFeatures from "@/components/CoreFeatures";
import Introduction from "@/components/Devices";
import FullWidthCTA from "@/components/FullWidthCTA";
import HallOfGems from "@/components/HallOfGems";
import HeroSection from "@/components/HeroSection";
import ImpactSection from "@/components/Impact";
import LaunchVideo from "@/components/LaunchVideo";
import ProblemStatement from "@/components/ProblemStatement";
import Testimonials from "@/components/Testimonials";
import UseCases from "@/components/UseCases";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#0a0a0f] text-white">
      <Navbar />
      <HeroSection />
      <LaunchVideo />
      <ProblemStatement />
      <CoreFeatures />
      <Testimonials />
      <HallOfGems />
      <UseCases />
      <FullWidthCTA />
    </main>
  );
}
