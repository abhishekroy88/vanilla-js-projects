const slider = document.querySelector(".slider");

let slides = document.querySelectorAll(".slide");
const getSlides = () => document.querySelectorAll(".slide");

const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

const originalCount = slides.length;
let index = originalCount;
let areControlsAllowed = true;

for (let i = 0; i < slides.length; i++) {
  slider.append(slides[i].cloneNode(true));
  slider.prepend(slides[slides.length - i - 1].cloneNode(true));
}

slider.style.transform = `translateX(${
  -originalCount * slides[0].clientWidth
}px)`;

prevBtn.addEventListener("click", () => {
  if (areControlsAllowed) moveSlides(-1);
});

nextBtn.addEventListener("click", () => {
  if (areControlsAllowed) moveSlides();
});

slider.addEventListener("transitionstart", () => {
  areControlsAllowed = false;
});

slider.addEventListener("transitionend", () => {
  if (index >= originalCount * 2) {
    slider.style.transition = "none";
    slider.style.transform = `translateX(${
      -(index - originalCount) * getSlides()[0].clientWidth
    }px)`;

    index -= originalCount;
  } else if (index < originalCount) {
    slider.style.transition = "none";
    slider.style.transform = `translateX(${
      -(index + originalCount) * getSlides()[0].clientWidth
    }px)`;

    index += originalCount;
  }

  areControlsAllowed = true;
});

function moveSlides(dir = 1) {
  const slideWidth = getSlides()[0].clientWidth;
  let shiftCount;

  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );

  if (vw > 1000) {
    shiftCount = 4;
  } else if (vw > 750) {
    shiftCount = 3;
  } else if (vw > 500) {
    shiftCount = 2;
  } else {
    shiftCount = 1;
  }

  const currentTranslateX = Number(
    slider.style.transform.split("(")[1].slice(0, -3)
  );

  index += shiftCount * dir;

  slider.style.transition = "transform 1s";
  slider.style.transform = `translateX(${
    currentTranslateX - slideWidth * shiftCount * dir
  }px)`;
}
