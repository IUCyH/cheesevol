import _ from "lodash";
import AsyncUtil from "../../util/asyncUtil";
import storage from "../../core/storage/channelStorage";
import Channel from "../../domain/channel";
import { PlayerElements } from "../../type/elements";
import cheesevolToast from "../../toast/cheesevolToast";

/**
 * 볼륨과 관련된 세부 로직을 구현하는 핸들러
 */
class VolumeHandler {

    private abortController: AbortController | null = null;
    private debouncedRestoreVolume = _.debounce(async (channelId: string, playerElements: PlayerElements) => {
        await this.restoreVolume(channelId, playerElements);
    }, 100);
    private debouncedSaveVolume = _.debounce(async (channel: Channel, playerElements: PlayerElements) => {
        await this.saveCurrentVolume(channel, playerElements);
    }, 150);

    initVolumeListener(channel: Channel, playerElements: PlayerElements, player: Element) {
        const { volumeSlider, muteButton } = playerElements;

        if (this.abortController) {
            // 기존 리스너가 존재한다면 전부 취소
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        window.addEventListener("keyup",
            (e) => this.handleMuteButtonKeyUp(e, channel, playerElements),
            { signal: this.abortController.signal }
        );
        player.addEventListener("keyup",
            (e) => this.handlePlayerKeyUp(e, channel, playerElements),
            { signal: this.abortController.signal }
        );
        volumeSlider.addEventListener("pointerdown",
            () => this.handleVolumeSliderPointerDown(channel, playerElements),
            { signal: this.abortController.signal }
        );
        muteButton.addEventListener("click",
            () => this.handleMuteButtonClick(channel, playerElements),
            { signal: this.abortController.signal }
        );
    }

    async restoreVolume(channelId: string, playerElements: PlayerElements) {
        const savedChannel = await storage.get(channelId);
        const video = playerElements.video;

        if (!savedChannel) {
            cheesevolToast.showToast("현재 채널은 볼륨이 저장되어 있지 않아요!\n볼륨을 한 번이라도 변경하면 자동 저장돼요.", video, 5000);
            return;
        }

        video.volume = savedChannel.channelVolume;
        video.dispatchEvent(new Event("volumechange"));

        cheesevolToast.showToast(`${savedChannel.channelName} 방송의 볼륨이 저장된 볼륨으로 설정되었어요: ${savedChannel.volumePercent}`, video);
    }

    private async handlePlayerKeyUp(e: Event, channel: Channel, playerElements: PlayerElements) {
        if (!(e instanceof KeyboardEvent)) {
            return;
        }

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            await AsyncUtil.waitForTick();
            this.debouncedSaveVolume(channel, playerElements);
        }
    }

    private handleVolumeSliderPointerDown(channel: Channel, playerElements: PlayerElements) {
        const handlePointerUp = async () => {
            await AsyncUtil.waitForTick();
            this.debouncedSaveVolume(channel, playerElements);
        };
        // signal: 혹시라도 이벤트가 삭제되지 않을 때를 대비해 확실하게 제거하기 위해 연결
        window.addEventListener("pointerup", handlePointerUp, { once: true, signal: this.abortController?.signal });
    }

    private async handleMuteButtonClick(channel: Channel, playerElements: PlayerElements) {
        await AsyncUtil.waitForTick();
        if (!playerElements.video.muted) { // 음소거 해제 시 현재 저장된 최신값으로 다시 볼륨 설정
            this.debouncedRestoreVolume(channel.channelId, playerElements);
        }
    }

    private async handleMuteButtonKeyUp(e: KeyboardEvent, channel: Channel, playerElements: PlayerElements) {
        await AsyncUtil.waitForTick();
        if (e.key === "m" && !playerElements.video.muted) { // 음소거 해제 시 현재 저장된 최신값으로 다시 볼륨 설정
            this.debouncedRestoreVolume(channel.channelId, playerElements);
        }
    }

    private async saveCurrentVolume(channel: Channel, playerElements: PlayerElements) {
        const video = playerElements.video;
        const volumeSlider = playerElements.volumeSlider;
        const ariaValue = volumeSlider.ariaValueNow;

        if(ariaValue === null) {
            throw new Error("aria-value-now attribute not found");
        }

        const newVolume = Number(ariaValue) / 100;
        channel.updateVolume(video.muted ? 0 : newVolume);
        await storage.save(channel);

        cheesevolToast.showToast(`${ channel.channelName } 방송의 볼륨이 업데이트되었어요: ${ channel.volumePercent }`, video);
    }
}

export default new VolumeHandler();