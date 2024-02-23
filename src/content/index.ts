import { loadConfig } from "../config";
import { runtime } from "webextension-polyfill";

(async () => {
    const config = await loadConfig();
    const videoEl = document.createElement("video");
    let videoLink = "";
    let alignRate = 1;

    const attachVolume = async () => {
        document.dispatchEvent(new Event("brs-request-volume-attach"));
    };

    const detachVolume = () => {
        document.dispatchEvent(new Event("brs-request-volume-detach"));
    }

    const selectVideo = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";
        input.addEventListener("change", () => {
            if (!input.files) return;
            URL.revokeObjectURL(videoLink);
            videoLink = URL.createObjectURL(input.files[0]);
        });
        input.click();
    };
    runtime.onMessage.addListener(e => {
        if (e !== "selectVideo") return;
        selectVideo();
    });
    runtime.onMessage.addListener(e => {
        if (e !== "removeVideo") return;
        URL.revokeObjectURL(videoLink);
        videoLink = "";
    });

    const clearUp = (target?: HTMLVideoElement | null) => {
        detachVolume();
        if (target) {
            target.style.display = "";
            target.removeAttribute("brs-loaded");
        }
        videoEl.remove();
        videoEl.src = "";
    } 
    setInterval(() => {
        if (!config.isEnabled) return;
        const target = document.querySelector<HTMLVideoElement>(".bpx-player-primary-area video");

        if (!videoLink) {
            clearUp(target);
            return;
        }

        const syncTime = (force = false) => {
            if (!target) return;
            if (force) {
                if (config.forceAlign) {
                    alignRate = (videoEl.duration / target.duration) * target.playbackRate;
                    if (isNaN(alignRate)) alignRate = 1;
                    videoEl.playbackRate = alignRate;
                } else {
                    alignRate = 1;
                }
            }
            const rt = (target.currentTime + config.offset) * alignRate;
            if (Math.abs(videoEl.currentTime - rt) > 0.5 || force) {
                videoEl.currentTime = rt;
            }
        };

        if (!target) return;
        if (target.getAttribute("brs-loaded")) {
            if (videoEl.src == videoLink) return;
            clearUp(target);
        }
        if (!target.getAttribute("brs-initialized")) {
            target.addEventListener("play", () => {
                if (!videoLink) return;
                syncTime(true);
                videoEl.play();
            });
            target.addEventListener("pause", () => videoEl.pause());
            target.addEventListener("ratechange", () => {
                videoEl.playbackRate = target.playbackRate * alignRate;
            });
            target.addEventListener("timeupdate", () => {
                if (!videoLink) return;
                syncTime();
            });
            target.addEventListener("seeked", () => {
                if (!videoLink) return;
                syncTime(true);
            });
            target.addEventListener("loadedmetadata", () => {
                clearUp(target);
                URL.revokeObjectURL(videoLink);
                videoLink = "";
                if (config.autoPromptSelect) {
                    selectVideo();
                }
            });
            target.setAttribute("brs-initialized", "true");
        }

        videoEl.src = videoLink;

        videoEl.addEventListener("loadedmetadata", () => {
            syncTime(true);
            target.parentElement!.append(videoEl);
            target.style.display = "none";
            if (!target.paused) {
                videoEl.play();
            }
            attachVolume();
        }, {
            once: true
        });

        target.setAttribute("brs-loaded", "true");

    }, 1000);

    const script = document.createElement("script");
    script.src = runtime.getURL("/assets/host.js");
    script.addEventListener("load", e => {
        (e.target as any).remove();
    });
    (document.head || document.documentElement).appendChild(script);
})();
