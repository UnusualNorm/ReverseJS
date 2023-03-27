import JavascriptIcon from "tabler_icons_tsx/brand-javascript.tsx";
import BrandGithub from "tabler_icons_tsx/brand-github.tsx";

export default function Footer() {
  const menus = [
    {
      title: "Pages",
      children: [{ name: "Home", href: "/" }],
    },
  ];

  return (
    <div class="bg-white flex flex-col md:flex-row w-full max-w-screen-lg gap-8 md:gap-16 px-8 py-8 text-sm">
      <div class="flex-1">
        <div class="flex items-center gap-1">
          <JavascriptIcon class="inline-block" />
          <div class="font-bold text-2xl">ReverseJS</div>
        </div>
        <div class="text-gray-500">The all-in-one remote control solution!</div>
      </div>

      {menus.map((item) => (
        <div class="mb-4" key={item.title}>
          <div class="font-bold">{item.title}</div>
          <ul class="mt-2">
            {item.children.map((child) => (
              <li class="mt-2" key={child.name}>
                <a class="text-gray-500 hover:text-gray-700" href={child.href}>
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div class="text-gray-500 space-y-2">
        <div class="text-xs">
          Copyright © 2023 Unusual Norm
          <br />
          All rights reserved.
        </div>

        <a
          href="https://github.com/UnusualNorm/ReverseJS"
          class="inline-block hover:text-black"
        >
          <BrandGithub />
        </a>
      </div>
    </div>
  );
}
