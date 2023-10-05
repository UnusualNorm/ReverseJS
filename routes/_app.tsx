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
      <body className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Header active={route} />
          <Component />
        </div>
        <div className="position-sticky bottom-0">
          <Footer children={undefined} />
        </div>
      </body>
    </html>
  );
}
