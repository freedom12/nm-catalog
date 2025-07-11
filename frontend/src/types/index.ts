export interface LangTitleObject {
  title_de_DE: string;
  title_en_US: string;
  title_es_ES: string;
  title_fr_FR: string;
  title_it_IT: string;
  title_ja_IP: string;
  title_ko_KR: string;
  title_zh_CN: string;
  title_zh_TW: string;
}

export interface Game extends LangTitleObject {
  id: string;
  year: number;
  hardware: string;
  link: string;
  img: string;
  inserted: number;
}

export interface GameGroup {
  name: string;
  games: Game[];
}

export interface Track extends LangTitleObject {
  id: string;
  gid: string;
  idx: number;
  duration: string;
  isloop: number;
  isbest: number;
  img: string;
}

export interface Lang {
  id: string;
  desc: string;
}

export interface Hardware {
  name: string;
  year: number;
}
