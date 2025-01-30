import { EntityDetails, LiveData } from "./src/raw-types";
import { Attraction, Park, Restaurant, Show } from "./src/types";
import {
  addDistanceToEntity,
  addLocationToEntity,
  organizeData,
  sortAttractionsByReturn,
  sortAttractionsByWait,
  sortEntitiesByDistance,
} from "./src/utils";

const LIVE_FEED_URL =
  "https://api.themeparks.wiki/v1/entity/e957da41-3552-4cf6-b636-5babc5cbc4e5/live";
const buildEntityUrl = (id: string) =>
  `https://api.themeparks.wiki/v1/entity/${id}`;

let data: LiveData | null = null;
let selectedPark: string | null = null;
let attractionListOption: string = "SHORTEST";
let showListOption: string = "SHORTEST";
let restaurantListOption: string = "SHORTEST";
let location: [number, number] | null = null;
let locationData: Record<string, [number, number]> = {};

const parkSelector: HTMLSelectElement | null =
  document.querySelector("#park-list");
const attractionList: HTMLTableSectionElement | null =
  document.querySelector("#attraction-list");
const attractionListOptions: HTMLSelectElement | null = document.querySelector(
  "#attraction-list-options",
);
const restaurantList: HTMLTableSectionElement | null =
  document.querySelector("#restaurant-list");
const restaurantListOptions: HTMLSelectElement | null = document.querySelector(
  "#restaurant-list-options",
);
const showList: HTMLTableSectionElement | null =
  document.querySelector("#show-list");
const showListOptions: HTMLSelectElement | null =
  document.querySelector("#show-list-options");

const setup = () => {
  if (!parkSelector) return;
  parkSelector.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    selectedPark = target.value;
    render(data);
  });
  if (!attractionListOptions) return;
  attractionListOptions.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    attractionListOption = target.value;
    render(data);
  });
  if (!showListOptions) return;
  showListOptions.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    showListOption = target.value;
    render(data);
  });
  if (!restaurantListOptions) return;
  restaurantListOptions.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    restaurantListOption = target.value;
    render(data);
  });
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      location = [position.coords.latitude, position.coords.longitude];
      render(data);
    });
    navigator.geolocation.watchPosition((position) => {
      location = [position.coords.latitude, position.coords.longitude];
      render(data);
    });
  }
};

const fetchData = async (): Promise<LiveData | null> =>
  fetch(LIVE_FEED_URL)
    .then((res) => (console.log(`data loaded ${new Date()}`), res.json()))
    .catch((err) => (alert(`Failed to load data: ${err}`), null));

const fetchLocationData = async (
  id: string,
): Promise<[number, number] | null> =>
  fetch(buildEntityUrl(id))
    .then((res) => res.json() as Promise<EntityDetails>)
    .then(
      (d) => (locationData[id] = [d.location.latitude, d.location.longitude]),
    )
    .catch(() => null);

const getLocationData = async () => {
  if (!data) return;
  const entities = data.liveData.filter((e) => e.parkId === selectedPark);
  const entity = entities.find(
    (e) => !Object.keys(locationData).includes(e.id),
  );
  if (!entity) return;
  const location = await fetchLocationData(entity.id);
  if (location) locationData[entity.id] = location;
  render(data);
};

const save = (d: LiveData | null) => ((data = d ? d : data), data);

const render = (d: LiveData | null) => {
  if (!d) return;
  const data = organizeData(d);
  if (!selectedPark) selectedPark = data.parks[0].id;
  renderParkList(data.parks);
  let attractions = data.parkAttractions[selectedPark];
  let locatedAttrs = attractions.map((a) =>
    addLocationToEntity(a, locationData),
  );
  let attrsWithDist = locatedAttrs.map((a) => addDistanceToEntity(a, location));
  if (attractionListOption === "SHORTEST")
    attrsWithDist = sortAttractionsByWait(attrsWithDist);
  else if (attractionListOption === "SOONEST")
    attrsWithDist = sortAttractionsByReturn(attrsWithDist);
  else if (attractionListOption === "NEAREST")
    attrsWithDist = sortEntitiesByDistance(attrsWithDist);
  renderAttractions(attrsWithDist);

  let restaurants = data.parkRestaurants[selectedPark];
  let locatedRests = restaurants.map((a) =>
    addLocationToEntity(a, locationData),
  );
  let restsWithDist = locatedRests.map((a) => addDistanceToEntity(a, location));
  if (restaurantListOption === "SHORTEST")
    restsWithDist = sortAttractionsByWait(restsWithDist);
  else if (restaurantListOption === "NEAREST")
    restsWithDist = sortEntitiesByDistance(restsWithDist);
  renderRestaurants(restsWithDist);

  let shows = data.parkShows[selectedPark];
  let locatedShows = shows.map((a) => addLocationToEntity(a, locationData));
  let showsWithDist = locatedShows.map((a) => addDistanceToEntity(a, location));
  if (showListOption === "SHORTEST")
    showsWithDist = sortAttractionsByWait(showsWithDist);
  else if (showListOption === "SOONEST")
    showsWithDist = sortAttractionsByReturn(showsWithDist);
  else if (showListOption === "NEAREST")
    showsWithDist = sortEntitiesByDistance(showsWithDist);
  renderShows(showsWithDist);
};

const renderParkList = (parks: Park[]) => {
  if (!parkSelector) return;
  parkSelector.innerHTML = "";
  parks.forEach((park) => {
    const option: HTMLOptionElement = document.createElement("option");
    option.innerText = park.name;
    option.value = park.id;
    option.selected = park.id === selectedPark;
    parkSelector.appendChild(option);
  });
};

const renderAttractions = (
  attractions: (Attraction & { distance: number | null })[],
) => {
  if (!attractionList) return;
  attractionList.innerHTML = "";
  attractions.forEach((attraction) => {
    const tr: HTMLTableRowElement = document.createElement("tr");
    const name = document.createElement("td");
    name.innerText = attraction.name;
    tr.appendChild(name);
    const standbyWait = document.createElement("td");
    standbyWait.innerText = `${attraction.standbyWait ?? ""}`;
    tr.appendChild(standbyWait);
    const returnStart = document.createElement("td");
    returnStart.innerText = `${attraction.returnStart?.toLocaleTimeString() ?? ""}`;
    tr.appendChild(returnStart);
    const distance = document.createElement("td");
    distance.innerText = `${attraction.distance ? Math.round(attraction.distance * 1000) : ""}`;
    tr.appendChild(distance);
    attractionList.appendChild(tr);
  });
};

const renderShows = (shows: (Show & { distance: number | null })[]) => {
  if (!showList) return;
  showList.innerHTML = "";
  shows.forEach((show) => {
    const tr: HTMLTableRowElement = document.createElement("tr");
    const name = document.createElement("td");
    name.innerText = show.name;
    tr.appendChild(name);
    const standbyWait = document.createElement("td");
    standbyWait.innerText = `${show.standbyWait ?? ""}`;
    tr.appendChild(standbyWait);
    const returnStart = document.createElement("td");
    returnStart.innerText = `${show.returnStart?.toLocaleTimeString() ?? ""}`;
    tr.appendChild(returnStart);
    const showTimes = document.createElement("td");
    showTimes.innerHTML = show.showTimes
      .map((t) => `<div>${t.toLocaleTimeString()}</div>`)
      .join("");
    tr.appendChild(showTimes);
    const distance = document.createElement("td");
    distance.innerText = `${show.distance ? Math.round(show.distance * 1000) : ""}`;
    tr.appendChild(distance);
    showList.appendChild(tr);
  });
};

const renderRestaurants = (
  rs: (Restaurant & { distance: number | null })[],
) => {
  if (!restaurantList) return;
  restaurantList.innerHTML = "";
  rs.forEach((r) => {
    const tr: HTMLTableRowElement = document.createElement("tr");
    const name = document.createElement("td");
    name.innerText = r.name;
    tr.appendChild(name);
    const standbyWait = document.createElement("td");
    standbyWait.innerText = `${r.standbyWait ?? ""}`;
    tr.appendChild(standbyWait);
    const partyWait = document.createElement("td");
    partyWait.innerHTML = r.partyWait
      .map((pw) => `<div>${pw[0]}:${pw[1]}</div>`)
      .join("");
    tr.appendChild(partyWait);
    const distance = document.createElement("td");
    distance.innerText = `${r.distance ? Math.round(r.distance * 1000) : ""}`;
    tr.appendChild(distance);
    restaurantList.appendChild(tr);
  });
};

setup();
setInterval(() => fetchData().then(save).then(render), 60000);
fetchData().then(save).then(render);
setInterval(() => getLocationData(), 500);
