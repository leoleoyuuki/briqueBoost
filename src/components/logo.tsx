import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 10V2L8 6" />
      <path d="m12 2 4 4" />
      <path d="M14.5 10H8" />
      <path d="M14.5 14H8" />
      <path d="M14.5 18H8" />
      <path d="M8 22V10" />
      <path d="M14.5 22V10c0-1.1.9-2 2-2h0c1.1 0 2 .9 2 2v12" />
    </svg>
  );
}