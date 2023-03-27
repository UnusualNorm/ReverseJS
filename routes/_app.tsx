import { AppProps, PageProps } from "$fresh/server.ts";
import Header from "components/Header.tsx";
import Footer from "components/Footer.tsx";

export default function App({ Component, url }: PageProps & AppProps) {
  return (
    <>
      <Header active={url?.pathname || "/"} />
      <Component />
      <Footer />
    </>
  );
}
