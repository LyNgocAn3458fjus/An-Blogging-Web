//tạo hiệu ứng mưa rơi
import React, { useMemo } from "react";//ghi nhớ kq của một phép tính(cache kq tính toán)

const RainSplash = ({
  dropCount = 120,
  maxDropHeight = 20,
  maxSpeed = 1.2, // tốc độ rơi tối đa
}) => {
  const drops = useMemo(() => {
    return Array.from({ length: dropCount }, () => ({
      left: Math.random() * 100 + "%",
      height: 5 + Math.random() * maxDropHeight + "px",
      duration: 0.5 + Math.random() * maxSpeed + "s",
      delay: Math.random() * 5 + "s",
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, [dropCount, maxDropHeight, maxSpeed]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      {drops.map((drop, idx) => (
        <div
          key={idx}
          className="absolute bg-white rounded-sm"
          style={{
            width: "2px",
            height: drop.height,
            left: drop.left,
            top: "-20px",
            opacity: drop.opacity,
            animation: `fall ${drop.duration} linear ${drop.delay} infinite`,
          }}
        ></div>
      ))}

      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
};

export default RainSplash;
