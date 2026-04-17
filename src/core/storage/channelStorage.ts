import Channel from "../../domain/channel";
import { ChannelData } from "./dto/channelData";
import _ from "lodash";

class ChannelStorage {

    private debouncedSave = _.debounce(async (channel: Channel, beforeHandler: () => any | Promise<any>, afterHandler: (arg: any) => void | Promise<void>) => {
        const result = await beforeHandler();
        await this.save(channel);
        await afterHandler(result);
    }, 150);

    debounceSave<T>(channel: Channel, beforeHandler: () => T | Promise<T>, afterHandler: (arg: T) => void | Promise<void>){
        this.debouncedSave(channel, beforeHandler, afterHandler);
    }

    async save(channel: Channel) {
        const data: ChannelData = { name: channel.channelName, profileUrl: channel.channelProfileUrl, volume: channel.channelVolume };
        const channels = await this.getChannels();

        channels[channel.channelId] = data;
        await chrome.storage.local.set({ channels });
    }

    async get(id: string): Promise<Channel | null> {
        const channels = await this.getChannels();
        if (!channels[id]) {
            return null;
        }

        const channel = new Channel(id, channels[id].name, channels[id].profileUrl);
        channel.updateVolume(channels[id].volume);
        return channel;
    }

    private async getChannels() {
        const result = await chrome.storage.local.get(["channels"]);
        return (result.channels ?? {}) as Record<string, ChannelData>;
    }
}

export default new ChannelStorage();
