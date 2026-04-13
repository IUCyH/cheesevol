import channelParser from "../../feature/parser/channelParser";
import rootElementParser from "../../feature/parser/rootElementParser";
import volumeManager from "../../feature/volume/volumeManager";

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

    await init(); // 첫 로드 시 앱 초기화
    // SPA 대응, 페이지가 변경되지 않더라도 URL이 변경된다면 다시 앱 초기화
    window.navigation.addEventListener("navigate", async (event) => {
        if (event.destination.url !== currentUrl) {
            currentUrl = event.destination.url;
            await init();
        }
    });
}
