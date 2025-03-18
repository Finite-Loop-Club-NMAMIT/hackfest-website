import { Toaster } from "sonner";
import Navbar from "../navbar";
import Footer from "../footer";
import ProgressBarProvider from "../progressBarProvider";
import { useRouter } from "next/router";
import Marquee from "../marquee";
export default function RootLayout(props: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
      className={`dark relative text-white ${router.pathname === "/" ? "" : "bg-black"}`}
    >
      <Marquee />
      <ProgressBarProvider>
        <Toaster richColors expand={false} position="bottom-center" />
        <Navbar />
        {props.children}
        <Footer />
      </ProgressBarProvider>
    </div>
  );
}
