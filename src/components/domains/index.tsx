import { MouseEvent, TouchEvent, useRef, useState } from "react";
import Image from "next/image";
import { GiTronArrow } from "react-icons/gi";
import styles from "./style.module.css";
import { SectionHeading } from "../ui/sectionHeading";
import { IoReturnDownBackOutline } from "react-icons/io5";

type DomainProps = {
  name: string;
  image: string;
  prize: number | null;
  description: { p1: string; p2: string };
};

const Domains = ({ domainList }: { domainList: DomainProps[] }) => {
  const [contents, setContents] = useState<DomainProps & { index: number }>({
    name: "",
    image: "",
    prize: null,
    description: { p1: "", p2: "" },
    index: 0,
  });

  const activeDomain = useRef<{
    title: HTMLDivElement | null;
    img: HTMLDivElement | null;
    target: HTMLDivElement | null;
  }>({ title: null, img: null, target: null });
  const domainPosRef = useRef(null);
  const contentRef = useRef(null);
  const bgBlockRef = useRef(null);
  const contentTitleRef = useRef(null);
  const contentDescriptionRef1 = useRef(null);
  const contentDescriptionRef2 = useRef(null);
  const contentPrizeRef = useRef(null);
  const contentExitRef = useRef(null);

  const titleAnimationRef = useRef(null);

  const enterAnimation = async (e: MouseEvent | TouchEvent) => {
    const targetParent =
      e.target &&
      e.target instanceof SVGPathElement &&
      e.target.parentElement?.parentElement?.parentElement?.parentElement;
    const target =
      e.target &&
      e.target instanceof SVGPathElement &&
      e.target.parentElement?.parentElement?.parentElement;
    const targetTitle =
      e.target &&
      e.target instanceof SVGPathElement &&
      e.target.parentElement?.parentElement?.parentElement?.children[2];
    const targetImg =
      e.target &&
      e.target instanceof SVGPathElement &&
      e.target.parentElement?.parentElement?.parentElement?.children[1];

    if (
      target &&
      target instanceof HTMLDivElement &&
      targetTitle &&
      targetTitle instanceof HTMLDivElement &&
      targetImg &&
      targetImg instanceof HTMLDivElement
    ) {
      setContents({
        ...domainList[parseInt(target.dataset.id!)],
        index: parseInt(target.dataset.id!),
      } as DomainProps & { index: number });
      if (activeDomain.current) {
        activeDomain.current = {
          title: targetTitle,
          target: target,
          img: targetImg,
        };
      }

      contentRef.current &&
        (contentRef.current as HTMLDivElement).classList.add(
          `${styles.active}`,
        );

      setTimeout(() => {
        const domainPos =
          domainPosRef.current &&
          (domainPosRef.current as HTMLDivElement).getBoundingClientRect();
        const currentPos = target.getBoundingClientRect();

        const domainTitlePos =
          contentTitleRef.current &&
          (contentTitleRef.current as HTMLDivElement).getBoundingClientRect();
        const currentTitlePos = targetTitle.getBoundingClientRect();

        const x = (domainPos as unknown as DOMRect).x - currentPos.x;
        const y = (domainPos as unknown as DOMRect).y - currentPos.y;

        const xTitle =
          (domainTitlePos as unknown as DOMRect).left - currentTitlePos.left;
        const yTitle =
          (domainTitlePos as unknown as DOMRect).top - currentTitlePos.top;

        // Enter animation
        if (targetParent) {
          targetParent.style.zIndex = "41";
        }

        target.style.zIndex = "41";
        target.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        targetTitle.style.display = "none";
        targetImg.style.transform = "scale(1.75)";

        if (titleAnimationRef.current) {
          (titleAnimationRef.current as HTMLDivElement).style.opacity = `1`;
          (titleAnimationRef.current as HTMLDivElement).style.top =
            `${currentTitlePos.top}px`;
          (titleAnimationRef.current as HTMLDivElement).style.left =
            `${currentTitlePos.left}px`;
          (titleAnimationRef.current as HTMLDivElement).style.width =
            `${currentTitlePos.width}px`;

          (titleAnimationRef.current as HTMLDivElement).style.transform =
            `translate(${xTitle}px, ${yTitle}px) scale(1)`;
        }

        bgBlockRef.current &&
          (bgBlockRef.current as HTMLDivElement).classList.add(
            `${styles.active}`,
          );
        contentDescriptionRef1.current &&
          (contentDescriptionRef1.current as HTMLDivElement).classList.add(
            `${styles.active}`,
          );
        contentDescriptionRef2.current &&
          (contentDescriptionRef2.current as HTMLDivElement).classList.add(
            `${styles.active}`,
          );
        contentPrizeRef.current &&
          (contentPrizeRef.current as HTMLDivElement).classList.add(
            `${styles.active}`,
          );
        contentExitRef.current &&
          (contentExitRef.current as HTMLDivElement).classList.add(
            `${styles.active}`,
          );
        document.body.style.overflow = "hidden";
      }, 100);

      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        document.body.addEventListener("click", exitAnimaiton);
      }, 1000);
    }
  };

  const exitAnimaiton = async () => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.body.removeEventListener("click", exitAnimaiton);
    bgBlockRef.current &&
      (bgBlockRef.current as HTMLDivElement).classList.remove(
        `${styles.active}`,
      );
    contentDescriptionRef1.current &&
      (contentDescriptionRef1.current as HTMLDivElement).classList.remove(
        `${styles.active}`,
      );
    contentDescriptionRef2.current &&
      (contentDescriptionRef2.current as HTMLDivElement).classList.remove(
        `${styles.active}`,
      );
    contentPrizeRef.current &&
      (contentPrizeRef.current as HTMLDivElement).classList.remove(
        `${styles.active}`,
      );
    contentExitRef.current &&
      (contentExitRef.current as HTMLDivElement).classList.remove(
        `${styles.active}`,
      );

    setTimeout(() => {
      activeDomain.current.target!.style.zIndex = "0";
      activeDomain.current.title!.style.display = "block";

      if (activeDomain.current?.target?.parentElement) {
        (
          activeDomain.current?.target?.parentElement as HTMLDivElement
        ).style.zIndex = "0";
      }
      if (titleAnimationRef.current) {
        (titleAnimationRef.current as HTMLDivElement).style.opacity = `0`;
      }

      document.body.style.overflow = "visible";
    }, 1000);

    setTimeout(() => {
      contentRef.current &&
        (contentRef.current as HTMLDivElement).classList.remove(
          `${styles.active}`,
        );
    }, 1500);

    activeDomain.current.target!.style.transform = `translate(0, 0) scale(1)`;
    if (titleAnimationRef.current) {
      (titleAnimationRef.current as HTMLDivElement).style.transform =
        `translate(0, 0) scale(1)`;
    }
    if (activeDomain.current) {
      activeDomain.current.img!.style.transform = `scale(1)`;
    }
  };

  return (
    <>
      <section
        id="tracks"
        className="mx-auto w-full max-w-screen-xl p-2 md:p-12"
      >
        <div
          id="contents"
          ref={contentRef}
          className={
            styles.contents +
            " fixed inset-0 z-50 mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-10 bg-transparent lg:flex-row lg:gap-16 lg:px-12"
          }
        >
          {/* Position of domain image when viewing contents */}
          <div
            ref={domainPosRef}
            style={{
              height:
                activeDomain.current.target?.getBoundingClientRect().height,
              aspectRatio: "5/3",
              flexShrink: 0,
            }}
          />
          {/* Contents go here */}
          <div className="flex max-w-screen-md flex-col justify-center gap-2 px-4 sm:px-8 md:gap-6 md:px-12 lg:px-0">
            <div className="flex font-obscura text-xl md:text-2xl lg:text-3xl">
              <div
                ref={contentTitleRef}
                className="relative leading-none opacity-0 "
                style={{
                  width:
                    activeDomain.current.title?.getBoundingClientRect().width,
                }}
              >
                {contents.name}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex overflow-clip text-sm md:text-base lg:text-xl">
                  <div
                    ref={contentDescriptionRef1}
                    className={styles.contentElements}
                  >
                    {contents.description.p1}
                  </div>
                </div>
                <div className="flex space-y-4 overflow-clip text-sm md:text-base lg:text-xl">
                  <div
                    ref={contentDescriptionRef2}
                    className={styles.contentElements}
                  >
                    {contents.description.p2}
                    <span className="text-xs font-semibold italic tracking-wider md:text-sm">
                      <br />
                      *Only software solutions are accepted at Hackfest - 2024.
                      There&apos;s no category for Hardware solutions.*
                    </span>
                  </div>
                </div>
              </div>
              {contents.prize && (
                <div
                  ref={contentPrizeRef}
                  className={`${styles.contentElements} relative mb-2 flex w-fit overflow-clip text-xl lg:text-2xl`}
                >
                  ₹{contents.prize}
                </div>
              )}
            </div>
            <div
              ref={contentExitRef}
              className={`${styles.contentElements} w-fit cursor-pointer transition-all duration-300 ease-in-out hover:text-[#89edfa]`}
              onClick={() => exitAnimaiton()}
            >
              <IoReturnDownBackOutline className="text-3xl md:text-4xl lg:text-6xl" />
            </div>
          </div>
        </div>

        {/* Grids */}
        <div className="mt-10 flex w-full flex-col items-center gap-8 lg:mt-0">
          <SectionHeading
            title="Tracks"
            classname="text-5xl md:text-6xl xl:text-7xl"
          />
          <div className="relative aspect-[820.72/1008] w-full lg:aspect-[209/100]">
            {domainList.map((domain, idx) => {
              return (
                <div
                  key={domain.name}
                  className={`${
                    styles[`domain${idx}`]
                  } pointer-events-none absolute z-0 aspect-[5/3] w-[58.6972%] lg:h-1/2 lg:w-[39.872408293%]`}
                >
                  <div
                    className="pointer-events-none relative z-0 h-full w-full"
                    style={{
                      transition: "transform 1s cubic-bezier(1, 0, 0.7, 1) 0s",
                    }}
                    data-id={idx}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 ${
                        styles[`domainBgImg${idx}`]
                      }`}
                    >
                      <svg
                        viewBox="0 0 482 296"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="pointer-events-none h-full w-full"
                      >
                        <path
                          style={{
                            pointerEvents: "visible",
                            cursor: "pointer",
                          }}
                          data-id={idx}
                          onClick={(e) => enterAnimation(e)}
                          d="M93.0711 2.92893C94.9464 1.05357 97.49 0 100.142 0H471.858C480.767 0 485.229 10.7714 478.929 17.0711L203.071 292.929C199.166 296.834 192.834 296.834 188.929 292.929L3.07107 107.071C-0.834177 103.166 -0.834175 96.8342 3.07107 92.9289L93.0711 2.92893Z"
                          fill="url(#paint0_linear_358_7)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_358_7"
                            x1="246"
                            y1="0"
                            x2="246"
                            y2="300"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#02394B" />
                            <stop offset="1" stopColor="#029792" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div
                      className={`pointer-events-none absolute aspect-square w-[40%] rounded-full ${
                        styles[`domainImg${idx}`]
                      }`}
                      style={{
                        transition:
                          "transform 1s cubic-bezier(1, 0, 0.7, 1) 0s",
                      }}
                    >
                      <Image
                        src={domain.image}
                        alt={domain.name}
                        fill
                        className={`relative  object-center`}
                      />
                    </div>

                    <div
                      className={`pointer-events-none absolute w-fit max-w-[70%] font-obscura text-xl leading-none md:text-2xl lg:text-3xl ${
                        styles[`title${idx}`]
                      }`}
                    >
                      {domain.name}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Div to block background */}
            <div
              ref={bgBlockRef}
              id="bgBlock"
              className={
                styles.bgBlock + ` pointer-events-none fixed inset-0 z-40`
              }
            >
              <Image
                src={"/images/domains-bg.svg"}
                alt="background"
                fill
                className="object-cover object-center"
              />
              <div className="absolute left-0 top-0 h-full w-full bg-black/25"></div>
              {/* <Image
                src={"/images/domains-bg(1).svg"}
                alt=""
                fill
                className="object-center object-cover "
              /> */}
              {/* <div className="w-full h-full bg-black/25 absolute top-0 left-0"></div> */}
            </div>
            <div
              ref={titleAnimationRef}
              className="pointer-events-none fixed z-50 text-left font-obscura text-xl leading-none md:text-2xl lg:text-3xl"
              style={{
                transition: "transform 1s cubic-bezier(1, 0, 0.7, 1) 0s",
                width:
                  activeDomain.current?.title?.getBoundingClientRect().width,
              }}
            >
              {contents.name}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Domains;
