import Image from "next/image";

const Sponsors = () => {
  return (
    <section
      className="flex w-screen flex-col items-center gap-16 px-4 font-herkules tracking-wider text-5xl sm:text-6xl"
      id="sponsors"
    >
      <div className="flex flex-col w-full items-center justify-center sm:gap-6 gap-4">
        <h1>Presented By</h1>
        <Image
          src={"/logos/NMAMITLogo.png"}
          alt="nmamit"
          width={450}
          height={200}
        />
      </div>

      <div className="flex flex-col w-full justify-center items-center sm:gap-6 gap-4">
        <h1>Powered By</h1>
        <div className="flex w-full flex-col overflow-hidden sm:flex-row justify-center sm:justify-evenly lg:justify-center lg:gap-40 items-center">
          <Image
            src={"/images/sponsors/paloalto.png"}
            alt="paloalto"
            width={400}
            height={200}
            className="w-[300px] sm:h-[200px] sm:w-[400px]"
          />
          <Image
            src={"/images/sponsors/inflow.png"}
            alt="inflow"
            width={300}
            height={150}
          />
        </div>
      </div>
      
      <div className="flex flex-col w-full items-center justify-center sm:gap-6 gap-4">
        <h1>Co-Powered By</h1>
        <Image
          src={"/images/sponsors/rakuten.svg"}
          alt="rakuten"
          width={200}
          height={100}
        />
      </div>
    </section>
  );
};

export default Sponsors;
