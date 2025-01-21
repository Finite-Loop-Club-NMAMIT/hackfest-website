/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol:"https",
        hostname:"lh3.googleusercontent.com"
      },
      {
        protocol:"https",
        hostname:"res.cloudinary.com",
        // pathname:"/"
      },
      {
        protocol:"https",
        hostname:"i1.sndcdn.com",
        // pathname:"/"
      },
      {
        protocol:"https",
        hostname:"img.freepik.com",
        // pathname:"/"
      },
    ],
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default config;
