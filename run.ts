import { readFileSync } from "node:fs";
import { LiveData } from "./src/raw-types.ts";
import { getParkAttractions, getParks, removeKeywords } from "./src/utils.ts";

const json = readFileSync(new URL("./live.json", import.meta.url), "utf-8");
const data: LiveData = JSON.parse(json);

data.liveData.forEach((item) => {
  if (item.entityType === "PARK") {
    // console.log(`PARK: ${removeKeywords(item.name)}`)
    // console.log(item)
  } else if (item.entityType === "ATTRACTION") {
    // console.log(`ATTRACTION: ${item.name}, ${item.entityType}`);
    // console.log(item);
  } else if (item.entityType === "SHOW") {
    console.log(`SHOW: ${item.name}, ${item.entityType}`);
    console.log(item);
  } else if (item.entityType === "RESTAURANT") {
    // console.log(`RESTAURANT: ${item.name}, ${item.entityType}`)
    // console.log(item);
  } else {
    console.log(`UNKNOWN: ${item.name}, ${item.entityType}`);
  }
});

// const parks = getParks(data);
// parks.forEach((park) => {
//     console.log(`PARK: ${park.name}`);
//     const attractions = getParkAttractions(data, park.id);
//     attractions.forEach((attraction) => {
//         console.log(`  ATTRACTION: ${attraction.name}`);
//         console.log(`    Standby Wait: ${attraction.standbyWait}`);
//         console.log(
//             `    Return Start: ${attraction.returnStart?.toISOString() || ""}`,
//         );
//     });
// });
