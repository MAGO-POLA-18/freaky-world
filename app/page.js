"use client";

import dynamic from "next/dynamic";
import RadioTierraVicio from "../components/World/RadioTierraVicio";

const WorldScene = dynamic(
  () =>
    import(
      "../components/World/WorldScene"
    ),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <main>
      <WorldScene />

      <RadioTierraVicio />
    </main>
  );
}
