import Image from "next/image";

const Sponsors = () => {
  return (
    <section className="mx-2 flex min-h-[100vh] w-screen flex-col items-center gap-8 space-y-5 py-4">
      <h1 className="my-2 font-anton text-6xl font-bold">Powered By</h1>
      <div className="mx-2 my-12 flex w-full flex-col items-center justify-center gap-10 overflow-hidden sm:flex-row">
        <div className="relative h-52 w-96">
          <Image src={"/images/sponsors/paloalto.png"} alt="paloalto" fill />
        </div>

        <div className="relative ml-2 h-24 w-80 md:ml-0 md:h-28 md:w-80">
          <Image src={"/images/sponsors/inflow.png"} alt="inflow" fill />
        </div>
      </div>
      <h1 className="my-5 font-anton text-5xl font-bold">Co-Powered By</h1>
      <div className="my-12 flex w-full items-center justify-center gap-10">
        <div className="relative h-52 w-60">
          <Image src={"/images/sponsors/rakuten.svg"} alt="rakuten" fill />
        </div>

        {/* <div className="relative h-28 w-80">
          <Image src={"/images/sponsors/inflow.png"} alt="inflow" fill />
        </div> */}
      </div>
    </section>
  );
};

export default Sponsors;
