import Marquee from "react-fast-marquee";
import Link from "next/link";

export default function NewsBanner() {
  return (
    <Marquee
      className="fixed bg-[#06103d] py-2 text-sm text-white"
      pauseOnHover
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12].map((item) => {
        return (
          <div key={item} className="mr-5 flex">
            <Link
              href={"/overtime"}
              className="mr-1 underline underline-offset-4"
            >
              Register for Overtime
            </Link>
            <span className="ml-5">◆</span>
          </div>
        );
      })}
      {/* {[0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12].map((item) => {
        return (
          <div key={item} className="mr-5 flex">
            <Link
              href={"/results"}
              className="mr-1 underline underline-offset-4"
            >
              Results are out
            </Link>
            <span className="ml-5">◆</span>
          </div>
        );
      })} */}
    </Marquee>
  );
}
