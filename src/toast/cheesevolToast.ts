class CheesevolToast {

    private readonly toastClassName = "cheesevol-toast";

    showToast(message: string, video: HTMLVideoElement, durationMs: number = 3000) {
        const root = video.parentElement;
        if (!root) {
            throw new Error("Video element's parent not found");
        }

        if (getComputedStyle(root).position === "static") {
            root.style.position = "relative";
        }

        this.clearOldToast(root);

        const toast = document.createElement("div");
        toast.className = this.toastClassName;
        toast.textContent = message;

        Object.assign(toast.style, {
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 16px",
            borderRadius: "6px",
            backgroundColor: "#c09ee8",
            color: "#000000",
            fontFamily: "system-ui, sans-serif",
            fontSize: "16px",
            fontWeight: "bold",
            lineHeight: "1.5",
            textAlign: "center",
            whiteSpace: "pre-wrap",
            zIndex: "9999",
            pointerEvents: "none"
        });
        root.appendChild(toast);
        setTimeout(() => toast.remove(), durationMs);
    }

    private clearOldToast(root: Element) {
        const oldToast = root.querySelector(`.${this.toastClassName}`);
        if (oldToast) {
            oldToast.remove();
        }
    }
}

export default new CheesevolToast();