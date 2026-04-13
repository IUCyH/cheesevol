import { RootElements } from "../../type/elements";
import AsyncUtil from "../../util/asyncUtil";

class RootElementParser {

    private waitingObserver: MutationObserver | null = null;
    private lastInformationDetail: Element | null = null;

    /**
     * RootElements에 해당하는 요소들을 파싱하되, 해당 요소들이 생성될 때까지 대기 후 파싱합니다.
     * @param waitingTimeMs 최대 대기 시간, 해당 시간이 지나면 자동으로 파싱이 취소되고 예외가 발생합니다.
     */
    async parseRootElementsWhenAvailable(waitingTimeMs: number = 60000): Promise<RootElements> {
        if (this.waitingObserver) {
            this.waitingObserver.disconnect();
            this.waitingObserver = null;
        }

        await AsyncUtil.waitForTick();
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.waitingObserver?.disconnect();
                this.waitingObserver = null;
                reject(new Error("Waiting time over: Root elements not found"));
            }, waitingTimeMs); // 무한 대기 방지

            this.waitingObserver = new MutationObserver((mutations, obs) => {
                const elements = this.getRootElements();
                if (elements) {
                    clearTimeout(timeoutId);
                    obs.disconnect();
                    this.waitingObserver = null;

                    resolve(elements);
                }
            });

            this.waitingObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    private getRootElements(): RootElements | null {
        const root = document.querySelectorAll('div[class^="live_information_details"]');
        const player = document.querySelector('div[class^="live_information_player"]');
        const volumeControl = player?.querySelector(".pzp-pc__volume-control");

        if (root.length >= 2 && player && volumeControl) {
            const informationDetail = root[1];
            if (informationDetail === this.lastInformationDetail) {
                return null;
            }

            this.lastInformationDetail = informationDetail;
            return { informationDetail: informationDetail, player: player, volumeControl: volumeControl }
        }
        return null;
    }
}

export default new RootElementParser();