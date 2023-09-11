import type { GlobalState } from "./_middleware.ts";
import { AppProps } from "$fresh/server.ts";

import Header from "components/Header.tsx";
import Footer from "components/Footer.tsx";

export default function App(
  { Component, route }: AppProps<unknown, GlobalState>,
) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ReverseJS</title>
      </head>
      <body>
        <Header active={route} />
        <Component />
        <Footer children={undefined} />
      </body>
    </html>
  );
}
