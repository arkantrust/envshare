import React, { PropsWithChildren } from "react";

export const Title: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <h1 className="bg-linear-to-t from-zinc-100/60 to-white bg-clip-text py-4 text-center text-5xl font-bold text-transparent">
      {children}
    </h1>
  );
};
