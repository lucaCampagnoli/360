document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".cursor");
  let mouseX = 0,
    mouseY = 0;
  let posX = 0,
    posY = 0;
  let prevX = 0,
    prevY = 0;

  // position de la souris
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // boucle d'animation : suivi fluide + étirement selon la vitesse
  function animate() {
    posX += (mouseX - posX) * 0.25; // inertie (baisse = plus traînant)
    posY += (mouseY - posY) * 0.25;

    const dx = posX - prevX;
    const dy = posY - prevY;
    const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 30);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    cursor.style.left = posX + "px";
    cursor.style.top = posY + "px";
    cursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scaleX(${1 + speed / 20})`;

    prevX = posX;
    prevY = posY;
    requestAnimationFrame(animate);
  }
  animate();

  // grandit sur les éléments cliquables
  document.querySelectorAll("a, button, .card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () =>
      cursor.classList.remove("is-hover"),
    );
  });
});
