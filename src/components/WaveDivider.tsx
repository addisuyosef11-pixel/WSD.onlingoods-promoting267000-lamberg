const WaveDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}>
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-24">
      <path
        d="M0,120 C180,60 360,180 540,120 C720,60 900,180 1080,120 C1260,60 1440,180 1440,120 L1440,0 L0,0 Z"
        fill="hsl(150,50%,20%)"
      />
      <path
        d="M0,100 C200,140 400,80 600,110 C800,140 1000,70 1200,110 C1350,140 1440,100 1440,100 L1440,0 L0,0 Z"
        fill="hsl(145,45%,35%)"
        opacity="0.7"
      />
      <path
        d="M0,85 C240,110 480,70 720,90 C960,110 1200,70 1440,85 L1440,0 L0,0 Z"
        fill="hsl(43,70%,50%)"
        opacity="0.5"
      />
    </svg>
  </div>
);

export default WaveDivider;