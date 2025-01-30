import { calcCrow } from "./crow";
import { LiveData } from "./raw-types";
import { Attraction, Data, Park, Restaurant } from "./types";

export const removeKeywords = (str: string) =>
  str
    .replace(`Walt Disney's`, "")
    .replace(`Disney's`, ``)
    .replace(`Water Park`, ``)
    .replace(`Theme Park`, ``)
    .replace(`Walt Disney World`, ``)
    .replace(`Park`, ``)
    .replace(/\s+/, " ")
    .trim();

export const getParks = (data: LiveData): Park[] =>
  data.liveData
    .filter((item) => item.entityType === "PARK")
    .map((item) => ({
      id: item.id,
      name: removeKeywords(item.name),
    }));

export const getParkAttractions = (
  data: LiveData,
  park: Park["id"],
): Attraction[] =>
  data.liveData
    .filter((item) => item.entityType === "ATTRACTION" && item.parkId === park)
    .map((item) => ({
      id: item.id,
      name: removeKeywords(item.name),
      standbyWait: item.queue?.STANDBY?.waitTime ?? null,
      returnStart: item.queue?.RETURN_TIME?.returnStart
        ? new Date(item.queue.RETURN_TIME.returnStart)
        : null,
    }));

export const getParkRestaurants = (
  data: LiveData,
  park: Park["id"],
): Restaurant[] =>
  data.liveData
    .filter((item) => item.entityType === "RESTAURANT" && item.parkId === park)
    .map((item) => ({
      id: item.id,
      name: removeKeywords(item.name),
      standbyWait: item.queue?.STANDBY?.waitTime ?? null,
      partyWait:
        item.diningAvailability?.map((x) => [x.partySize, x.waitTime]) ?? [],
    }));

export const getParkShows = (data: LiveData, park: Park["id"]) =>
  data.liveData
    .filter((item) => item.entityType === "SHOW" && item.parkId === park)
    .map((item) => ({
      id: item.id,
      name: removeKeywords(item.name),
      standbyWait: item.queue?.STANDBY?.waitTime ?? null,
      returnStart: item.queue?.RETURN_TIME?.returnStart
        ? new Date(item.queue.RETURN_TIME.returnStart)
        : null,
      showTimes: item.showtimes
        ? item.showtimes.map((x) => new Date(x.startTime))
        : [],
    }));

export const addLocationToEntity = <T extends { id: string }>(
  e: T,
  locations: Record<string, [number, number]>,
): T & { location: [number, number] | null } => ({
  ...e,
  location: locations[e.id],
});

export const addDistanceToEntity = <
  T extends { location: [number, number] | null },
>(
  e: T,
  location: [number, number] | null,
): T & { distance: number | null } => ({
  ...e,
  distance:
    location && e.location
      ? calcCrow(e.location[0], e.location[1], location[0], location[1])
      : null,
});

export const sortAttractionsByWait = <T extends { standbyWait: number | null }>(
  as: T[],
): T[] =>
  as
    .concat()
    .sort(
      (a, b) =>
        (a.standbyWait ?? Number.MAX_VALUE) -
        (b.standbyWait ?? Number.MAX_VALUE),
    );

export const sortAttractionsByReturn = <T extends { returnStart: Date | null }>(
  as: T[],
): T[] =>
  as
    .concat()
    .sort(
      (a, b) =>
        (a.returnStart?.getTime() ?? Number.MAX_VALUE) -
        (b.returnStart?.getTime() ?? Number.MAX_VALUE),
    );
export const sortEntitiesByDistance = <T extends { distance: number | null }>(
  as: T[],
): T[] =>
  as
    .concat()
    .sort(
      (a, b) =>
        (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE),
    );

export const organizeData = (data: LiveData): Data => {
  const d: Data = {
    parks: getParks(data),
    parkAttractions: {},
    parkRestaurants: {},
    parkShows: {},
  };
  d.parks.forEach((park) => {
    d.parkAttractions[park.id] = getParkAttractions(data, park.id);
    d.parkRestaurants[park.id] = getParkRestaurants(data, park.id);
    d.parkShows[park.id] = getParkShows(data, park.id);
  });

  return d;
};
