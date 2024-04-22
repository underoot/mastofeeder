import { fetchUrlInfo } from "./fetch-url-info";
import * as Option from "fp-ts/lib/Option";
import fetch from "node-fetch";
import Parser from "rss-parser";
import { decode as decodeWin1251 } from "./win-1251";

export const fetchFeed = async (hostname: string): Promise<RssItem[]> => {
  const urlInfo = await fetchUrlInfo(hostname);
  if (Option.isNone(urlInfo)) return [];
  const res = await fetch(urlInfo.value.rssUrl);

  if (!res.ok) return [];

  let xml = '';

  if (res.headers.get('content-type')?.includes('windows-1251')) {
    xml = decodeWin1251(await res.buffer());
  } else {
    xml = await res.text();
  }

  const items = await parseRssItems(xml);
  return items;
};

export type RssItem = (
  | { title?: string; description: string }
  | { title: string; description?: string }
) & {
  link?: string;
  pubDate?: string;
  guid?: string;
};

export const parseRssItems = async (xml: string): Promise<RssItem[]> => {
  const parser = new Parser({
    customFields: {
      item: ["media:group"],
    },
  });
  const feed = await parser.parseString(xml);

  return feed.items.map((item) => {
    if ('media:group' in item) {
      const mediaGroup = item['media:group'];
      const mediaContent = mediaGroup['media:description'];
      if (mediaContent) {
        return {
          title: item.title as string,
          description: mediaContent.join('')?.trim().replace('\n', '<br>'),
          link: item.link,
          pubDate: item.pubDate,
          guid: item.guid,
        };
      }
    }

    if ('content' in item) {
      return {
        title: item.title as string,
        description: (item['content'] as string)?.trim().replace('\n', '<br>'),
        link: item.link,
        pubDate: item.pubDate,
        guid: item.guid,
      };
    }

    if ('description' in item) {
      return {
        title: item.title as string,
        description: (item['description'] as string)?.trim().replace('\n', '<br>'),
        link: item.link,
        pubDate: item.pubDate,
        guid: item.guid,
      };
    }


    if ('content:encoded' in item) {
      return {
        title: item.title as string,
        description: (item['content:encoded'] as string)?.trim().replace('\n', '<br>'),
        link: item.link,
        pubDate: item.pubDate,
        guid: item.guid,
      };
    }

    return {
      title: item.title as string,
      description: item.content?.trim(),
      link: item.link,
      pubDate: item.pubDate,
      guid: item.guid,
    };
  });
};
