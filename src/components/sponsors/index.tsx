import Image from "next/image";

const Sponsors = () => {
  return (
    <section
      className="flex w-screen flex-col items-center gap-16 px-4 font-herkules text-5xl tracking-wider sm:text-6xl"
      id="sponsors"
    >
      <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6">
        <h1>Presented By</h1>
        <Image
          src={"/logos/NMAMITLogo.png"}
          alt="nmamit"
          width={450}
          height={76}
          className="aspect-[1628/268]"
        />
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6">
        <h1>Powered By</h1>
        <div className="flex w-full flex-col items-center justify-center overflow-hidden sm:flex-row sm:justify-evenly lg:justify-center lg:gap-40">
          <Image
            src={"/images/sponsors/paloalto.png"}
            alt="paloalto"
            width={400}
            height={169}
            className="w-[300px] sm:h-[200px] sm:w-[400px]"
          />
          <Image
            src={"/images/sponsors/inflow.png"}
            alt="inflow"
            width={300}
            height={144}
          />
        </div>
      </div>
      
      <div className="flex flex-col w-full xl:w-[80%] overflow-hidden sm:flex-row justify-center sm:justify-around gap-y-10 sm:gap-y-0 items-center">
        <div className="flex w-full flex-col overflow-hidden justify-center sm:justify-evenly lg:justify-center gap-y-4 items-center">
          <h1 className="text-center">Co-Powered By</h1>
          <Image
            src={"/images/sponsors/niveus.png"}
            alt="paloalto"
            width={240}
            height={150}
          />
        </div>
        <div className="hidden sm:block h-36 w-2 bg-gray-400"></div>
        <div className="flex w-full flex-col overflow-hidden justify-center sm:justify-evenly lg:justify-center gap-y-4 items-center">
          <h1 className="text-center">Sponsored By</h1>
          <Image
            src={"/images/sponsors/rakuten.svg"}
            alt="paloalto"
            width={200}
            height={100}
          />
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
