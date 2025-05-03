import { JSX } from "preact";

export function SleepIcon(props: JSX.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-bed-double"
      {...props}
    >
      <path d="M2 18v-2a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2" />
      <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      <path d="M12 12v6" />
      <path d="M2 18h20" />
    </svg>
  );
}