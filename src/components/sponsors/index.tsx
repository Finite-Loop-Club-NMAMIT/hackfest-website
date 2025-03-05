import Image from "next/image";

const Sponsors = () => {
  return (
    <section
      className="flex min-h-[70vh] w-screen flex-col items-center gap-16"
      id="sponsors"
    >
      <h1 className="font-anton text-4xl font-bold sm:text-6xl">
        Presented By
      </h1>
      <div className="flex w-full items-start justify-center px-4">
        <Image
          src={"/logos/NMAMITLogo.png"}
          alt="rakuten"
          width={450}
          height={200}
        />
      </div>
      <h1 className="font-anton text-4xl font-bold sm:text-6xl">Powered By</h1>
      <div className="flex w-full flex-col items-center gap-12 overflow-hidden sm:flex-row  sm:justify-center  sm:gap-20 md:gap-40">
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
      <h1 className="font-anton text-4xl font-bold sm:text-6xl">
        Co-Powered By
      </h1>
      <div className="flex w-full items-start justify-center ">
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
