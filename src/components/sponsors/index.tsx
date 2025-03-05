import Image from "next/image";

const Sponsors = () => {
  return (
    <section
      className="mx-2 mt-28 flex min-h-[70vh] w-screen flex-col items-center gap-8 sm:mb-4"
      id="sponsors"
    >
      <h1 className="my-1 font-anton text-4xl font-bold sm:text-6xl">
        Powered By
      </h1>
      <div className="mx-2 flex w-full flex-col items-center gap-5 overflow-hidden sm:my-8 sm:flex-row sm:justify-center sm:gap-40">
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
      <h1 className="mt-10 font-anton text-4xl font-bold sm:text-6xl">
        Co-Powered By
      </h1>
      <div className="mb-12 mt-4 flex w-full items-start justify-center gap-10 sm:mt-20">
        <Image
          src={"/images/sponsors/rakuten.svg"}
          alt="rakuten"
          width={200}
          height={100}
        />

        {/* <div className="relative h-28 w-80">
          <Image src={"/images/sponsors/inflow.png"} alt="inflow" fill />
        </div> */}
      </div>
    </section>
  );
};

export default Sponsors;
