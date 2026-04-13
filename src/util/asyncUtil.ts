export default class AsyncUtil {

    /**
     * setTimeout(0)을 이용해 resolve 호출 로직을 task queue 맨 뒤로 보냅니다.
     * await을 통해 한 틱 동안 기다린 후 비동기 로직 등 원하는 로직을 실행할 수 있습니다.
     */
    static waitForTick() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
}