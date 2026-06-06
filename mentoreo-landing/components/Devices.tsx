

"use client";

export default function Introduction() {
  return (
    <section id="download-opal" className="bg-[#0a0a0f] py-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[clamp(28px,4vw,52px)] font-bold tracking-[-0.02em] text-white mb-5">
            Available on iPhone, Mac and Android
          </h3>
          <p className="text-white/55 text-[clamp(15px,1.3vw,18px)] mb-8 max-w-[560px] mx-auto">
            Better than screen time settings, Opal helps you focus on what matters so you can make the most out of every day.
          </p>
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <a href="https://apps.apple.com/us/app/opal-screen-time-control/id1497465230" target="_blank" rel="noopener noreferrer" className="hover:opacity-85 transition-opacity">
              <img src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6a104f4e777956264d5dac6d_ios.svg" alt="Download on the App Store" className="h-12 w-auto"/>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.withopal.opal" target="_blank" rel="noopener noreferrer" className="hover:opacity-85 transition-opacity">
              <img src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6a104f4e3c48087d9ed94550_Google.svg" alt="Get it on Google Play" className="h-12 w-auto"/>
            </a>
            <a href="https://opalapp.com/mac/download" target="_blank" rel="noopener noreferrer" className="hover:opacity-85 transition-opacity">
              <img src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6a104f4e43627525022120de_Mac.svg" alt="Download for Mac" className="h-12 w-auto"/>
            </a>
          </div>
        </div>

        {/* Devices mockup */}
        <div className="relative flex items-end justify-center gap-4 md:gap-0">
          {/* iPhone */}
          <div className="relative z-10 w-[38%] max-w-[240px] flex-shrink-0 -mr-6 md:-mr-10">
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6637b61597d41e9d5a192360_iphone-frame-p-500.png"
              alt="iPhone frame"
              className="w-full relative z-10"
            />
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663bfdc6c6f68b2142cfd8a9_video-p-500.webp"
              alt="iPhone screen"
              className="absolute inset-[6%] rounded-[14%] object-cover z-0"
            />
          </div>

          {/* MacBook */}
          <div className="relative w-[72%] max-w-[640px] flex-shrink-0">
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6637ddb56a7207c608bd5659_macbook-pro-frame-p-500.avif"
              alt="MacBook frame"
              className="w-full relative z-10"
            />
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6638040faa512fb39979982d_macos-block-screen-3-p-800.webp"
              alt="MacBook screen"
              className="absolute top-[6%] left-[12.5%] w-[75%] rounded-[2%] object-cover z-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

<div className="relative mx-auto flex mt-24 w-full max-w-[500px]  items-end justify-center md:h-[560px]">
          {/* iPhone */}
          <div className="relative aspect-[500/1012] w-[68%] min-w-[220px] max-w-[320px]">
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663bfdc6c6f68b2142cfd8a9_video-p-500.webp"
              alt=""
              aria-hidden="true"
              className="absolute left-[2%] top-[1.8%] h-[97%] w-[96%] rounded-[12%] object-cover"
            />
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/6637b61597d41e9d5a192360_iphone-frame-p-500.png"
              alt="iPhone app preview"
              className="relative z-10 h-full w-full object-contain"
            />
          </div>
        </div>