function wishBirthday() {
    const messages = [
        "🎉 Wishing you a day full of love and happiness!",
        "🎂 May your birthday be as sweet as cake!",
        "✨ Shine bright like the star you are!",
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    document.getElementById("message").innerText = messages[randomIndex];

    // Start confetti
    startConfetti();
}

// Simple confetti animation
function startConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiCount = 100;
    const confettis = [];

    for (let i = 0; i < confettiCount; i++) {
        confettis.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * confettiCount,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            tilt: Math.random() * 10 - 10,
        });
    }

    let angle = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < confettiCount; i++) {
            let c = confettis[i];
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + angle, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.r * 2);
            ctx.stroke();
        }

        angle += 0.02;
        for (let i = 0; i < confettiCount; i++) {
            let c = confettis[i];
            c.y += Math.cos(angle + c.d) + 1 + c.r / 2;
            c.x += Math.sin(angle);
            if (c.y > canvas.height) {
                c.y = -10;
                c.x = Math.random() * canvas.width;
            }
        }

        requestAnimationFrame(draw);
    }
    draw();
}
