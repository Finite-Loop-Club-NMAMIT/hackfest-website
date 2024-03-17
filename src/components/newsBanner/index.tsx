import Marquee from "react-fast-marquee";
import Link from "next/link";
export default function NewsBanner() {
  return (
    <Marquee className="fixed bg-[#06103d] py-2 text-sm text-white">
      {[0, 1, 2, 3, 4, 5, 6, 7, 9, 10].map((item) => {
        return (
          <div key={item} className="mr-5 flex">
            <Link href={"/results"} className="mr-1 underline">
              Results{" "}
            </Link>{" "}
            are out! <span className="ml-5">◆</span>
          </div>
        );
      })}
    </Marquee>
  );
}
