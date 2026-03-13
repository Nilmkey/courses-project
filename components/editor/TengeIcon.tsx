import { SVGProps } from "react";

export function TengeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 700 950"
      {...props}
    >
      <path
        d="M 100,150 L 100,50 L 600,50 L 600,150 L 400,150 L 400,850 L 300,850 L 300,150 L 100,150 Z"
        fill="currentColor"
        style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
      />
    </svg>
  );
}
