
"use client";
import { useRef, useEffect, useState } from "react";
import { Android } from "./ui/android";
import DitherShader from "./ui/dither-shader";
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.95242 1.54022C10.1897 1.05959 10.3083 0.819268 10.4693 0.742486C10.6094 0.675682 10.7722 0.675682 10.9123 0.742486C11.0734 0.819268 11.192 1.05959 11.4292 1.54022L13.6801 6.10014C13.7501 6.24204 13.7851 6.31299 13.8363 6.36807C13.8816 6.41684 13.936 6.45636 13.9963 6.48443C14.0645 6.51614 14.1428 6.52758 14.2994 6.55047L19.3341 7.28637C19.8643 7.36387 20.1294 7.40261 20.2521 7.53211C20.3588 7.64477 20.409 7.79959 20.3887 7.95345C20.3653 8.1303 20.1734 8.31722 19.7896 8.69108L16.1478 12.2382C16.0343 12.3488 15.9775 12.4041 15.9409 12.4699C15.9084 12.5281 15.8876 12.5921 15.8796 12.6583C15.8705 12.733 15.8839 12.8111 15.9107 12.9673L16.77 17.9775C16.8607 18.5059 16.906 18.7701 16.8208 18.9269C16.7467 19.0633 16.615 19.159 16.4624 19.1873C16.2869 19.2198 16.0497 19.0951 15.5751 18.8455L11.0741 16.4785C10.9339 16.4047 10.8638 16.3678 10.7899 16.3533C10.7245 16.3405 10.6572 16.3405 10.5918 16.3533C10.5179 16.3678 10.4478 16.4047 10.3075 16.4785L5.80654 18.8455C5.33201 19.0951 5.09474 19.2198 4.9193 19.1873C4.76666 19.159 4.63495 19.0633 4.56085 18.9269C4.47569 18.7701 4.521 18.5059 4.61164 17.9775L5.47094 12.9673C5.49773 12.8111 5.51112 12.733 5.50206 12.6583C5.49403 12.5921 5.47323 12.5281 5.4408 12.4699C5.40417 12.4041 5.34741 12.3488 5.23388 12.2382L1.59207 8.69108C1.20823 8.31722 1.01631 8.1303 0.992959 7.95345C0.97264 7.79959 1.02284 7.64477 1.12958 7.53211C1.25226 7.40261 1.51735 7.36387 2.04753 7.28637L7.08228 6.55047C7.23886 6.52758 7.31715 6.51614 7.38533 6.48443C7.44569 6.45636 7.50004 6.41684 7.54535 6.36807C7.59653 6.31299 7.63155 6.24204 7.7016 6.10014L9.95242 1.54022Z" fill="url(#starGrad)"/>
    <defs>
      <linearGradient id="starGrad" x1="10.69" y1="0.69" x2="10.69" y2="19.19" gradientUnits="userSpaceOnUse">
        <stop stopColor="white"/>
        <stop offset="1" stopColor="white" stopOpacity="0.7"/>
      </linearGradient>
    </defs>
  </svg>
);
import Image from "next/image";
const cloudBackgroundLayers = [1, 2, 3, 4, 5, 6];

export default function HeroSection() {
  const [ditherMode, setDitherMode] = useState<
    "bayer" | "halftone" | "noise" | "crosshatch"
  >("bayer");
  const [colorMode, setColorMode] = useState<
    "original" | "grayscale" | "duotone" | "custom"
  >("grayscale");
  const [gridSize, setGridSize] = useState(3);
  const [invert, setInvert] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [primaryColor, setPrimaryColor] = useState("#0a0a0a");
  const [secondaryColor, setSecondaryColor] = useState("#fafafa");
  const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  if (videoRef.current) {
    videoRef.current.playbackRate = 0.5;
  }
}, []);
  return (
    <section className="relative min-h-screen  bg-orange-400 flex items-center overflow-hidden">
      {/* Content */}
      {/* <video
      ref={videoRef}

    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover z-0"
    src="/videobg/bgvideo.mp4"
  /> */}
  <div className="absolute inset-0 w-full h-full object-cover z-0">
        <DitherShader
          src="https://plus.unsplash.com/premium_photo-1730005718798-77677f123d84?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop"
          // src="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=3432&auto=format&fit=crop"
          gridSize={gridSize}
          ditherMode={"bayer"}
          colorMode={"original"}
          invert={invert}
          animated={animated}
          animationSpeed={0.025}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          threshold={threshold}
          className=""
        />
      </div>
      <div className="relative z-10 md:ml-40 grid w-full items-center gap-12 px-6 pt-40 md:pt-10 pb-20 md:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] md:px-16 lg:px-24">
         
        <div className="flex max-w-[630px] flex-col items-start text-left">
          <h1 className="mb-6 text-5xl font-medium leading-[0.95] text-white [-webkit-text-stroke:2px_#111] [text-shadow:4px_4px_0_#111] sm:text-6xl lg:text-7xl">
            BROCHUERS LIE!<br/>SENIORS TELL THE TRUTH
          </h1>
          <p className="mb-10 max-w-[480px] text-lg leading-7 text-zinc-300  ">
            Stop gambling with your next 4 years. Get the unfiltered truth about your dream college from a verified senior in a quick chat.
          </p>

          {/* Download buttons */}
          <div className="mb-12 flex flex-wrap items-center gap-3">
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

          {/* Accolades */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <img
              src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/693a9f58e3851420a97a8a54_Apple-Design-Awards-White-p-500.png"
              alt="Apple Design Awards"
              className="h-10 w-auto object-contain opacity-90"
            />
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl leading-none">4.8</span>
                <div className="flex gap-[2px] mt-1">
                  {[0,1,2,3,4].map(i => <StarIcon key={i}/>)}
                </div>
              </div>
              <span className="text-white/55 text-[13px]">150k+ App Ratings</span>
            </div>
          </div>
        </div>

        <div className="relative hidden ml-60 md:flex mt-96 w-full max-w-[500px]  items-end justify-center md:h-[560px]">
          <Android
        className="w-[68%] "
        // videoSrc="https://videos.pexels.com/video-files/14993748/14993748-uhd_1296_2304_30fps.mp4"
      />
        </div>
         
      </div>
    </section>
  );
}
