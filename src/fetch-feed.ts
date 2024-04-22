import { fetchUrlInfo } from "./fetch-url-info";
import * as Option from "fp-ts/lib/Option";
import { xml2js, Element } from "xml-js";
import { findAll, findOne, text } from "./xml-utils";
import fetch from "node-fetch";
import Parser from "rss-parser";

export const fetchFeed = async (hostname: string): Promise<RssItem[]> => {
  const urlInfo = await fetchUrlInfo(hostname);
  if (Option.isNone(urlInfo)) return [];
  const res = await fetch(urlInfo.value.rssUrl);
  if (!res.ok) return [];
  const xml = await res.text();
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
          description: mediaContent.join('')?.trim(),
          link: item.link,
          pubDate: item.pubDate,
          guid: item.guid,
        };
      }
    }

    if ('description' in item) {
      return {
        title: item.title as string,
        description: (item['description'] as string)?.trim(),
        link: item.link,
        pubDate: item.pubDate,
        guid: item.guid,
      };
    }


    if ('content:encoded' in item) {
      return {
        title: item.title as string,
        description: (item['content:encoded'] as string)?.trim(),
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
