import { useEffect, useRef } from "react";

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        // Cấu hình
        let particles = [];
        const connectionDistance = 100; // Khoảng cách để nối dây
        const moveSpeed = 0.5; // Tốc độ di chuyển

        // Tự động tính số lượng hạt dựa trên diện tích màn hình để tối ưu
        // Desktop nhiều hạt, Mobile ít hạt
        const calculateParticleCount = () => {
            return Math.floor((window.innerWidth * window.innerHeight) / 9000);
        };

        let particleCount = calculateParticleCount();

        // Class Hạt
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * moveSpeed;
                this.vy = (Math.random() - 0.5) * moveSpeed;
                this.size = Math.random() * 2 + 1; // Kích thước hạt 1-3px
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Chạm cạnh thì bật lại
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.fillStyle = "rgba(100, 100, 100, 0.5)"; // Màu hạt (xám nhạt)
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            particleCount = calculateParticleCount();
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Vẽ và cập nhật vị trí hạt
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Vẽ đường nối (hiệu ứng 3D mesh)
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 100, 100, ${1 - distance / connectionDistance})`; // Mờ dần khi xa
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        // Khởi chạy
        init();
        animate();

        // Xử lý khi resize màn hình
        const handleResize = () => {
            init();
        };

        window.addEventListener("resize", handleResize);

        // CLEANUP FUNCTION (Quan trọng để tiết kiệm Memory)
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 bg-bg-main"
            style={{ pointerEvents: "none" }} // Để chuột click xuyên qua background
        />
    );
};

export default ParticleBackground;