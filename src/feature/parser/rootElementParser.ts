import { RootElements } from "../../type/elements";
import WaitableElementParser from "../../core/template/waitableElementParser";

class RootElementParser {

    private lastInformationDetail: Element | null = null;

    /**
     * RootElements에 해당하는 요소들을 파싱
     */
    async parseRootElements(): Promise<RootElements> {
        const parser = new WaitableElementParser<RootElements>();
        return await parser.parseElementsWhenAvailable(() => { return this.getRootElements(); });
    }

    private getRootElements(): RootElements | null {
        const root = Array.from(document.querySelectorAll('div[class^="video_information_container"]'))
            .filter(el => el.isConnected && getComputedStyle(el).display !== "none");
        const player = document.querySelector('div[id*="player_layout"]');
        const volumeControl = player?.querySelector(".pzp-pc__volume-control");

        if (root.length >= 2 && player && player.isConnected && volumeControl && volumeControl.isConnected) {
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