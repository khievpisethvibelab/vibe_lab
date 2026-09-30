document.addEventListener("DOMContentLoaded", () => {
    const carousels = [...document.querySelectorAll("[data-carousel]")];

    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxClose = document.querySelector(".lightbox-close");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");

    let activeCarousel = null;
    let activeIndex = 0;

    carousels.forEach((carousel) => {
        const viewport = carousel.querySelector(".carousel-slides");
        const slides = [...carousel.querySelectorAll(".carousel-slide")];
        const prev = carousel.querySelector(".carousel-prev");
        const next = carousel.querySelector(".carousel-next");
        const dotsWrap = carousel.querySelector(".carousel-dots");

        let current = 0;
        let startX = 0;
        let dragging = false;
        let moved = false;

        // Create dots
        slides.forEach((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", `Go to image ${index + 1}`);

            dot.addEventListener("click", (event) => {
                event.stopPropagation();
                goTo(index);
            });

            dotsWrap.appendChild(dot);
        });

        const dots = [...dotsWrap.querySelectorAll(".carousel-dot")];

        function render() {
            viewport.style.transform = `translateX(${-current * 100}%)`;

            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === current);
            });
        }

        function goTo(index) {
            current = Math.max(
                0,
                Math.min(index, slides.length - 1)
            );

            render();
        }

        function nextImage() {
            goTo((current + 1) % slides.length);
        }

        function previousImage() {
            goTo(
                (current - 1 + slides.length) %
                slides.length
            );
        }

        // LEFT ARROW
        if (prev) {
            prev.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                previousImage();
            });
        }

        // RIGHT ARROW
        if (next) {
            next.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                nextImage();
            });
        }

        // Swipe / drag
        viewport.addEventListener("pointerdown", (event) => {
            dragging = true;
            moved = false;
            startX = event.clientX;

            viewport.classList.add("is-dragging");

            if (viewport.setPointerCapture) {
                viewport.setPointerCapture(event.pointerId);
            }
        });

        viewport.addEventListener("pointermove", (event) => {
            if (!dragging) return;

            if (Math.abs(event.clientX - startX) > 8) {
                moved = true;
            }
        });

        viewport.addEventListener("pointerup", (event) => {
            if (!dragging) return;

            dragging = false;
            viewport.classList.remove("is-dragging");

            const distance = event.clientX - startX;

            if (Math.abs(distance) > 45) {
                if (distance < 0) {
                    nextImage();
                } else {
                    previousImage();
                }
            }
        });

        viewport.addEventListener("pointercancel", () => {
            dragging = false;
            viewport.classList.remove("is-dragging");
        });

        // Open image in lightbox
        slides.forEach((slide, index) => {
            slide.addEventListener("click", () => {
                if (moved) return;

                activeCarousel = {
                    slides,
                    goTo,
                    nextImage,
                    previousImage
                };

                activeIndex = index;

                lightboxImage.src = slide.dataset.full;
                lightboxImage.alt =
                    slide.querySelector("img").alt;

                lightbox.classList.add("is-open");
                lightbox.setAttribute("aria-hidden", "false");

                document.body.style.overflow = "hidden";
            });
        });

        // Show first image
        render();
    });

    // Close lightbox
    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    // Change image inside lightbox
    function changeLightboxImage(direction) {
        if (!activeCarousel) return;

        if (direction > 0) {
            activeCarousel.nextImage();
        } else {
            activeCarousel.previousImage();
        }

        activeIndex += direction;

        if (activeIndex < 0) {
            activeIndex =
                activeCarousel.slides.length - 1;
        }

        if (
            activeIndex >=
            activeCarousel.slides.length
        ) {
            activeIndex = 0;
        }

        const slide =
            activeCarousel.slides[activeIndex];

        lightboxImage.src = slide.dataset.full;

        lightboxImage.alt =
            slide.querySelector("img").alt;
    }

    // Lightbox close button
    if (lightboxClose) {
        lightboxClose.addEventListener(
            "click",
            closeLightbox
        );
    }

    // Lightbox previous
    if (lightboxPrev) {
        lightboxPrev.addEventListener(
            "click",
            () => changeLightboxImage(-1)
        );
    }

    // Lightbox next
    if (lightboxNext) {
        lightboxNext.addEventListener(
            "click",
            () => changeLightboxImage(1)
        );
    }

    // Close lightbox by clicking outside image
    if (lightbox) {
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
        if (
            !lightbox ||
            !lightbox.classList.contains("is-open")
        ) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            changeLightboxImage(-1);
        }

        if (event.key === "ArrowRight") {
            changeLightboxImage(1);
        }
    });
});
