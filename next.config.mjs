/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";

const nextConfig = {};

export default withPWA({
  ...nextConfig,
  ...{
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: false,
  },
});
