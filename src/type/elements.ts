/**
 * DOM 파싱에서 필수적으로 필요한 루트 요소들
 */
export interface RootElements {
    readonly informationDetail: Element;
    readonly player: Element;
    readonly volumeControl: Element;
}

/**
 * Player 요소 중 볼륨 조절에 필요한 요소들
 */
export interface PlayerElements {
    readonly video: HTMLVideoElement;
    readonly volumeSlider: Element;
    readonly muteButton: Element;
}