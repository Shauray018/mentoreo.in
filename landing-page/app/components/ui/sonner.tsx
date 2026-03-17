"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "#FFF7ED",
          "--normal-text": "#7C2D12",
          "--normal-border": "#FED7AA",
          "--success-bg": "#ECFDF5",
          "--success-text": "#065F46",
          "--success-border": "#A7F3D0",
          "--error-bg": "#FFF1F2",
          "--error-text": "#9F1239",
          "--error-border": "#FECDD3",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
