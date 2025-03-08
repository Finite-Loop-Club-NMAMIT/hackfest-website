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

      <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6">
        <h1>Co-Powered By</h1>
        <Image
          src={"/images/sponsors/rakuten.svg"}
          alt="rakuten"
          width={200}
          height={60}
        />
      </div>
    </section>
  );
};

export default Sponsors;
