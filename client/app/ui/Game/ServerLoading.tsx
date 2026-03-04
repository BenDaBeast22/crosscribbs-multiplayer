import { useEffect, useState } from "react";

export default function ServerLoading() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={"flex justify-center items-center min-h-screen bg-main-screen"}>
      <h1 className="text-3xl md:text-7xl font-bold title-gradient drop-shadow-lg pb-10 text-center">
        Server Loading
        <span className="inline-block w-[3ch] text-left ml-2">{dots}</span>
      </h1>
    </div>
  );
}
