import volumeHandler from "./volumeHandler";
import Channel from "../../domain/channel";
import { PlayerElements, RootElements } from "../../type/elements";

/**
 * 볼륨 관련 기능을 제공하는 모듈
 */
class VolumeManager {

    async initVolume(channel: Channel, rootElements: RootElements) {
        const playerElements = this.getPlayerElements(rootElements.player, rootElements.volumeControl);
        volumeHandler.initVolumeListener(channel, playerElements);
        await volumeHandler.restoreVolume(channel.channelId, playerElements.video);
    }

    private getPlayerElements(player: Element, volumeControl: Element): PlayerElements {
        const video = player.querySelector("video");
        const volumeSlider = volumeControl.querySelector(".pzp-pc__volume-slider, .pzp-pc-volume-slider, .pzp-ui-slider--volume");
        const muteButton = volumeControl.querySelector(".pzp-pc-volume-button, .pzp-pc__volume-button, .pzp-volume-button");

        if (!video || !volumeSlider || !muteButton) {
            throw new Error("Player elements not found");
        }

        return { video: video, volumeSlider: volumeSlider, muteButton: muteButton };
    }
}

export default new VolumeManager();