(() => {
    const attachVolume = (target: HTMLVideoElement, videoEl: HTMLVideoElement) => {
        target.addEventListener("volumechange", e => {
            e.stopImmediatePropagation();
            e.preventDefault();
        }, {
            once: true,
            capture: true
        });
        videoEl.volume = target.volume;
        target.volume = 0;
        Object.defineProperty(target, "volume", {
            configurable: true,
            enumerable: true,
            get() {
                return videoEl.volume;
            },
            set(v) {
                videoEl.volume = v;
            }
        });
    };
    document.addEventListener("brs-request-volume-attach", () => {
        const target = document.querySelector<HTMLVideoElement>(".bpx-player-primary-area video");
        const videoEl = target?.nextElementSibling as HTMLVideoElement;
        if (!target || !videoEl) return;
        if (target.getAttribute("brs-volume-hooked") === "attached") return;
        attachVolume(target, videoEl);
        target.setAttribute("brs-volume-hooked", "attached");
    });
    document.addEventListener("brs-request-volume-detach", () => {
        const target = document.querySelector<HTMLVideoElement>(".bpx-player-primary-area video");
        const videoEl = target?.nextElementSibling as HTMLVideoElement;
        if (target) {
            delete (target as any).volume;
            if (videoEl) {
                target.volume = videoEl.volume;
            }
            target.setAttribute("brs-volume-hooked", "detached");
        }
    });
})();