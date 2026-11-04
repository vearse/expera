import Image from "next/image";
import logo from "@/app/logo.png";

export function BrandLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return <Image src={logo} alt="Expera — Explore, Experiment, Excel" className={className} style={{ width: "auto", height: "3rem" }} priority />;
}
