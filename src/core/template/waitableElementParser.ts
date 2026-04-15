import AsyncUtil from "../../util/asyncUtil";

export default class WaitableElementParser<T> {

    private waitingObserver: MutationObserver | null = null;
    private waitingTimeout: number | null = null;

    /**
     * elementFinder()를 실행하여 해당하는 요소들을 파싱하되, 해당 요소들이 생성될 때까지 대기 후 파싱합니다.
     * @param waitingTimeMs 최대 대기 시간, 해당 시간이 지나면 자동으로 파싱이 취소되고 예외가 발생합니다.
     * @param elementFinder 파싱 로직을 담는 함수
     */
    async parseElementsWhenAvailable(elementFinder: () => T | null, waitingTimeMs: number = 60000): Promise<T> {
        this.clear();

        await AsyncUtil.waitForTick();
        return new Promise((resolve, reject) => {
            this.waitingTimeout = setTimeout(() => {
                this.clear();
                reject(new Error("Waiting time over: Elements not found"));
            }, waitingTimeMs); // 무한 대기 방지

            this.waitingObserver = new MutationObserver((mutations, obs) => {
                const elements = elementFinder();
                if (elements) {
                    this.clear();
                    resolve(elements);
                }
            });

            this.waitingObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    /**
     * <p>현재 사용중인 mutation observer 및 timeout 제거</p>
     * <p>인자로 넘어온 observer과 필드인 waitingObserver를 모두 제거합니다. timeout이 존재한다면 해당 timeout도 제거합니다.</p>
     * @param obs 콜백 내부 등에서 인자로 얻은 observer, 없다면 생략 (경우에 따라 waitingObserver과 같은 객체를 참조할 수 있습니다.)
     */
    private clear(obs?: MutationObserver) {
        obs?.disconnect();
        this.waitingObserver?.disconnect();
        this.waitingObserver = null;

        if (this.waitingTimeout) {
            clearTimeout(this.waitingTimeout);
            this.waitingTimeout = null;
        }
    }
}