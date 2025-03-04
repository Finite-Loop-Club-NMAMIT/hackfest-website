import Image from "next/image";

const Sponsors = () => {
  return (
    <section
      className="mx-2 mt-28 flex min-h-[70vh] w-screen flex-col items-center gap-8 space-y-5"
      id="sponsors"
    >
      <h1 className="my-1 font-anton text-6xl font-bold">Powered By</h1>
      <div className="mx-2 my-8 flex w-full flex-col items-center justify-center gap-40 overflow-hidden sm:flex-row">
        <Image
          src={"/images/sponsors/paloalto.png"}
          alt="paloalto"
          width={400}
          height={200}
        />
        <Image
          src={"/images/sponsors/inflow.png"}
          alt="inflow"
          width={300}
          height={150}
        />
      </div>
      <h1 className="mt-10 font-anton text-5xl font-bold">Co-Powered By</h1>
      <div className="mb-12 flex w-full items-center justify-center gap-10">
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
