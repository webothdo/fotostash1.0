import ImageKit from "imagekit";

export default function imagekitServer() {
  const imagekit = new ImageKit({
    publicKey: process.env.NUXT_PUBLIC_IMAGEKIT_API_KEY,
    privateKey: process.env.NUXT_IMAGEKIT_API_KEY,
    urlEndpoint: process.env.NUXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });

  return imagekit;
}
