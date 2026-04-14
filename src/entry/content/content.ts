import channelParser from "../../feature/parser/channelParser";
import rootElementParser from "../../feature/parser/rootElementParser";
import volumeManager from "../../feature/volume/volumeManager";

const livePath = "chzzk.naver.com/live";
let isInitialized = false;
let currentUrl = location.href;

async function init() {
    const rootElements = await rootElementParser.parseRootElementsWhenAvailable();
    const channel = channelParser.parseChannel(rootElements.informationDetail);
    await volumeManager.initVolume(channel, rootElements);

    console.log("CheeseVol initialized");
}
if (!isInitialized) {
    isInitialized = true;
    currentUrl = location.href; // 혹시 모를 버그 방지를 위해 명시적으로 다시 초기화

    if (currentUrl.includes(livePath)) {
        await init(); // 첫 로드 시 앱 초기화
    }

    // SPA 대응, 페이지가 변경되지 않더라도 URL이 변경된다면 다시 앱 초기화
    window.navigation.addEventListener("navigate", async (event) => {
        const destUrl = event.destination.url;
        if (destUrl !== currentUrl && destUrl.includes(livePath)) {
            currentUrl = destUrl;
            await init();
        }
    });
}
