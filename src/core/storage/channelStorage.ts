import Channel from "../../domain/channel";
import { ChannelData } from "./dto/channelData";

class ChannelStorage {

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
