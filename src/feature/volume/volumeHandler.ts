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
        this.syncVolumeUI(savedChannel, volumeControl);

        cheesevolToast.showToast(`${savedChannel.channelName} 방송의 볼륨이 저장된 볼륨으로 설정되었어요: ${savedChannel.volumePercent}%`, playerElements.video);
    }

    // 메서드 각 로직 더 공부해보기
    private syncVolumeUI(channel: Channel, volumeControl: Element) {
        const volume = channel.channelVolume;
        const volumePercent = channel.volumePercent;

        // 1. ARIA 슬라이더 값 업데이트
        const slider = volumeControl.querySelector('div[role="slider"]');
        if (slider) {
            slider.setAttribute('aria-valuenow', volumePercent.toString());
            slider.setAttribute('aria-valuetext', `${volumePercent} percent`);
        }

        // 2. 숨겨진 Input 값 업데이트 및 이벤트 발생 (치지직 내부 상태 반영용)
        const rangeInput = volumeControl.querySelector('input.pzp-ui-slider__aria-range') as HTMLInputElement;
        if (rangeInput) {
            rangeInput.value = volumePercent.toString();
            // UI를 그리는 스크립트가 input 이벤트를 감시할 수 있으므로 강제 발생
            rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // 3. 파란색 게이지(Progress Bar) 업데이트
        const progressBar = volumeControl.querySelector('.pzp-ui-progress__volume') as HTMLElement;
        if (progressBar) {
            progressBar.setAttribute('value', volume.toString());
            progressBar.style.setProperty('--pzp-ui-progress__scale', volume.toString());
        }

        // 4. 동그란 조절 버튼(Handler) 위치 업데이트
        const handler = volumeControl.querySelector('.pzp-ui-slider__handler-wrap') as HTMLElement;
        if (handler) {
            handler.style.left = `${volumePercent}%`;
        }
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