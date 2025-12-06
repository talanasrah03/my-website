const wave = document.querySelector(".mouse-wave");

let timeout;
document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;

    wave.style.backgroundPosition = `${x}% ${y}%`;
    wave.style.opacity = 1;
    wave.style.transform = "scale(1.4)";

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        wave.style.opacity = 0;
        wave.style.transform = "scale(1)";
    }, 120);
});






