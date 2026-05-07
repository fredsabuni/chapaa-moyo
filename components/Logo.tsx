export default function Logo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21 C 8 17.5, 6.5 14.8, 7.5 12.2 C 8.4 9.8, 10.5 10.3, 12 11.6 C 13.5 10.3, 15.6 9.8, 16.5 12.2 C 17.5 14.8, 16 17.5, 12 21 Z"
        fill="#04372C"
      />
      <path
        d="M3 13 H 6.5 L 7.6 10.5 L 9 14.5 L 10.4 11.5 L 11.5 13"
        stroke="#04372C" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"
      />
    </svg>
  );
}
