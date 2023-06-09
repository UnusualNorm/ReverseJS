import { asset, Head } from "$fresh/runtime.ts";
import { Chart } from "$fresh_charts/mod.ts";
import { ChartColors, transparentize } from "$fresh_charts/utils.ts";
import Card from "components/Card.tsx";
import Editor from "islands/Editor.tsx";
import DenoEditor from "islands/DenoEditor.tsx";
import BrowserOnly from "islands/BrowserOnly.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>ReverseJS - Home</title>
      </Head>

      <div
        class="flex flex-row flex-wrap p-4 justify-between"
        style={{
          "margin-left": "10vw",
          "margin-right": "10vw",
        }}
      >
        <Card
          icon="📈"
          title="Analytics"
          description="See how your website is performing"
        />
        <Card
          icon="📊"
          title="Reports"
          description="See how your website is performing"
        />
        <Card
          icon="📝"
          title="Notes"
          description="See how your website is performing"
        />
        <Card
          icon="📅"
          title="Calendar"
          description="See how your website is performing"
        />
      </div>

      <DenoEditor
        height="90vh"
        defaultValue="// some comment"
      />;

      <div class="p-4 mx-auto max-w-screen-md">
        <Chart
          type="line"
          options={{
            devicePixelRatio: 1,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
          data={{
            labels: ["1", "2", "3"],
            datasets: [
              {
                label: "Sessions",
                data: [123, 234, 234],
                borderColor: ChartColors.Red,
                backgroundColor: transparentize(ChartColors.Red, 0.5),
                borderWidth: 1,
              },
              {
                label: "Users",
                data: [346, 233, 123],
                borderColor: ChartColors.Blue,
                backgroundColor: transparentize(ChartColors.Blue, 0.5),
                borderWidth: 1,
              },
            ],
          }}
        />
      </div>
    </>
  );
}
