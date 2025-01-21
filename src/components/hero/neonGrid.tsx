import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { useWindowSize } from "~/hooks/useWindowSize";

const NeonGrid = () => {
  const boxes = useRef<Array<Array<HTMLDivElement | null>>>([]);
  const windowSize = useWindowSize();
  const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const size = (windowSize.width + windowSize.height) / 2;
    setBoxSize({
      width: size / (10 * Math.cos(Math.PI / 9)),
      height: size / (10 * Math.cos(Math.PI / 9)),
    });
  }, [windowSize]);

  // Perspective of the grid for different screen sizes
  let perspective = 250;
  if (windowSize.width < 800) perspective = 300;
  else if (windowSize.height < 900) perspective = 300;
  else if (windowSize.height < 1000) perspective = 350;
  else if (windowSize.height < 1100) perspective = 450;
  else if (windowSize.height < 1200) perspective = 450;
  else perspective = 550;

  const temp = new Array(20).fill(0); // temporary array to map the grid

  const colorMap = [
    ["#EB24B6", "#F05CC8", "#F594DB"],
    ["#F26868", "#F68E8E", "#F9B4B4"],
    ["#FFB85C", "#FFCA85", "#FFDCAD"],
  ];

  const handleHover = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    const position = {
      x: (e.target as HTMLDivElement).offsetLeft,
      y: (e.target as HTMLDivElement).offsetTop,
    };
    const color = colorMap[Math.floor(Math.random() * colorMap.length)];
    boxes.current.map((row) => {
      row.map((box) => {
        if (box) {
          // Giving a 3D effect to boxes adjacent to the hovered box including diagonal boxes
          if (
            Math.sqrt(
              (box.offsetLeft - position.x) ** 2 +
                (box.offsetTop - position.y) ** 2,
            ) <=
            (Math.SQRT2 * boxSize.width) / Math.cos(Math.PI / 9)
          ) {
            box.style.transform = "perspective(100px) translateZ(5px)";
            box.style.zIndex = "1";
            box.style.boxShadow = `0 0 10px 5px ${color![1]}`;
          }
          // Giving a 3D effect to boxes second adjacent to the hovered box (diagonal boxes excluded)
          else if (
            Math.sqrt(
              (box.offsetLeft - position.x) ** 2 +
                (box.offsetTop - position.y) ** 2,
            ) <=
            (2 * boxSize.width) / Math.cos(Math.PI / 9)
          ) {
            box.style.transform = "perspective(100px) translateZ(3px)";
            box.style.zIndex = "0";
            box.style.boxShadow = `0 0 10px 5px ${color![2]}`;
          }
        }
      });
    });
    // Giving a 3D effect to the hovered box
    if (e.target && e.target instanceof HTMLDivElement) {
      e.target.style.transform = "perspective(100px) translateZ(10px)";
      e.target.style.zIndex = "2";
      e.target.style.boxShadow = `0 0 15px 10px ${color![0]}`;
    }
    if (e.target && e.type === "mousedown") {
      (e.target as HTMLDivElement).style.transitionProperty = "all";
    }
  };

  const handleMouseLeave = () => {
    // Removing 3D effect from all other boxes
    boxes.current.map((row) => {
      row.map((box) => {
        if (box) {
          box.style.transform = "perspective(100px) translateZ(-0px)";
          box.style.zIndex = "0";
          box.style.boxShadow = "0 0 0px 0px #AC61E5";
        }
      });
    });
  };

  // return (
  //   <>
  //     <div className="h-full w-full bg-base-300" style={{ contain: "paint" }}>
  //       <div style={{ perspective }}>
  //         <div
  //           className="relative h-screen"
  //           style={{
  //             transformOrigin: "center",
  //             transform: "rotateX(18deg)",
  //             transformStyle: "preserve-3d",
  //           }}
  //         >
  //           {/* Grid container */}
  //           <div className="relative flex -translate-y-1/3 rotate-45 flex-col items-center justify-center gap-1">
  //             {temp.map((itm, i) => {
  //               boxes.current[i] = [];
  //               return (
  //                 <>
  //                   {/* Grid rows */}
  //                   <div
  //                     className={`flex gap-1 -mt-[${
  //                       boxSize.height * Math.cos(Math.PI / 10)
  //                     }px] items-center justify-center`}
  //                     key={i}
  //                   >
  //                     {temp.map((itm, j) => {
  //                       return (
  //                         <>
  //                           {/* Grid boxes */}
  //                           <div
  //                             onTouchStart={(e) => handleHover(e)}
  //                             onTouchEnd={() => handleMouseLeave()}
  //                             onMouseEnter={(e) => handleHover(e)}
  //                             onMouseLeave={() => handleMouseLeave()}
  //                             className="relative ease-linear"
  //                             key={`${i}-${j}`}
  //                             style={{
  //                               transitionProperty: "transform, box-shadow",
  //                               height: boxSize.height - 4,
  //                               width: boxSize.width - 4,
  //                               transformStyle: "preserve-3d",
  //                               transitionDuration: "0.3s",
  //                               perspective: "100px",
  //                               transform: "rotate3d(1.5, -1.5, -0.25, 45deg)",
  //                             }}
  //                             ref={(ref) => (boxes.current[i]![j] = ref)}
  //                           >
  //                             {/* Top face */}
  //                             <div
  //                               className="absolute inset-0 border-[1px] border-white/25 bg-gray-900"
  //                               style={{
  //                                 transform: "scaleY(1) ",
  //                               }}
  //                             ></div>
  //                             {/* Front face: this */}
  //                             <div
  //                               className="absolute bottom-0 h-full w-full bg-gray-900"
  //                               style={{
  //                                 transform: "rotateX(90deg)",
  //                                 transformOrigin: "bottom",
  //                               }}
  //                             ></div>
  //                             {/* Right face */}
  //                             {/* <div
  //                               className="absolute left-0 bg-gray-900 h-full w-full"
  //                               style={{
  //                                 transform: "rotateY(90deg) scaleY(1)",
  //                                 transformOrigin: "left",
  //                               }}
  //                             ></div> */}
  //                             {/* Left face : this */}
  //                             <div
  //                               className="absolute right-0 h-full w-full bg-gray-900"
  //                               style={{
  //                                 transform: "rotateY(-90deg) scaleY(1)",
  //                                 transformOrigin: "right",
  //                               }}
  //                             ></div>
  //                           </div>
  //                         </>
  //                       );
  //                     })}
  //                   </div>
  //                 </>
  //               );
  //             })}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </>
  return(
    <>
  
  </>
  )
  
};

export default NeonGrid;
