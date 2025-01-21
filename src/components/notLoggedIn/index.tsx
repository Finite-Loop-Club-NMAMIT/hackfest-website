import Image from "next/image";
import SignInButton from "./signInButton";
import { usePathname } from "next/navigation";
import RootLayout from "../layout";

const NotLoggedIn = () => {
  const pathname = usePathname();
  return (
    <RootLayout>
      <div
        className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[url("/images/blue-grainy.png")] bg-cover bg-center px-5 py-40 md:p-40`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/20"></div>

        {pathname === "/register" ? (
          <>
            <div className="z-10 flex w-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-black/50 px-5 py-10">
              <div className="flex flex-col justify-center text-center">
                <div className="group relative flex h-full w-full items-center justify-center">
                  <Image
                    src="/logos/logo.png"
                    alt="Hackfest_Logo"
                    width={180}
                    height={180}
                  />
                  <div className="absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 transform bg-gradient-radial from-yellow-300/50 via-transparent to-transparent blur-xl transition-all duration-300 group-hover:brightness-125" />
                </div>
                <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-black text-transparent md:text-7xl">
                  Hey there! 👋🏻
                </h1>
                <p className="text-md mb-5 mt-4 text-gray-300">
                  Please sign in and you are all set to Register. Happy Coding.
                </p>
                <SignInButton />
              </div>
            </div>
          </>
        ) : (
          <div className="z-10 flex w-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-black/50 px-5 py-10">
            <div className="flex flex-col justify-center text-center">
              <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-7xl font-black text-transparent md:text-9xl">
                Oops!
              </h1>

              <p className="md:text-md mb-5 mt-4 text-sm text-gray-300">
                You need to be logged in to view this page
              </p>

              <SignInButton />
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
};

export default NotLoggedIn;
