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

function ContainerGlow({ colors }: { colors: string[] }) {
  const [c1, c2, c3] = colors;

  return (
    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
      <div
        className="absolute inset-[-22%]"
        style={{
          background: `radial-gradient(ellipse 72% 70% at 50% 54%, ${c1}55 0%, ${c2}32 34%, ${c3}18 62%, transparent 82%)`,
          filter: "blur(34px)",
        }}
      />
      <div
        className="absolute inset-[-8%]"
        style={{
          background: `radial-gradient(ellipse 62% 64% at 50% 50%, ${c1}68 0%, ${c2}42 32%, transparent 68%)`,
          filter: "blur(18px)",
        }}
      />
      <div
        className="absolute inset-[18%]"
        style={{
          background: `radial-gradient(ellipse 55% 60% at 50% 50%, ${c1}75 0%, ${c1}42 24%, transparent 64%)`,
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute bottom-[-12%] left-[12%] right-[12%] h-[34%]"
        style={{
          background: `radial-gradient(ellipse 82% 48% at 50% 100%, ${c2}42 0%, transparent 72%)`,
          filter: "blur(22px)",
        }}
      />
    </div>
  );
}

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
    className="relative max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full"
  >
    <ContainerGlow colors={["#fb923c", "#f97316", "#ea580c"]} />
    <div
      style={{
        height: "100%",
        width: "100%",
        border: "4px solid #000",
        borderRadius: "20px",
        background: "#ff8000",
        overflow: "hidden",
        boxShadow: "6px 6px 0px #000",
        position: "relative",
        zIndex: 1,
      }}
    >
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
                Word from our founders
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
              we believe in a better solution
            </h2>
          </div>
        }
      >
        {/* object-fit: cover fills the frame regardless of aspect ratio.
            autoPlay + loop + muted are required for browsers to autoplay.
            playsInline prevents fullscreen hijack on iOS.
            The controls attribute is intentionally omitted — no UI chrome. */}
        <video
          src="/founders.mp4"
          autoPlay
          loop
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </ContainerScroll>
    </section>
  );
}
