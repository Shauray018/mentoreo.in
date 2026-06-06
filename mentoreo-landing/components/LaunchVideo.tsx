"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
}) => (
  <motion.div style={{ translateY: translate }} className="max-w-5xl mx-auto text-center">
    {titleComponent}
  </motion.div>
);

const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{ rotateX: rotate, scale }}
    className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full"
  >
    <div
      style={{
        height: "100%",
        width: "100%",
        border: "4px solid #000",
        borderRadius: "20px",
        background: "#ff8000",
        overflow: "hidden",
        /* Tight 6px cartoon hard shadow — punchy but not overblown */
        boxShadow: "6px 6px 0px #000",
      }}
    >
      {/* Video fills the whole card — no accent strip, clean orange border only */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  </motion.div>
);

const ContainerScroll = ({
  titleComponent,
  children,
  scrollHeight = "220vh",
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  scrollHeight?: string;
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate    = useTransform(scrollYProgress, [0, 0.6], [20, 0]);
  const scale     = useTransform(scrollYProgress, [0, 0.6], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.6], [0, -100]);

  return (
    <div ref={outerRef} style={{ height: scrollHeight }} className="relative">
      <div className="sticky top-0 h-screen flex items-center justify-center p-2 md:p-20 overflow-hidden">
        <div className="py-10 md:py-40 w-full relative" style={{ perspective: "1000px" }}>
          <Header translate={translate} titleComponent={titleComponent} />
          <Card rotate={rotate} translate={translate} scale={scale}>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function LaunchVideo() {
  return (
    <section className="relative bg-zinc-100">
      <ContainerScroll
        scrollHeight="220vh"
        titleComponent={
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <img
                src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/634a6d1490db01245f4d7ca5_%F4%80%8A%84.svg"
                alt=""
                className="w-5 h-5 opacity-50"
              />
              <p className="text-black/50 tracking-wide uppercase text-sm font-medium">
                Watch our new launch video
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              See it in action
            </h2>
          </div>
        }
      >
        <div className="relative w-full h-full">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://player.mediadelivery.net/embed/666953/ca326929-3cbf-48e1-aab0-45d7a5532ab8?autoplay=false"
            allowFullScreen
            title="Opal Launch Video"
          />
        </div>
      </ContainerScroll>
    </section>
  );
}