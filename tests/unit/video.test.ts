import { describe, expect, it } from "vitest";
import { idDoYoutube, urlEmbedYoutube } from "@/lib/video";

const ID = "dQw4w9WgXcQ";

describe("idDoYoutube", () => {
  it.each([
    [ID],
    [` ${ID} `],
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://m.youtube.com/watch?v=${ID}&t=10s`],
    [`https://youtu.be/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://youtube.com/shorts/${ID}`],
    [`https://www.youtube-nocookie.com/embed/${ID}`],
  ])("extrai o id de %s", (link) => {
    expect(idDoYoutube(link)).toBe(ID);
  });

  it.each([
    [null],
    [undefined],
    [""],
    ["não é um link"],
    ["https://vimeo.com/123456"],
    ["https://www.youtube.com/watch?v=curto"],
    ["https://www.youtube.com/channel/abc"],
  ])("devolve null para %s", (link) => {
    expect(idDoYoutube(link)).toBeNull();
  });
});

describe("urlEmbedYoutube", () => {
  it("usa o domínio sem cookies", () => {
    expect(urlEmbedYoutube(ID)).toMatch(
      new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${ID}\\?`),
    );
  });
});
