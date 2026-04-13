class CheesevolToast {

    private readonly toastClassName = "cheesevol-toast";

    showToast(message: string, video: HTMLVideoElement, durationMs: number = 3000) {
        const root = video.parentElement;
        if (!root) {
            throw new Error("Video element's parent not found");
        }

        this.clearOldToast(root);

        const toast = document.createElement("div");
        toast.className = this.toastClassName;
        toast.textContent = message;

        Object.assign(toast.style, {
            position: "absolute",
            top: "15px",
            right: "15px",
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "#00FFA3",
            color: "#1A0E0E",
            fontSize: "16px",
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