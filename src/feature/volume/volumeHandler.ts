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

    initVolumeListener(channel: Channel, playerElements: PlayerElements) {
        const { volumeSlider, muteButton } = playerElements;

        if (this.abortController) {
            // 기존 리스너가 존재한다면 전부 취소
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        volumeSlider.addEventListener("pointerdown",
            () => this.handleVolumeSliderPointerDown(channel, playerElements),
            { signal: this.abortController.signal }
        );
        muteButton.addEventListener("click",
            () => this.handleMuteButtonClick(channel, playerElements),
            { signal: this.abortController.signal }
        );
    }

    async restoreVolume(channelId: string, volumeControl: Element, playerElements: PlayerElements) {
        const savedChannel = await storage.get(channelId);
        if (!savedChannel) {
            cheesevolToast.showToast("현재 채널은 볼륨이 저장되어 있지 않아요!\n볼륨을 한 번이라도 변경하면 자동 저장돼요.", playerElements.video, 4000);
            return;
        }

        playerElements.video.volume = savedChannel.channelVolume;
        playerElements.video.dispatchEvent(new Event('volumechange'));

        cheesevolToast.showToast(`${savedChannel.channelName} 방송의 볼륨이 저장된 볼륨으로 설정되었어요: ${savedChannel.volumePercent}%`, playerElements.video);
    }

    private handleVolumeSliderPointerDown(channel: Channel, playerElements: PlayerElements) {
        const handlePointerUp = async () => {
            await this.saveCurrentVolume(channel, playerElements.video);
        };
        // signal: 혹시라도 이벤트가 삭제되지 않을 때를 대비해 확실하게 제거하기 위해 연결
        window.addEventListener("pointerup", handlePointerUp, { once: true, signal: this.abortController?.signal });
    }

    private async handleMuteButtonClick(channel: Channel, playerElements: PlayerElements) {
        // 뮤트 버튼은 콜백 호출 시점에 내부 처리가 아직 끝나지 않았을 수 있으므로 강제로 한 틱 대기
        await AsyncUtil.waitForTick();
        await this.saveCurrentVolume(channel, playerElements.video);
    }

    private async saveCurrentVolume(channel: Channel, video: HTMLVideoElement) {
        channel.updateVolume(video.muted ? 0.0 : video.volume);
        await storage.save(channel);

        cheesevolToast.showToast(`${channel.channelName} 방송의 볼륨이 업데이트되었어요: ${channel.volumePercent}%`, video);
    }
}

export default new VolumeHandler();