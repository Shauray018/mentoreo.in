"use client";

const videos = [
  { href: "https://youtu.be/u22rrhAPNwM", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/68fa2fdccf09f60d16d0e5c9_BG%20Thumb.png" },
  { href: "https://youtu.be/AIqgkc7eaF0", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/68b9483c8746c6915e2eef69_Slide%2016_9%20-%2077.jpg" },
  { href: "https://youtu.be/cjQpA-KU0N0", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/68b947dbaf98d63b31edcac5_Screenshot%202025-09-02%20at%2012.19.57%201.png" },
  { href: "https://youtu.be/K231oY133FY", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/687dfce43263e4b2f781d40d_25Yrs.png" },
  { href: "https://youtu.be/mtHdpVv-LoI", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/678e71236afc452bfba4158b_maxresdefault%20(23).jpg" },
  { href: "https://youtu.be/eSngAAKDLQg", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/67f69e137616f4384827f3ad_Thumbnail%20(1)%20(1).jpg" },
  { href: "https://www.youtube.com/watch?v=zEQgoPBOz_s", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/66fa9e82635f83cedba0a458_3%20(1).webp" },
  { href: "https://www.youtube.com/watch?v=QMtbqLCMeEY", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/66fa9341d0ef087a9abcd424_CEO%20REACTION%20(1).webp" },
  { href: "https://youtu.be/oiMBqQFjE7M", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/66fa781922a2f95a79e7e89b_maxresdefault.webp" },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="bg-zinc-100 py-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 text-center mb-10">
        <h3 className="text-[clamp(28px,4vw,52px)] font-bold tracking-[-0.02em] text-white mb-3">
          Stay in the Loop
        </h3>
        <p className="text-white/55 text-[clamp(15px,1.3vw,18px)] mb-6">
          Join the community and learn how other Gems use Opal for focus
        </p>
        <a
          href="https://community.opal.so/"
          className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
        >
          <span className="gradient-text text-[13px] font-semibold">Join Community Forum</span>
        </a>
      </div>

      {/* Video slider */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 px-6 pb-4" style={{ width: "max-content" }}>
          {videos.map((v, i) => (
            <a
              key={i}
              href={v.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[280px] md:w-[340px] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            >
              <img src={v.img} alt="" className="w-full h-auto aspect-video object-cover" />
            </a>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-white/50 text-[14px] mb-4">
          Check out our YouTube channel to learn more about Opal
        </p>
        <a href="https://www.youtube.com/@opalapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/66fa7013efa64f6ca62438ab_yt_logo_rgb_dark.avif" alt="YouTube" className="h-7 w-auto" />
        </a>
      </div>
    </section>
  );
}