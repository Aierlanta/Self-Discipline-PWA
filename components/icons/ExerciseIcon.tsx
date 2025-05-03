import { JSX } from "preact";

export function ExerciseIcon(props: JSX.SVGAttributes<SVGSVGElement>) {
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
      class="lucide lucide-dumbbell"
      {...props}
    >
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 5.343a2.828 2.828 0 1 1 4 4L14.4 17.6a4.243 4.243 0 0 1-6 0L2.343 9.343a2.828 2.828 0 1 1 4-4L14.4 13.6a4.243 4.243 0 0 0 6 0l2.257-2.257" />
      <path d="m9.6 14.4 4.8-4.8" />
    </svg>
  );
}