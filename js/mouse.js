const bg = document.querySelector(".bg-img");

document.addEventListener("mousemove", (e) => {
    const x = (e.clientX - window.innerWidth / 2) / 45;
    const y = (e.clientY - window.innerHeight / 2) / 45;

    bg.style.transform =
        `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.59)`;
});



