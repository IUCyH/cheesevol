import volumeHandler from "./volumeHandler";
import Channel from "../../domain/channel";
import { PlayerElements, RootElements } from "../../type/elements";
import WaitableElementParser from "../../core/template/waitableElementParser";

/**
 * 볼륨 관련 기능을 제공하는 모듈
 */
class VolumeManager {

    async initVolume(channel: Channel, rootElements: RootElements) {
        const playerElements = await this.parsePlayerElements(rootElements.player, rootElements.volumeControl);
        volumeHandler.initVolumeListener(channel, playerElements);

        playerElements.video.addEventListener("playing", async () => {
            setTimeout(() => void volumeHandler.restoreVolume(channel.channelId, playerElements), 800);
        }, { once: true });
    }

    private async parsePlayerElements(player: Element, volumeControl: Element): Promise<PlayerElements> {
        const parser = new WaitableElementParser<PlayerElements>();
        return parser.parseElementsWhenAvailable(() => {
            const video = player.querySelector("video");
            const volumeSlider = volumeControl.querySelector(".pzp-pc__volume-slider, .pzp-pc-volume-slider, .pzp-ui-slider--volume");
            const muteButton = volumeControl.querySelector(".pzp-pc-volume-button, .pzp-pc__volume-button, .pzp-volume-button");

            if (!video || !volumeSlider || !muteButton) {
                return null;
            }

            return { video: video, volumeSlider: volumeSlider, muteButton: muteButton };
        });
    }
}

export default new VolumeManager();