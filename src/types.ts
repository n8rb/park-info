export type Park = {
  id: string;
  name: string;
};

export type Attraction = {
  id: string;
  name: string;
  standbyWait: number | null;
  returnStart: Date | null;
};

export type Restaurant = {
  id: string;
  name: string;
  standbyWait: number | null;
  partyWait: [number, number][];
};

export type Show = {
  id: string;
  name: string;
  standbyWait: number | null;
  returnStart: Date | null;
  showTimes: Date[];
};

export type Data = {
  parks: Park[];
  parkAttractions: Record<Park["id"], Attraction[]>;
  parkRestaurants: Record<Park["id"], Restaurant[]>;
  parkShows: Record<Park["id"], Show[]>;
};
