"use client";

import dynamic from "next/dynamic";

const WorldScene = dynamic(
  () => import("../components/World/WorldScene"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <main>
      <WorldScene />
    </main>
  );
}
